import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  n8nDeadlineWebhook: process.env.N8N_DEADLINE_WEBHOOK,
  n8nNoticeWebhook: process.env.N8N_NOTICE_WEBHOOK,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "*",
};

// Loud warning so nobody loses 20 min to a silent missing key during the sprint.
["supabaseUrl", "supabaseServiceKey", "groqApiKey"].forEach((k) => {
  if (!config[k]) console.warn(`⚠️  Missing env: ${k} — check your .env file`);
});
