import { Router } from "express";
import { supabase } from "../supabase.js";
import { summarizeNotice, generateFlashcards, attendanceAdvice } from "../groq.js";
import { fireNotice } from "../n8n.js";

const router = Router();

// POST /ai/summarize  body: { noticeText }
// Returns the 3-bullet TL;DR. (Pure AI — no broadcast yet, so the UI can show it first.)
router.post("/summarize", async (req, res) => {
  const { noticeText } = req.body;
  if (!noticeText) return res.status(400).json({ error: "noticeText required" });
  try {
    const { summary, bullets } = await summarizeNotice(noticeText);
    res.json({ summary, bullets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/broadcast  body: { noticeText, eventTitle, eventDate, phoneList[] }
// Summarizes, then fires Workflow 2 (calendar event + WhatsApp broadcast to the group).
router.post("/broadcast", async (req, res) => {
  const { noticeText, eventTitle, eventDate, phoneList = [] } = req.body;
  if (!noticeText) return res.status(400).json({ error: "noticeText required" });
  try {
    const { summary } = await summarizeNotice(noticeText);
    const automation = await fireNotice({
      noticeText,
      aiSummary: summary,
      eventDate,
      eventTitle: eventTitle || "College Notice",
      phoneList,
    });
    res.json({ aiSummary: summary, automation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/flashcards  body: { notes, count? }
router.post("/flashcards", async (req, res) => {
  const { notes, count } = req.body;
  if (!notes) return res.status(400).json({ error: "notes required" });
  try {
    const flashcards = await generateFlashcards(notes, count || 5);
    res.json({ flashcards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/attendance  body: { subject, attended, total, required? }
router.post("/attendance", async (req, res) => {
  const { subject, attended, total, required } = req.body;
  if (subject === undefined || attended === undefined || total === undefined)
    return res.status(400).json({ error: "subject, attended, total required" });
  try {
    const result = await attendanceAdvice(subject, Number(attended), Number(total), required || 75);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
