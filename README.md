# AI Interview Agent

A production-grade AI mock interview agent. Generates role-specific interview questions, scores candidate answers in real time using Google Gemini, and produces a final evaluation report with strengths, gaps, and a hiring recommendation.

Built for the 24-Hour AI Agent Challenge.

## Features

- Generates 5+ role-relevant interview questions from a role + skills input
- Scores each answer (0–10) with specific feedback, strengths, and gaps
- Produces a final evaluation (0–100 overall score, strengths, gaps, recommendation)
- Full transcript view of the entire interview
- Provider-agnostic AI layer (swap Gemini for another LLM without touching business logic)
- JSON file storage (swappable for SQLite via the same storage interface)

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Axios
**Backend:** Node.js, Express, TypeScript, Google Gemini API, JSON file storage

## Project Structure

AI_Interview_Agent/
├── backend/    # Express API — controllers, services, AI layer, storage
└── frontend/   # React SPA — Setup → Interview → Results flow

See each folder's source for the full layered architecture (routes → controllers → services → interview logic → AI provider / storage).

## Prerequisites

- Node.js 18+
- A Gemini API key from https://aistudio.google.com/apikey

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your key: 

GEMINI_API_KEY=AIzaSy...your_real_key_here

Start the server:

```bash
npm run dev
```

Runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. No `.env` needed for local dev — it defaults to `http://localhost:4000/api`. To point elsewhere, set `VITE_API_BASE_URL` in a `frontend/.env`.

## Usage

1. Open `http://localhost:5173`
2. Click **Start Mock Interview**, enter a role, skills, difficulty, and question count
3. Answer each question as it's generated
4. After the last question, view your final evaluation and full transcript

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/start` | Start a session; generates the question set |
| GET | `/api/interview/:sessionId` | Fetch current session state |
| POST | `/api/interview/:sessionId/answer` | Submit an answer, get score + next question |
| GET | `/api/interview/:sessionId/summary` | Get/generate the final evaluation |
| GET | `/api/interview/:sessionId/transcript` | Get the raw Q&A transcript |
| GET | `/api/health` | Health check |

## Environment Variables (backend)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Your Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model name |
| `PORT` | No | `4000` | Backend port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin |
| `DATA_DIR` | No | `./src/data/sessions` | Session JSON storage path |

## Notes

- Interview sessions are persisted as one JSON file per session under `backend/src/data/sessions/` (gitignored).
- Swapping AI providers means implementing `AIProvider` and registering it in `ai/ai.factory.ts` — no other file changes.

## Tradeoffs

- **Gemini over other LLMs.** Picked for free tier + speed. Swappable via `AIProvider` interface. No hard lock-in.
- **JSON file storage over SQLite/Postgres.** Fast to ship. Fine for single-session demo. Not safe for concurrent writes at scale.
- **Score computed twice.** Average score computed in code (deterministic). Overall score comes from AI (holistic judgment). Tradeoff: two numbers, not one. Chose accuracy over simplicity.
- **No streaming responses.** Full AI response awaited before returning. Simpler code. Slower perceived UX.
- **No retry/backoff on AI calls.** One AI failure = one question fails. Faster to build. Less resilient.
- **No auth.** Any session ID can be fetched by anyone who has it. Fine for demo. Not production-safe.

## Limitations

- Single AI provider implemented (Gemini). Interface supports more, none built.
- No transcribed voice input. Typed answers only.
- No automated tests.
- Session storage not thread-safe under concurrent load.
- No rate limiting on API endpoints.
- API key currently checked into `.env` in this build. Must rotate before any public repo push.
- No pagination for session list (not needed at current scale, would matter at higher volume).