import os
import tempfile
import base64
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from typing import Optional

app = FastAPI(title="Local Whisper Server")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for CUDA
import torch
CUDA_AVAILABLE = torch.cuda.is_available()

# Model config
MODEL_SIZE = os.getenv("WHISPER_MODEL", "medium")
DEVICE = "cuda" if CUDA_AVAILABLE else "cpu"
COMPUTE_TYPE = "float16" if CUDA_AVAILABLE else "int8"

print(f"CUDA available: {CUDA_AVAILABLE}")
if CUDA_AVAILABLE:
    print(f"GPU: {torch.cuda.get_device_name(0)}")
print(f"Loading Whisper model: {MODEL_SIZE} on {DEVICE}...")

model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
print("Model loaded!")


def transcribe_audio_file(file_path: str, language: str = "en") -> dict:
    """Transcribe audio file with hallucination filtering"""
    
    segments, info = model.transcribe(
        file_path,
        language=language,
        beam_size=5,
        best_of=5,
        vad_filter=True,
        vad_parameters=dict(
            min_silence_duration_ms=500,
            speech_pad_ms=400,
        ),
        condition_on_previous_text=False,
        no_speech_threshold=0.6,
        log_prob_threshold=-1.0,
        compression_ratio_threshold=2.4,
        temperature=0.0,
        without_timestamps=True,
    )
    
    # Collect segments and filter
    texts = []
    for segment in segments:
        text = segment.text.strip()
        if text and not is_hallucination(text):
            texts.append(text)
    
    final_text = " ".join(texts).strip()
    
    return {
        "text": final_text,
        "language": info.language,
        "duration": info.duration,
        "probability": info.language_probability,
    }


def is_hallucination(text: str) -> bool:
    """Check if text is a common hallucination"""
    if not text:
        return True
    
    text_lower = text.lower().strip()
    
    # Common single-word hallucinations
    hallucinations = {
        "you", "thank you", "thanks", "thanks for watching",
        "bye", "goodbye", "hello", "hi", "hey", "okay", "ok",
        "subscribe", "like and subscribe", "see you",
        "thank you for watching", "thanks for listening",
        "music", "applause", "laughter",
    }
    
    if text_lower in hallucinations:
        return True
    
    # Repeated word pattern (like "Ychwanegwch ychwanegwch")
    words = text_lower.split()
    if len(words) >= 2:
        unique_words = set(words)
        if len(unique_words) == 1:
            return True
        # If 80%+ of words are the same
        if len(unique_words) <= len(words) * 0.2:
            return True
    
    # Very short text is suspicious
    if len(text) < 3:
        return True
    
    return False


@app.get("/health")
async def health_check():
    return {"status": "ok", "model": MODEL_SIZE, "device": DEVICE}


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: Optional[str] = Form("en"),
):
    try:
        suffix = os.path.splitext(audio.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        result = transcribe_audio_file(tmp_path, language or "en")
        os.unlink(tmp_path)

        return {"success": True, **result}
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "error": str(e)}


@app.post("/transcribe-base64")
async def transcribe_base64(
    audio_base64: str = Form(...),
    audio_format: str = Form("webm"),
    language: Optional[str] = Form("en"),
):
    try:
        audio_data = base64.b64decode(audio_base64)
        print(f"Received: {len(audio_data)} bytes, format: {audio_format}")
        
        if len(audio_data) < 1000:
            return {"success": False, "error": "Audio too short - speak for at least 2 seconds"}
        
        suffix = f".{audio_format}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_data)
            tmp_path = tmp.name

        result = transcribe_audio_file(tmp_path, language or "en")
        os.unlink(tmp_path)
        
        print(f"Result: '{result['text']}' (duration: {result['duration']:.1f}s)")

        if not result["text"]:
            return {"success": True, "text": "", "message": "No speech detected - speak clearly"}

        return {"success": True, **result}
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "error": str(e)}


@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    """Real-time streaming transcription"""
    await websocket.accept()
    print("WebSocket connected")
    
    full_text = ""
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "audio":
                audio_bytes = base64.b64decode(data["audio"])
                
                if len(audio_bytes) < 1000:
                    continue
                
                # Save and transcribe chunk
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                    tmp.write(audio_bytes)
                    tmp_path = tmp.name
                
                try:
                    result = transcribe_audio_file(tmp_path, "en")
                    os.unlink(tmp_path)
                    
                    if result["text"]:
                        full_text = result["text"]  # Replace with latest
                        await websocket.send_json({
                            "type": "partial",
                            "text": full_text,
                        })
                except Exception as e:
                    print(f"Chunk error: {e}")
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
            
            elif data.get("type") == "stop":
                await websocket.send_json({
                    "type": "final",
                    "text": full_text,
                })
                full_text = ""
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
