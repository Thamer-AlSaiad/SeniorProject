# EMR System - Frontend

React + TypeScript frontend application for the Electronic Medical Records system.

## Project Structure

This is part of a larger EMR system:

| Component | Description | Repository |
|-----------|-------------|------------|
| **Backend API** | NestJS REST API server | [SeniorProject](https://github.com/Thamer-AlSaiad/SeniorProject) |
| **Frontend** (this repo) | React web application | [SeniorProject-Frontend](https://github.com/Thamer-AlSaiad/SeniorProject-Frontend) |
| **Whisper Server** | Python AI transcription service | [SeniorProject-Whisper](https://github.com/Thamer-AlSaiad/SeniorProject-Whisper) |

## Features

- Multi-role dashboards (Admin, Doctor, Patient)
- Organization and doctor management
- Appointment scheduling and booking
- Real-time voice transcription
- Medical records viewing
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 3000

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application runs on `http://localhost:5173` by default.

## User Roles

### Admin
- Manage organizations/clinics
- Manage doctors
- View system statistics

### Doctor
- Manage schedules
- View and manage appointments
- Access patient records
- Voice transcription for clinical notes

### Patient
- Book appointments
- View appointment history
- Access medical records

## Related Projects

- [Backend API](https://github.com/Thamer-AlSaiad/SeniorProject)
- [Whisper Transcription Server](https://github.com/Thamer-AlSaiad/SeniorProject-Whisper)

## License

MIT
