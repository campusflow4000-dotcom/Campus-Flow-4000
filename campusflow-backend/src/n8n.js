import { config } from "./config.js";

// Fires a webhook to n8n. Never throws into the request path — a webhook hiccup
// must not break task creation. We log and return status so the UI can show it.
async function fire(url, payload, label) {
  if (!url) {
    console.warn(`⚠️  ${label} webhook URL not set — skipping`);
    return { ok: false, skipped: true, reason: "webhook_url_missing" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(`➡️  ${label} webhook -> ${res.status}`);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error(`❌ ${label} webhook failed:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Workflow 1 payload — matches the blueprint EXACTLY: { studentName, phone, subject, deadline, taskTitle }
export function fireDeadline({ studentName, phone, subject, deadline, taskTitle }) {
  return fire(
    config.n8nDeadlineWebhook,
    { studentName, phone, subject, deadline, taskTitle },
    "Deadline"
  );
}

// Workflow 2 payload — matches the blueprint EXACTLY: { noticeText, aiSummary, eventDate, eventTitle, phoneList }
export function fireNotice({ noticeText, aiSummary, eventDate, eventTitle, phoneList }) {
  return fire(
    config.n8nNoticeWebhook,
    { noticeText, aiSummary, eventDate, eventTitle, phoneList },
    "Notice"
  );
}
