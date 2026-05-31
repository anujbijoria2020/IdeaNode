import axios from "axios";
import * as cheerio from "cheerio";

const TRANSCRIPT_SERVICE_URL =
  "https://ideanode-1.onrender.com";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Transcript Extraction ───────────────────────────────────────────────────

export async function extractYouTubeTranscript(
  videoUrl: string
): Promise<string | null> {
  try {
    if (!isValidYouTubeUrl(videoUrl)) {
      console.warn("⚠️ Invalid YouTube URL:", videoUrl);
      return null;
    }

    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      console.warn("⚠️ Could not extract video ID");
      return null;
    }

    console.log(
      `🎥 Fetching transcript from Python service for: ${videoId}`
    );

    const response = await axios.get(
      `${TRANSCRIPT_SERVICE_URL}/transcript/${videoId}`,
      {
        timeout: 20000,
      }
    );

    if (!response.data?.success) {
      console.warn("⚠️ Transcript service returned failure");
      return null;
    }

    const transcript = response.data?.transcript;

    if (!transcript || transcript.trim().length === 0) {
      console.warn("⚠️ Empty transcript received");
      return null;
    }

    console.log(
      `✅ Transcript extracted (${transcript.length} chars)`
    );

    return transcript;
  } catch (err: any) {
    console.error(
      "❌ Transcript extraction failed:",
      err?.response?.data || err.message
    );

    return null;
  }
}

export async function extractYouTubeTranscriptWithRetry(
  videoUrl: string,
  maxRetries = 3
): Promise<string | null> {
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔄 YouTube transcript attempt ${attempt}/${maxRetries}`
      );

      const text = await extractYouTubeTranscript(videoUrl);

      if (text) {
        return text;
      }

      throw new Error("Empty transcript received");
    } catch (err) {
      lastErr = err;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;

        console.log(
          `⏱️ Waiting ${delay}ms before retry…`
        );

        await new Promise((r) =>
          setTimeout(r, delay)
        );
      }
    }
  }

  console.error(
    "❌ All transcript retry attempts failed:",
    lastErr
  );

  return null;
}

// ─── Metadata Extraction ─────────────────────────────────────────────────────

export async function extractYouTubeMetadata(
  videoUrl: string
): Promise<{ title: string; description: string } | null> {
  if (!isValidYouTubeUrl(videoUrl)) {
    console.warn(
      "⚠️ extractYouTubeMetadata: invalid YouTube URL:",
      videoUrl
    );

    return null;
  }

  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    console.log(
      `🎥 Fetching YouTube metadata for video: ${videoUrl}`
    );

    const res = await axios.get(videoUrl, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      timeout: 10000,
    });

    const html = res.data;

    if (!html) {
      console.warn(
        "⚠️ Empty HTML returned for metadata fetch"
      );

      return null;
    }

    const $ = cheerio.load(html);

    const title =
      $("title").text() ||
      $("meta[name='title']").attr("content") ||
      $("meta[property='og:title']").attr("content") ||
      "";

    const description =
      $("meta[name='description']").attr("content") ||
      $("meta[property='og:description']").attr("content") ||
      "";

    return {
      title: title.replace(/\s+- YouTube$/i, "").trim(),
      description: description.trim(),
    };
  } catch (err: any) {
    console.error(
      "❌ YouTube metadata extraction failed:",
      err.message
    );

    return null;
  }
}