# EMR System - Backend API

A Voice-Based Electronic Medical Records (EMR) system backend built with NestJS, ReactJS, and PostgreSQL.

## Project Structure

This project consists of three main components:

| Component | Description | Repository |
|-----------|-------------|------------|
| **Backend API**  | NestJS REST API server | [SeniorProject-Backend](https://github.com/Thamer-AlSaiad/SeniorProject) |
| **Frontend** | React + TypeScript web application | [SeniorProject-Frontend](https://github.com/Thamer-AlSaiad/SeniorProject/tree/main/Frontend-S3) |
| **Whisper Server** | Python AI transcription service | [Whisper-Server](https://github.com/Thamer-AlSaiad/SeniorProject/tree/main/whisper-server) |

## Project Document
[Project Thesis](https://docs.google.com/document/d/1Y4fvAMv7-OlI__PHGbeR8E1tKHU8NCPfnKh0xqSMPSo/edit?usp=sharing)

## Tech Stack

- **Framework**: NestJS & ReactJs
- **Database**: PostgreSQL with TypeORM

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
npm install - cd Frontend-S3 && npm install - cd whisper-server && pip install requirements.txt
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=emr_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

WHISPER_SERVER_URL=http://localhost:8000
```

## Running the Application

```bash
# Backend after installing node modules
npm run start:dev

# Frontend after installing node modules
cd Frontend-S3 && npm run dev

# Whisper server after installing requirements
cd whisper-server && .\venv\Scripts\Activate
python server.py
```

## APIs

The API runs on `http://localhost:3000` by default.
The frontend runs on `http://localhost:5173` by default.
The AI runs on `https://localhost:8000` by default.



MIT
