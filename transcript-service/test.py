from youtube_transcript_api import YouTubeTranscriptApi

print("START")

api = YouTubeTranscriptApi()

print("API CREATED")

transcript = api.fetch("dQw4w9WgXcQ")

print(transcript)