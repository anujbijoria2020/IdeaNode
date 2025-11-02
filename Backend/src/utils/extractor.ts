import {PDFParse} from 'pdf-parse';

import axios from "axios";



export async function extractTextFromPDF(filepath:string) {
  const parser = new PDFParse({url:filepath});
  const result = await parser.getText();
  console.log(result.text);
  return result.text;
}


export async function extractTweet(tweetUrl:string) {
  try {
    const res = await axios.get(`https://publish.twitter.com/oembed?url=${tweetUrl}`);
    const html = res.data.html;

    // Extract main tweet text (remove <br> and HTML tags)
    const textMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const text = textMatch
      ? textMatch[1].replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim()
      : null;

    // Extract username and name (from — Name (@username) part)
    const authorMatch = html.match(/&mdash;\s*(.*?)\s*\(@(.*?)\)/);
    const name = authorMatch ? authorMatch[1].trim() : null;
    const username = authorMatch ? authorMatch[2].trim() : null;


    const result = `tweet from ${name} username=${username} and text = ${text}`;
    return result
  } catch (err:any) {
    console.error("❌ oEmbed fetch failed:", err.message);
    return null;
  }
}

