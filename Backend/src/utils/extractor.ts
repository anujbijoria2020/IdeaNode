import fs from "fs";
import { PDFParse } from "pdf-parse";
import axios from "axios";

/**
 * Extracts raw text from a locally stored PDF file.
 * Uses the correct pdf-parse API: reads the file as a Buffer
 * and passes it to the default-exported function.
 */
export async function extractTextFromPDF(filepath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filepath);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const parsedData = await parser.getText();
    console.log(`✅ PDF text extracted (${parsedData.text.length} chars)`);
    return parsedData.text;
  } finally {
    await parser.destroy().catch((err) => console.error("Error destroying parser:", err));
  }
}

/**
 * Extracts the text content of a tweet via the Twitter oEmbed API.
 * Returns a formatted string containing author name, username, and tweet text,
 * or null if the tweet cannot be fetched.
 */
export async function extractTweet(tweetUrl: string): Promise<string | null> {
  try {
    // Normalize x.com to twitter.com for oEmbed API to prevent 404
    const normalizedUrl = tweetUrl.replace(/\bx\.com\b/i, "twitter.com");
    const res = await axios.get(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}`
    );
    const html: string = res.data.html;

    // Extract the main tweet text — strip HTML tags and <br> elements
    const textMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const textMatchVal = textMatch?.[1];
    const tweetText = textMatchVal
      ? textMatchVal
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .trim()
      : null;

    // Extract author name and handle from "— Name (@handle)" pattern
    const authorMatch = html.match(/&mdash;\s*(.*?)\s*\(@(.*?)\)/);
    const name = authorMatch?.[1] ? authorMatch[1].trim() : "Unknown";
    const username = authorMatch?.[2] ? authorMatch[2].trim() : "unknown";

    return `Tweet by ${name} (@${username}): ${tweetText}`;
  } catch (err: any) {
    console.error("❌ oEmbed fetch failed:", err.message);
    return null;
  }
}
