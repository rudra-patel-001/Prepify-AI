import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./db.js";
import chatbotRouter from "./routes/chatbot.js";
import interviewRouter from "./routes/interview.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

app.use("/api/chatbot", chatbotRouter);
app.use("/api/interview", interviewRouter);

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Error Handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ──────────────────────────────────────────
async function start() {
  try {
    console.log("🔌 Connecting to database...");
    await initDB();
    console.log("✅ Database ready");

    app.listen(PORT, () => {
      console.log("\n🚀 Interview Prep Backend is running!");
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🤖 Grok AI: Connected (${process.env.GROK_API_KEY ? "Key set" : "⚠️ MISSING KEY"})`);
      console.log("\n📋 Available Endpoints:");
      console.log("  GET  /api/health");
      console.log("  GET  /api/chatbot/conversations");
      console.log("  POST /api/chatbot/conversations");
      console.log("  GET  /api/chatbot/conversations/:id");
      console.log("  DEL  /api/chatbot/conversations/:id");
      console.log("  POST /api/chatbot/conversations/:id/messages  [SSE]");
      console.log("  POST /api/interview/generate-question");
      console.log("  POST /api/interview/analyze-answer           [SSE]");
      console.log("  POST /api/interview/generate-quiz");
      console.log("  GET  /api/interview/sessions");
      console.log("  POST /api/interview/sessions");
      console.log("  PATCH /api/interview/sessions/:id");
      console.log("  GET  /api/interview/stats");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
