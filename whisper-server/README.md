# EMR System - Whisper Transcription Server

Python-based AI transcription service using OpenAI's Whisper model for real-time voice-to-text conversion.

## Project Structure

This is part of a larger EMR system:

| Component | Description | Repository |
|-----------|-------------|------------|
| **Backend API** | NestJS REST API server | [SeniorProject](https://github.com/Thamer-AlSaiad/SeniorProject) |
| **Frontend** | React web application | [SeniorProject-Frontend](https://github.com/Thamer-AlSaiad/SeniorProject-Frontend) |
| **Whisper Server** (this repo) | AI transcription service | [SeniorProject-Whisper](https://github.com/Thamer-AlSaiad/SeniorProject-Whisper) |

## Features

- Real-time audio transcription
- Support for multiple audio formats (WAV, MP3, WebM)
- REST API endpoint for transcription
- Optimized for medical terminology

## Tech Stack

- **Framework**: FastAPI
- **AI Model**: OpenAI Whisper
- **Audio Processing**: FFmpeg

## Prerequisites

- Python 3.9+
- FFmpeg installed on system
- CUDA (optional, for GPU acceleration)

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Server

```bash
# Development
uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Production
uvicorn server:app --host 0.0.0.0 --port 8000
```

The server runs on `http://localhost:8000` by default.

## API Endpoints

### POST /transcribe
Transcribe audio file to text.

**Request**: Multipart form data with audio file
**Response**: JSON with transcribed text

```json
{
  "text": "Transcribed text content",
  "language": "en"
}
```

### GET /health
Health check endpoint.

## Configuration

The Whisper model size can be configured. Available options:
- `tiny` - Fastest, least accurate
- `base` - Good balance (default)
- `small` - Better accuracy
- `medium` - High accuracy
- `large` - Best accuracy, slowest

## Integration

This server integrates with the main backend API. The backend connects to this service for voice transcription features in the doctor's clinical notes interface.

## Related Projects

- [Backend API](https://github.com/Thamer-AlSaiad/SeniorProject)
- [Frontend Application](https://github.com/Thamer-AlSaiad/SeniorProject-Frontend)

## License

MIT
