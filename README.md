# QueueStorm — Mock Preliminary

Intelligent CRM ticket classification service for the **SUST CSE Carnival 2026** hackathon warmup round.

Classifies customer support messages by case type, severity, and department — with phishing/critical escalation flags.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS v4, Lucide React, React Hot Toast |
| Backend | Node.js, Express, JWT, Helmet, Rate limiting |
| Database | PostgreSQL 16 (Docker) |
| Classifier | Hybrid: LLM (Groq/DeepSeek/Gemini/Ollama) + keyword rules fallback |

## Required API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | Public | Service health check |
| `POST` | `/sort-ticket` | Public | Classify a CRM ticket |

### Example request

```bash
curl -X POST http://localhost:3001/sort-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "T-001",
    "channel": "app",
    "locale": "en",
    "message": "I sent 5000 taka to a wrong number this morning, please help me get it back"
  }'
```

### Example response

```json
{
  "ticket_id": "T-001",
  "case_type": "wrong_transfer",
  "severity": "high",
  "department": "dispute_resolution",
  "agent_summary": "Customer reports sending 5000 BDT to the wrong recipient and requests recovery assistance.",
  "human_review_required": false,
  "confidence": 0.85
}
```

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- Docker Desktop (for PostgreSQL)

### 1. Environment

```bash
cp .env.example .env
cp .env.example backend/.env
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

> **Note:** Default host port is `5434` (mapped to container `5432`) to avoid conflicts with existing PostgreSQL installs. Change `POSTGRES_PORT` in `.env` if needed.

### 3. Backend

```bash
cd backend
npm install
npm run dev
```

API runs at **http://localhost:3001**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at **http://localhost:5173**

### Demo login

| Field | Value |
|-------|-------|
| Email | `agent@queuestorm.demo` |
| Password | `Agent@2026` |

## Project Structure

```
├── backend/           # Express API + classifier
├── frontend/          # React dashboard
├── docker-compose.yml # PostgreSQL
└── .env.example       # Environment template
```

## Security

- JWT authentication for dashboard routes (`/api/*`)
- `/health` and `/sort-ticket` remain public for grader access
- Passwords hashed with bcrypt (cost 12)
- Helmet security headers + rate limiting
- Secrets via environment variables only
- `agent_summary` never requests PIN, OTP, password, or card numbers

## Deployment

**Full Vercel deployment guide:** see [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick summary:

1. Create a [Neon](https://neon.tech) PostgreSQL database and run `npm run db:init`
2. Push to GitHub and import the repo on [Vercel](https://vercel.com)
3. Set production env vars (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, LLM keys)
4. Deploy — API at `/health`, `/sort-ticket`; dashboard at `/`

| Variable | Production |
|----------|------------|
| `JWT_SECRET` | 32+ char random string |
| `CORS_ORIGIN` | `https://your-app.vercel.app` |
| `DATABASE_URL` | Neon connection string with `?sslmode=require` |
| `VITE_API_URL` | Leave empty (same-origin on Vercel) |

## LLM Usage

**Yes** — optional but recommended for Bengali/English/mixed messages.

| Provider | Cost | Model (default) | Get API key |
|----------|------|-----------------|-------------|
| **Groq** (recommended) | Free tier | `llama-3.1-8b-instant` | [console.groq.com](https://console.groq.com/keys) |
| **DeepSeek** | ~5M tokens free on signup | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| **Google Gemini** | Free tier | `gemini-2.0-flash-lite` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Ollama** | Free (local) | `llama3.2` | [ollama.com](https://ollama.com) |

### Setup (DeepSeek free API test)

```bash
# backend/.env
CLASSIFIER_MODE=hybrid
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
LLM_MODEL=deepseek-chat
LLM_TIMEOUT_MS=15000
```

Get your key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) (new accounts get ~5M free tokens).

Test from terminal:

```bash
cd backend
node scripts/test-llm.mjs
```

### Setup (Groq example)

```bash
# backend/.env
CLASSIFIER_MODE=hybrid
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
```

**Modes:**
- `hybrid` — LLM first, keyword rules if LLM fails (default)
- `llm` — LLM only
- `rules` — keyword lexicon only (no API key needed)

Check `/health` — response includes `classifier` status (provider, model, enabled).

## Known Sample Cases

| Message | case_type | severity |
|---------|-----------|----------|
| I sent 3000 to wrong number | wrong_transfer | high |
| Payment failed but balance deducted | payment_failed | high |
| Someone called asking my OTP, is that bKash? | phishing_or_social_engineering | critical |
| Please refund my last transaction, I changed my mind | refund_request | low |
| App crashed when I opened it | other | low |

## Team Submission Checklist

- [ ] Public GitHub repository
- [ ] Live HTTPS API (`/health` must respond)
- [ ] README / runbook (this file)
- [ ] Google Form: team name, repo URL, API URL, platform, LLM usage
