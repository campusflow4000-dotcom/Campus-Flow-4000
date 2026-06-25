import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

// GET /automations?studentId=...  -> powers the "My Automations" page (judges love this)
router.get("/", async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId required" });
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ automations: data });
});

export default router;
