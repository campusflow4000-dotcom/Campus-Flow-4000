# CampusFlow — Backend (Person 1)

Express + Supabase + Groq + n8n. Powers Core Platform, Smart Deadline Manager, and Notice Summarizer.

## ⚡ 10-minute setup
```bash
npm install
cp .env.example .env      # fill in the values below
npm run dev               # http://localhost:4000  (GET /health to verify)
```

**Fill `.env`:**
1. **Supabase** → create project at supabase.com → Settings → API → copy `URL`, `service_role` key, `anon` key. Run `schema.sql` in the SQL Editor. Auth → Email → turn OFF "Confirm email".
2. **Groq** → console.groq.com → API Keys → paste as `GROQ_API_KEY`.
3. **n8n** → P2 gives you the two webhook URLs → paste them.

Give P3 the **anon key + Supabase URL**. Give P2 the **API_CONTRACT.md** payloads.

## What's here
| File | Purpose |
|---|---|
| `API_CONTRACT.md` | **Share first.** Endpoints P3 builds on + n8n payloads for P2. |
| `schema.sql` | Paste into Supabase SQL Editor. |
| `design-tokens.css` | Hand to P3 for instant dark-mode polish. |
| `src/routes/tasks.js` | Task CRUD; POST fires the WhatsApp+Calendar webhook. |
| `src/routes/ai.js` | summarize / broadcast / flashcards / attendance. |
| `src/groq.js` | All AI calls (model: `llama-3.1-8b-instant`). |
| `src/n8n.js` | Fires both n8n workflows; never blocks the request. |

## Endpoints (full detail in API_CONTRACT.md)
`POST /auth/register` · `POST /auth/login` · `GET/POST/PUT/DELETE /tasks` · `POST /ai/summarize` · `POST /ai/broadcast` · `POST /ai/flashcards` · `POST /ai/attendance` · `GET /automations`

## How this scores (rubric map)
- **Core Platform (20)** — auth + tasks + dashboard data.
- **Workflow 1 WhatsApp + Calendar (30)** — `POST /tasks` → immediate confirmation webhook.
- **AI feature (20)** — `POST /ai/summarize` clean 3-bullet output.
- **Workflow 2 Notice broadcast (+15)** — `POST /ai/broadcast`.
- **Attendance module (+5 innovation)** — `POST /ai/attendance`.

## Production note (say this to judges)
RLS is disabled for demo speed; for production we'd add row-level security policies and verify the Supabase JWT in middleware. Free tiers throughout (Supabase, Groq, Twilio sandbox).
