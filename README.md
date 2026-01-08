# EMR System - Backend API

A comprehensive Electronic Medical Records (EMR) system backend built with NestJS, TypeORM, and PostgreSQL.

## Project Structure

This project consists of three main components:

| Component | Description | Repository |
|-----------|-------------|------------|
| **Backend API** (this repo) | NestJS REST API server | [SeniorProject](https://github.com/Thamer-AlSaiad/SeniorProject) |
| **Frontend** | React + TypeScript web application | [SeniorProject-Frontend](https://github.com/Thamer-AlSaiad/SeniorProject-Frontend) |
| **Whisper Server** | Python AI transcription service | [SeniorProject-Whisper](https://github.com/Thamer-AlSaiad/SeniorProject-Whisper) |

## Features

- Multi-role authentication (Admin, Doctor, Patient)
- Organization/Clinic management
- Doctor scheduling and availability
- Patient appointment booking
- Medical records management
- Real-time voice transcription for clinical notes
- Allergy and vital signs tracking

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT
- **Real-time**: WebSockets (Socket.IO)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
npm install
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
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

The API runs on `http://localhost:3000` by default.

### Main Endpoints

- `/api/auth` - Authentication
- `/api/admin` - Admin operations
- `/api/doctor` - Doctor operations
- `/api/patient` - Patient operations

## Related Projects

- [Frontend Application](https://github.com/Thamer-AlSaiad/SeniorProject-Frontend)
- [Whisper Transcription Server](https://github.com/Thamer-AlSaiad/SeniorProject-Whisper)

## License

MIT
