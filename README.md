# 🎙️ Local Speech Rate + Transcription Analyzer

A simple local-first web application that lets you **record video**, **transcribe it using Whisper**, and **visualize speech rate** over time. Built with FastAPI (Python) and a browser frontend (HTML/JS).

## Features

- Record webcam video directly in your browser
- Transcribe speech to text using OpenAI Whisper locally
- Display a real-time transcript synced with playback
- Live speech rate display (words per second)
- Line graph of speech rate (1-second resolution)
- Fully local — no OpenAI API key or cloud required

## Prerequisites

- Python 3.9+
- A modern browser (Chrome recommended)
- A working microphone + webcam
- (Optional) FFmpeg installed — helps with audio decoding

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/speech-analyzer.git
   cd speech-analyzer
   ```

2. Set up and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # on Windows: venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## Usage

### Start the backend

```bash
uvicorn main:app --reload
```

This runs the FastAPI backend on `http://localhost:8000`.

### Open the frontend

Open `frontend/index.html` directly in your browser.

### How to Use

1. Click **Start Recording** to activate your webcam and mic
2. Click **Stop Recording** when you're done
3. Click **Transcribe** to process your speech
4. View:
   - A synced transcript
   - Live speech rate during playback
   - A graph showing words-per-second over time
5. Click **Redo** to try again

## Project Structure

```
speech-analyzer/
├── frontend/
│   ├── index.html          # User interface
│   ├── style.css           # Styling
│   └── script.js           # Frontend logic
├── backend/
│   ├── main.py             # FastAPI app using Whisper
│   └── requirements.txt    # Python dependencies
├── .gitignore              # Ignore cache, temp files, etc.
└── README.md               # You’re reading it!
```

## Technical Details

- Uses OpenAI Whisper (via `whisper` + `torch`) for transcription
- FastAPI exposes a simple `/transcribe` endpoint
- Records audio/video using browser MediaRecorder API
- Visualizes WPS using Chart.js

## Security Note

This app runs entirely **on your machine** — no data leaves your computer, and no keys are required.

## Future Ideas

- Support longer files via upload
- WPM toggle instead of WPS
- Detect pauses or filler words
- Export transcript and graph to file
