import express from "express";
import cors from "cors";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";
import automationRoutes from "./routes/automations.js";

const app = express();
app.use(cors({ origin: config.frontendOrigin === "*" ? true : config.frontendOrigin }));
app.use(express.json());

// Health check — hit this first to confirm the server is alive.
app.get("/health", (_req, res) => res.json({ ok: true, model: config.groqModel }));

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/ai", aiRoutes);
app.use("/automations", automationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(config.port, () => {
  console.log(`🎓 CampusFlow backend on http://localhost:${config.port}`);
  console.log(`   Groq model: ${config.groqModel}`);
});
