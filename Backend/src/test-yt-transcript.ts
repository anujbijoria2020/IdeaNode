import fetch from "node-fetch";

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testVideoPage() {
  const videoId = "qH2VQY48mg4";
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const html = await res.text();
    
    const splittedHTML = html.split('"captions":');
    if (splittedHTML.length <= 1) {
      console.log("Could not find captions JSON split.");
      return;
    }
    
    const captionsJSONString = splittedHTML[1].split(',"videoDetails')[0].replace('\n', '');
    const captionsData = JSON.parse(captionsJSONString);
    const tracklist = captionsData?.playerCaptionsTracklistRenderer;
    console.log("Tracklist exists:", !!tracklist);
    if (tracklist) {
      console.log("Caption Tracks:", JSON.stringify(tracklist.captionTracks, null, 2));
      if (tracklist.captionTracks && tracklist.captionTracks.length > 0) {
        const baseUrl = tracklist.captionTracks[0].baseUrl;
        console.log("Fetching baseUrl:", baseUrl);
        const trRes = await fetch(baseUrl, { headers: { 'User-Agent': USER_AGENT } });
        const text = await trRes.text();
        console.log("Status:", trRes.status);
        console.log("Body length:", text.length);
        console.log("Body snippet:", text.slice(0, 300));
      }
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

testVideoPage();
