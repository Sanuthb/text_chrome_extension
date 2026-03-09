# Text-to-Extension

Text-to-Extension is a full-stack web app that generates Chrome extensions (Manifest V3) from natural-language prompts. Users can iterate on generated projects, run manifest audits, create store listing copy, publish projects to a public gallery, and download extensions as ZIP files.

## Features

- AI-powered extension generation from text prompts
- Iterative follow-up edits on existing generated files
- ZIP import/export workflow for extension projects
- Authentication and profile management with Supabase
- AI security audit for `manifest.json`
- AI-generated Chrome Web Store listing copy
- Public gallery with remix flow
- Template prompts for quick starts

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS 4, Axios, Framer Motion
- Backend: Node.js, Express 5, Supabase SDK, Groq SDK
- Storage/Auth: Supabase (`auth`, `chats`, `profiles`)

## Repository Structure

```text
Text-to-Extension/
|- backend/    # Express API
|- frontend/   # React + Vite app
`- readme.md   # Project documentation
```

## Prerequisites

- Node.js 18+
- npm
- Supabase project (URL + keys)
- Groq API key (optional, mock generation is used if missing)

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

Optional `frontend/.env` (only needed if overriding defaults in `src/supabaseClient.js`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

## Run Locally

Use two terminals:

```bash
# terminal 1: backend
cd backend
npm run dev
```

```bash
# terminal 2: frontend
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API Overview

Base URL: `http://localhost:5000/api`

Auth routes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/update-password` (auth required)
- `PUT /auth/profile` (auth required)
- `GET /auth/me` (auth required)

Chat routes:

- `POST /chats/generate` (auth required)
- `GET /chats/history` (auth required)
- `GET /chats/history/:id` (auth required)
- `DELETE /chats/history/:id` (auth required)
- `GET /chats/history/:id/download` (auth required)
- `GET /chats/history/:id/audit` (auth required)
- `GET /chats/history/:id/store-listing` (auth required)
- `POST /chats/history/:id/publish` (auth required)
- `GET /chats/gallery` (public)

## Notes

- The frontend currently calls API endpoints using hardcoded `http://localhost:5000` URLs.
- If `GROQ_API_KEY` is missing, generation falls back to mock extension output.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
