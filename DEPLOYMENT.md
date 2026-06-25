# Deploy QueueStorm on Vercel

This guide deploys the **full stack** (React UI + Express API) on Vercel with a managed PostgreSQL database.

## Architecture

| Component | Platform |
|-----------|----------|
| Frontend (React) | Vercel static (`frontend/dist`) |
| API (`/health`, `/sort-ticket`, `/api/*`) | Vercel serverless (`api/index.js`) |
| PostgreSQL | Neon (recommended) or Supabase |

HTTPS is automatic on `*.vercel.app`. The grader endpoint is:

`https://YOUR-PROJECT.vercel.app/sort-ticket`

---

## Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (free tier works)
- [Neon](https://neon.tech) account (free PostgreSQL)
- LLM API key (Groq recommended) if using `CLASSIFIER_MODE=hybrid`

---

## Step 1 — Push code to GitHub

```bash
git add .
git commit -m "Prepare Vercel deployment"
git push origin main
```

Never commit `.env` or `backend/.env` — they are gitignored.

---

## Step 2 — Create PostgreSQL on Neon

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Copy the **connection string** (pooled recommended)
3. Ensure it includes SSL, e.g.:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Initialize the schema (run once from your machine)

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
npm run db:init
```

You should see: `Database schema initialized successfully.`

---

## Step 3 — Generate production secrets

```bash
# Generate a strong JWT secret (32+ chars)
openssl rand -base64 48
```

Save this value — you will add it in Vercel.

**Change the demo agent password** before going public:

```
DEMO_AGENT_PASSWORD=YourStrongPasswordHere123!
```

---

## Step 4 — Import project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | **Other** (not Create React App) |
| Root Directory | `.` (repo root — leave blank / do not set `frontend`) |
| Build Command | Override ON → `npm run vercel-build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install` |

> **Important:** If Framework Preset is "Create React App", Vercel runs `react-scripts build` and the deploy will fail. This project uses **Vite**, not CRA.

4. Click **Deploy** (it may fail until env vars are set — that's OK)

---

## Step 5 — Set environment variables on Vercel

In **Project → Settings → Environment Variables**, add these for **Production** (and Preview if you want):

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `postgresql://...?sslmode=require` | From Neon |
| `JWT_SECRET` | *(48-char random string)* | Never reuse dev value |
| `JWT_EXPIRES_IN` | `8h` | Optional |
| `CORS_ORIGIN` | `https://YOUR-PROJECT.vercel.app` | Your exact Vercel URL |
| `DEMO_AGENT_EMAIL` | `agent@queuestorm.demo` | Dashboard login |
| `DEMO_AGENT_PASSWORD` | *(strong password)* | Change from default |
| `CLASSIFIER_MODE` | `hybrid` | or `rules` without LLM |
| `LLM_PROVIDER` | `groq` | |
| `GROQ_API_KEY` | `gsk_...` | From [console.groq.com](https://console.groq.com/keys) |
| `LLM_TIMEOUT_MS` | `15000` | Optional |

**Do not set** `VITE_API_URL` when API and UI share the same Vercel domain (same-origin requests).

After adding variables, **Redeploy** from the Deployments tab.

---

## Step 6 — Verify deployment

Replace `YOUR-PROJECT` with your Vercel subdomain.

### Health check (grader requirement)

```bash
curl https://YOUR-PROJECT.vercel.app/health
```

Expected: `"status": "ok"` and `"database": "connected"`

### Classify a ticket

```bash
curl -X POST https://YOUR-PROJECT.vercel.app/sort-ticket \
  -H "Content-Type: application/json" \
  -d "{\"ticket_id\":\"T-001\",\"channel\":\"app\",\"locale\":\"en\",\"message\":\"I sent 3000 to wrong number\"}"
```

### Dashboard login

Open `https://YOUR-PROJECT.vercel.app` and sign in with your `DEMO_AGENT_*` credentials.

---

## Step 7 — Submit to hackathon form

| Field | Value |
|-------|-------|
| API URL | `https://YOUR-PROJECT.vercel.app` |
| Health | `https://YOUR-PROJECT.vercel.app/health` |
| Sort ticket | `https://YOUR-PROJECT.vercel.app/sort-ticket` |
| Platform | Vercel + Neon |

---

## Security checklist

- [ ] `JWT_SECRET` is 32+ random characters (not the dev default)
- [ ] `DEMO_AGENT_PASSWORD` changed from `Agent@2026`
- [ ] `DATABASE_URL` only in Vercel env vars (never in git)
- [ ] LLM API keys only in Vercel env vars
- [ ] `CORS_ORIGIN` set to your production URL only (no `*`)
- [ ] `.env` files are gitignored
- [ ] Rotate any API keys that were ever pasted in chat or committed

---

## Custom domain (optional)

1. Vercel → **Settings → Domains** → add your domain
2. Update `CORS_ORIGIN` to `https://yourdomain.com`
3. Redeploy

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `react-scripts build` exited with 127 | Framework Preset is wrong. Set to **Other**, Build Command to `npm run vercel-build`, redeploy latest `main` commit |
| Deploy uses old commit without `vercel.json` | Redeploy from latest `main` (must include `vercel.json` at repo root) |
| `database: unavailable` | Check `DATABASE_URL`, run `npm run db:init`, verify Neon project is active |
| `JWT_SECRET must be at least 32 characters` | Set a longer secret in Vercel env vars |
| Login works locally but not on Vercel | Set `CORS_ORIGIN` to exact Vercel URL (no trailing slash) |
| LLM fails, rules still work | Normal in `hybrid` mode — add credits or switch `CLASSIFIER_MODE=rules` |
| Build fails | Ensure root `package.json` exists and `npm run build` works locally |
| 404 on `/sort-ticket` | Confirm `vercel.json` rewrites are committed; redeploy |

---

## Local development (unchanged)

```bash
docker compose up -d
cp .env.example backend/.env
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

## Alternative: API-only on Vercel + separate frontend

If you prefer two Vercel projects:

1. Deploy backend config to Railway/Render instead
2. Set `VITE_API_URL=https://your-api.example.com` in the frontend Vercel project

For the hackathon, **one Vercel project** (this setup) is simplest.
