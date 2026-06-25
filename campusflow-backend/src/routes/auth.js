import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

// POST /auth/register
// body: { name, email, password, branch, year, phone, subjects[] }
router.post("/register", async (req, res) => {
  const { name, email, password, branch, year, phone, subjects } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "name, email, password required" });

  // Create auth user (email confirmation off for the demo — set in Supabase Auth settings).
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr) return res.status(400).json({ error: authErr.message });

  // Store the student profile.
  const { data: student, error: dbErr } = await supabase
    .from("students")
    .insert({
      id: authData.user.id,
      name,
      email,
      branch,
      year,
      phone,
      subjects: subjects || [],
    })
    .select()
    .single();
  if (dbErr) return res.status(400).json({ error: dbErr.message });

  res.status(201).json({ student });
});

// POST /auth/login  body: { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", data.user.id)
    .single();

  res.json({ token: data.session.access_token, student });
});

export default router;
