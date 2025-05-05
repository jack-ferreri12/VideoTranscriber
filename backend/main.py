from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import shutil

app = FastAPI()

# Allow access from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load Whisper model once
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_video:
        shutil.copyfileobj(file.file, temp_video)
        temp_video_path = temp_video.name

    # Transcribe with word-level timestamps
    result = model.transcribe(temp_video_path, word_timestamps=True)

    # Add WPS per segment
    segments = result["segments"]
    for seg in segments:
        words = seg.get("words", [])
        duration = seg["end"] - seg["start"]
        seg["wps"] = len(words) / duration if duration > 0 else 0.0

    # Manual bucketing for graph
    words = [w for seg in segments for w in seg.get("words", [])]
    max_time = max((w["end"] for w in words), default=0)
    bucket_size = 1.0
    num_buckets = int(max_time / bucket_size) + 1
    wps_by_second = []

    for i in range(num_buckets):
        start = i * bucket_size
        end = start + bucket_size
        count = sum(1 for w in words if start <= w["start"] < end)
        wps = count / bucket_size
        wps_by_second.append(wps)

    return {
        "segments": segments,
        "wps_by_second": wps_by_second
    }
