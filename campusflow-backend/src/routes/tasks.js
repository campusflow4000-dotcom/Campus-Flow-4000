import { Router } from "express";
import { supabase } from "../supabase.js";
import { fireDeadline } from "../n8n.js";

const router = Router();

// GET /tasks?studentId=...   -> dashboard list
router.get("/", async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId required" });
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("student_id", studentId)
    .order("deadline", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ tasks: data });
});

// POST /tasks
// body: { studentId, title, subject, deadline (ISO), reminderTime, addToCalendar }
// >>> THIS IS THE DEMO MAGIC MOMENT: creating a task fires the n8n webhook,
//     which sends the WhatsApp confirmation + creates the Google Calendar event. <<<
router.post("/", async (req, res) => {
  const { studentId, title, subject, deadline, reminderTime, addToCalendar = true } = req.body;
  if (!studentId || !title || !deadline)
    return res.status(400).json({ error: "studentId, title, deadline required" });

  // 1. Persist the task.
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      student_id: studentId,
      title,
      subject,
      deadline,
      reminder_time: reminderTime || null,
      add_to_calendar: addToCalendar,
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  // 2. Look up the student so n8n has name + phone for WhatsApp.
  const { data: student } = await supabase
    .from("students")
    .select("name, phone")
    .eq("id", studentId)
    .single();

  // 3. Fire the n8n webhook (immediate confirmation path — no 24h wait, demo-safe).
  const automation = await fireDeadline({
    studentName: student?.name || "Student",
    phone: student?.phone || "",
    subject: subject || "General",
    deadline,
    taskTitle: title,
  });

  // 4. Record the automation status so the "My Automations" page can show green/pending.
  await supabase.from("automations").insert({
    student_id: studentId,
    type: "deadline",
    status: automation.ok ? "success" : "pending",
    detail: title,
  });

  res.status(201).json({ task, automation });
});

// PUT /tasks/:id  -> edit
router.put("/:id", async (req, res) => {
  const { title, subject, deadline, reminderTime, addToCalendar, done } = req.body;
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...(title !== undefined && { title }),
      ...(subject !== undefined && { subject }),
      ...(deadline !== undefined && { deadline }),
      ...(reminderTime !== undefined && { reminder_time: reminderTime }),
      ...(addToCalendar !== undefined && { add_to_calendar: addToCalendar }),
      ...(done !== undefined && { done }),
    })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ task: data });
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("tasks").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
