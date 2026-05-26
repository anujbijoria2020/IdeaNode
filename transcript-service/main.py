from fastapi import FastAPI
from youtube_transcript_api import YouTubeTranscriptApi

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Transcript service running"
    }

@app.get("/transcript/{video_id}")
def get_transcript(video_id: str):

    api = YouTubeTranscriptApi()

    fetched = api.fetch(
    video_id,
    languages=["en", "hi"]
)

    chunks = []
    full_text = []

    for item in fetched.snippets:

        text = str(item.text)
        start = float(item.start)
        duration = float(item.duration)

        full_text.append(text)

        chunks.append({
            "text": text,
            "start": start,
            "duration": duration
        })

    return {
        "success": True,
        "video_id": str(video_id),
        "language": str(fetched.language),
        "language_code": str(fetched.language_code),
        "is_generated": bool(fetched.is_generated),
        "transcript": " ".join(full_text),
        "chunks": chunks
    }