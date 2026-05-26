import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";
import * as cheerio from "cheerio";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from common URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
      /(?:youtu\.be\/)([^&\s]+)/,
      /(?:youtube\.com\/embed\/)([^&\s]+)/,
      /(?:youtube\.com\/v\/)([^&\s]+)/,
      /(?:youtube\.com\/shorts\/)([^&\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      const matchVal = match?.[1];
      if (matchVal) {
        const id = matchVal.split("?")[0]?.split("&")[0];
        if (id) {
          return id;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the given URL matches a known valid YouTube URL pattern.
 */
export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  return patterns.some((p) => p.test(url));
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Fetches the full transcript of a YouTube video and returns it as a single
 * clean string. Returns null if the video has no captions or is inaccessible.
 */
export async function extractYouTubeTranscript(
  videoUrl: string
): Promise<string | null> {
  if (!isValidYouTubeUrl(videoUrl)) {
    console.warn("⚠️ extractYouTubeTranscript: invalid YouTube URL:", videoUrl);
    return null;
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    console.warn("⚠️ Could not extract video ID from URL:", videoUrl);
    return null;
  }

    try {
    console.log(`🎥 Fetching YouTube transcript (primary) for video: ${videoId}`);
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    if (segments && segments.length > 0) {
      const text = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
      if (!text) {
        console.warn('⚠️ Primary transcript extracted is empty after cleaning');
        return null;
      }
      console.log(`✅ Primary transcript extracted (${text.length} chars)`);
      return text;
    }
  } catch (err: any) {
    console.warn('⚠️ Primary transcript extraction failed:', err.message);
  }

  // Fallback: fetch captions via YouTube timedtext API (XML)
  try {
    console.log(`🎥 Fetching YouTube transcript (fallback) for video: ${videoId}`);
    const captionRes = await axios.get(
      `https://www.youtube.com/api/timedtext`,
      {
        params: { lang: 'en', v: videoId },
        timeout: 10000,
      }
    );
    const xml = captionRes.data as string;
    const matches = [...xml.matchAll(/<text[^>]*>([^<]*)<\/text>/g)];
    if (matches.length === 0) {
      console.warn('⚠️ No captions found in fallback response');
      return null;
    }
    const decoded = matches
      .map((m) => (m[1] ? decodeURIComponent(m[1].replace(/\\n/g, ' ')) : ''))
      .filter((s) => s.trim().length > 0)
      .join(' ');
    const clean = decoded.replace(/\s+/g, ' ').trim();
    if (!clean) {
      console.warn('⚠️ Fallback transcript is empty after cleaning');
      return null;
    }
    console.log(`✅ Fallback transcript extracted (${clean.length} chars)`);
    return clean;
  } catch (err: any) {
    console.warn('⚠️ Fallback transcript extraction failed:', err.message);
    return null;
  }
}

/**
 * Same as extractYouTubeTranscript but retries up to maxRetries times
 * with exponential backoff.
 */
export async function extractYouTubeTranscriptWithRetry(
  videoUrl: string,
  maxRetries = 2
): Promise<string | null> {
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 YouTube transcript attempt ${attempt}/${maxRetries}`);
      const text = await extractYouTubeTranscript(videoUrl);
      if (text) return text;

      throw new Error("Empty transcript received");
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏱️ Waiting ${delay}ms before retry…`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error("❌ All transcript retry attempts failed:", lastErr);
  return null;
}

/**
 * Fetches the HTML of a YouTube video watch page, and extracts its title and description.
 * Returns an object with title and description, or null if it fails.
 */
export async function extractYouTubeMetadata(
  videoUrl: string
): Promise<{ title: string; description: string } | null> {
  if (!isValidYouTubeUrl(videoUrl)) {
    console.warn("⚠️ extractYouTubeMetadata: invalid YouTube URL:", videoUrl);
    return null;
  }

  const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    console.log(`🎥 Fetching YouTube metadata for video: ${videoUrl}`);
    const res = await axios.get(videoUrl, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      timeout: 10000,
    });

    const html = res.data;
    if (!html) {
      console.warn("⚠️ Empty HTML returned for video metadata fetch:", videoUrl);
      return null;
    }

    const $ = cheerio.load(html);

    const title = $("title").text() || $("meta[name='title']").attr("content") || $("meta[property='og:title']").attr("content") || "";
    const description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";

    const cleanTitle = title.replace(/\s+- YouTube$/i, "").trim();
    const cleanDescription = description.trim();

    return {
      title: cleanTitle,
      description: cleanDescription,
    };
  } catch (err: any) {
    console.error("❌ YouTube metadata extraction failed:", err.message);
    return null;
  }
}
