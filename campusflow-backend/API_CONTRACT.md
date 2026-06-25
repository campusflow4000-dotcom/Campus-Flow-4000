# CampusFlow — API Contract (build against this)

**Owner:** Person 1 (Backend + AI). **Audience:** P2 (n8n) and P3 (frontend).
Base URL (dev): `http://localhost:4000`

This is the single source of truth. P3 builds the UI against these shapes (mock them until the backend is live). P2 makes the n8n webhooks accept the payloads at the bottom. **Nobody waits on anybody — build against the contract.**

---

## Auth

### `POST /auth/register`
```json
// request
{ "name": "Manvanth", "email": "m@x.com", "password": "pass123",
  "branch": "AIML", "year": "3rd", "phone": "+9198XXXXXXXX",
  "subjects": ["DBMS", "OS", "CN"] }
// response 201
{ "student": { "id": "uuid", "name": "...", "email": "...", "phone": "...", "subjects": ["..."] } }
```

### `POST /auth/login`
```json
// request
{ "email": "m@x.com", "password": "pass123" }
// response 200
{ "token": "jwt", "student": { "id": "uuid", "name": "...", "phone": "...", "subjects": ["..."] } }
```
> P3: store `student.id` in app state — every other call needs it.

---

## Tasks (Core Platform + Smart Deadline Manager)

### `GET /tasks?studentId=uuid`
```json
{ "tasks": [ { "id": "uuid", "title": "DBMS Assignment 3", "subject": "DBMS",
  "deadline": "2025-07-02T18:00:00Z", "reminder_time": "2025-07-01T18:00:00Z",
  "add_to_calendar": true, "done": false } ] }
```

### `POST /tasks`  ⭐ THE DEMO MAGIC MOMENT
Creating a task fires the n8n webhook → WhatsApp confirmation + Google Calendar event.
```json
// request
{ "studentId": "uuid", "title": "DBMS Assignment 3", "subject": "DBMS",
  "deadline": "2025-07-02T18:00:00Z", "reminderTime": "2025-07-01T18:00:00Z",
  "addToCalendar": true }
// response 201
{ "task": { ...taskRow },
  "automation": { "ok": true, "status": 200 } }   // ok:true => show green in UI
```

### `PUT /tasks/:id`   body: any of `{ title, subject, deadline, reminderTime, addToCalendar, done }`
### `DELETE /tasks/:id`   → `{ "ok": true }`

---

## AI (Notice Summarizer + bonus modules)

### `POST /ai/summarize`  body: `{ "noticeText": "..." }`
```json
{ "summary": "• ...\n• ...\n• ...", "bullets": ["...", "...", "..."] }
```

### `POST /ai/broadcast`  ⭐ fires Workflow 2 (+15 bonus)
```json
// request
{ "noticeText": "...", "eventTitle": "Mid-sem Exam", "eventDate": "2025-07-10T09:00:00Z",
  "phoneList": ["+9198...", "+9197..."] }
// response
{ "aiSummary": "• ...\n• ...\n• ...", "automation": { "ok": true } }
```

### `POST /ai/flashcards`  body: `{ "notes": "...", "count": 5 }`
```json
{ "flashcards": [ { "question": "...", "answer": "..." } ] }
```

### `POST /ai/attendance`  body: `{ "subject": "DBMS", "attended": 18, "total": 30, "required": 75 }`
```json
{ "subject": "DBMS", "current": 60.0, "required": 75, "atRisk": true,
  "classesNeeded": 18, "advice": "..." }
```

---

## Automations (My Automations page)

### `GET /automations?studentId=uuid`
```json
{ "automations": [ { "type": "deadline", "status": "success", "detail": "DBMS Assignment 3",
  "created_at": "..." } ] }
```

---

## 🔌 n8n webhook payloads — FOR PERSON 2

Your two workflows receive exactly these. Match field names 1:1 in your Set/Calendar/WhatsApp nodes.

**Workflow 1 — Deadline** (POST to `N8N_DEADLINE_WEBHOOK`):
```json
{ "studentName": "Manvanth", "phone": "+9198XXXXXXXX",
  "subject": "DBMS", "deadline": "2025-07-02T18:00:00Z", "taskTitle": "DBMS Assignment 3" }
```
WhatsApp body suggestion:
`⏰ Hi {{studentName}}! Your {{subject}} task "{{taskTitle}}" is tracked. Check Google Calendar. — CampusFlow 🎓`

**Workflow 2 — Notice** (POST to `N8N_NOTICE_WEBHOOK`):
```json
{ "noticeText": "...", "aiSummary": "• ...\n• ...\n• ...",
  "eventDate": "2025-07-10T09:00:00Z", "eventTitle": "Mid-sem Exam",
  "phoneList": ["+9198...", "+9197..."] }
```
> The AI summary is already computed by the backend — your n8n Workflow 2 does NOT need an HTTP/AI node. Just Calendar (description = `{{aiSummary}}`) → Loop over `phoneList` → WhatsApp. Simpler = fewer things to break live.

---

## ⚠️ Demo rule baked into the contract
`POST /tasks` fires the **immediate** confirmation — no 24h Wait node in that path. Demo this one. The 24h / 1h reminders are a separate scheduled branch you explain verbally, never wait for live.
