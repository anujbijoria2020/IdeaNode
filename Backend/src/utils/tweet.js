// 📁 utils/YoutubeService.js
// Install: npm install youtube-transcript

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url) {
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
      if (match && match[1]) {
        // Remove any additional parameters
        return match[1].split('?')[0].split('&')[0];
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error extracting video ID:", error);
    return null;
  }
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url) {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];

  return patterns.some((pattern) => pattern.test(url));
}

/**
 * Extract transcript from YouTube video using youtube-transcript package
 */
export async function extractYouTubeTranscript(videoUrl) {
  try {
    // Validate URL
    if (!isValidYouTubeUrl(videoUrl)) {
      throw new Error("Invalid YouTube URL");
    }

    // Extract video ID
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Could not extract video ID from URL");
    }

    console.log(`🎥 Fetching transcript for video: ${videoId}...`);

    // Fetch transcript
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptArray || transcriptArray.length === 0) {
      console.warn("⚠️ No transcript available for this video");
      return { text: "", videoId };
    }

    // Combine all transcript segments into one text
    const text = transcriptArray
      .map((segment) => segment.text)
      .join(" ")
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    console.log(`✅ Transcript extracted successfully (${text.length} characters)`);

    return { text, videoId };
  } catch (error) {
    console.error("❌ Error extracting YouTube transcript:", error.message);

    // Handle specific errors
    if (error.message?.includes("Could not retrieve transcript")) {
      throw new Error(
        "This video doesn't have captions/subtitles available or they are disabled."
      );
    } else if (error.message?.includes("Video unavailable")) {
      throw new Error("Video is unavailable or private.");
    } else if (error.message?.includes("Invalid")) {
      throw new Error("Invalid YouTube URL provided.");
    }

    throw error;
  }
}

/**
 * Extract transcript with retry logic
 */
export async function extractYouTubeTranscriptWithRetry(videoUrl, maxRetries = 2) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);
      const result = await extractYouTubeTranscript(videoUrl);

      if (result.text && result.text.length > 0) {
        return result;
      }

      // If transcript is empty, throw error to retry
      throw new Error("Empty transcript received");
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      lastError = error;

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏱️ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed to extract transcript after retries");
}

/**
 * Clean and format transcript text
 */
export function cleanTranscriptText(text) {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\[.*?\]/g, "") // Remove [Music], [Applause], etc.
    .replace(/\(.*?\)/g, "") // Remove (Music), (Laughter), etc.
    .trim();
}

/**
 * Get transcript summary info
 */
export function getTranscriptInfo(text) {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = text.length;
  const estimatedDuration = Math.ceil(wordCount / 150); // ~150 words per minute

  return {
    wordCount,
    charCount,
    estimatedDuration, // in minutes
  };
}

/**
 * Extract transcript with language preference
 */
export async function extractYouTubeTranscriptWithLang(videoUrl, lang = "en") {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Could not extract video ID from URL");
    }

    console.log(`🎥 Fetching ${lang} transcript for video: ${videoId}...`);

    // Fetch transcript with specific language
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: lang,
    });

    if (!transcriptArray || transcriptArray.length === 0) {
      console.warn(`⚠️ No ${lang} transcript available`);
      return { text: "", videoId };
    }

    const text = transcriptArray
      .map((segment) => segment.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    console.log(`✅ ${lang} transcript extracted (${text.length} characters)`);

    return { text, videoId };
  } catch (error) {
    console.error(`❌ Error extracting ${lang} transcript:`, error.message);
    throw error;
  }
}

const link = "https://www.youtube.com/watch?v=1WrLLEO50gw";
const data = await extractYouTubeTranscript(link);
console.log(data);

export default {
  extractYouTubeTranscript,
  extractYouTubeTranscriptWithRetry,
  extractYouTubeTranscriptWithLang,
  extractVideoId,
  isValidYouTubeUrl,
  cleanTranscriptText,
  getTranscriptInfo,
};