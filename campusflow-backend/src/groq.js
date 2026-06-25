import Groq from "groq-sdk";
import { config } from "./config.js";

const groq = new Groq({ apiKey: config.groqApiKey });

// Generic chat helper. Low temp = consistent, demo-safe output.
async function chat(system, user, { json = false, temperature = 0.3 } = {}) {
  const res = await groq.chat.completions.create({
    model: config.groqModel,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    ...(json ? { response_format: { type: "json_object" } } : {}),
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

// --- 3-bullet TL;DR for the Notice Summarizer (your headline AI feature) ---
export async function summarizeNotice(noticeText) {
  const system =
    "You summarize college notices for busy students. " +
    "Return EXACTLY 3 short bullet points, each starting with '• ', no preamble, no closing line. " +
    "Each bullet must be one crisp sentence capturing a concrete fact: what, when, where, or action needed.";
  const text = await chat(system, `Summarize this notice:\n\n${noticeText}`);
  // Normalise into a clean array of 3 bullets.
  const bullets = text
    .split("\n")
    .map((l) => l.replace(/^[•\-\*\d.\)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  return { summary: text, bullets };
}

// --- Flashcards for the AI Study Buddy bonus module ---
export async function generateFlashcards(notes, count = 5) {
  const system =
    `You are a study assistant. From the student's notes, create ${count} flashcards. ` +
    'Respond ONLY with JSON: {"flashcards":[{"question":"...","answer":"..."}]}. ' +
    "Questions test understanding, not trivia. Answers are 1-2 sentences. No markdown, no extra keys.";
  const raw = await chat(system, `Notes:\n\n${notes}`, { json: true });
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
  } catch {
    return [];
  }
}

// --- Attendance Risk Alerter (cheap bonus module: math + one AI line) ---
export async function attendanceAdvice(subject, attended, total, required = 75) {
  const current = total > 0 ? (attended / total) * 100 : 0;
  // classes needed so that (attended + x) / (total + x) >= required/100
  let classesNeeded = 0;
  if (current < required) {
    classesNeeded = Math.ceil((required * total - 100 * attended) / (100 - required));
    if (classesNeeded < 0) classesNeeded = 0;
  }
  const atRisk = current < required;
  const system =
    "You are a supportive academic advisor. One short, specific, encouraging sentence. No emojis at the start.";
  const advice = await chat(
    system,
    `Subject ${subject}: ${current.toFixed(1)}% attendance (need ${required}%). ` +
      (atRisk
        ? `Student must attend ${classesNeeded} more consecutive classes.`
        : `Student is safe.`)
  );
  return { subject, current: Number(current.toFixed(1)), required, atRisk, classesNeeded, advice };
}
