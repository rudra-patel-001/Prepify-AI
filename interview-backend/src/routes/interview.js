import { Router } from "express";
import { grok, GROK_MODEL } from "../grok.js";
import { query } from "../db.js";

const router = Router();

// POST /api/interview/generate-question — AI generates interview question
router.post("/generate-question", async (req, res) => {
  const { topic, difficulty, category } = req.body;
  if (!topic || !difficulty || !category) {
    return res.status(400).json({ error: "topic, difficulty, and category are required" });
  }

  try {
    const response = await grok.chat.completions.create({
      model: GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer. Generate realistic, challenging interview questions.
Always respond with ONLY valid JSON in this exact format, no extra text:
{
  "question": "the detailed interview question",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "category": "the category",
  "difficulty": "the difficulty level",
  "timeLimit": 120
}`,
        },
        {
          role: "user",
          content: `Generate a ${difficulty} level ${category} interview question about: ${topic}.
Make it specific, realistic, and test deep understanding. 
For technical: include edge cases and real-world scenarios.
For behavioral: frame as a real work scenario.
For system design: include scale requirements.`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    let parsed = {};
    try {
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = {};
    }

    res.json({
      question: parsed.question ?? `Explain a challenging ${category} scenario you faced related to ${topic} and how you resolved it.`,
      hints: parsed.hints ?? ["Think about specific challenges", "Use the STAR method", "Be specific and quantify impact"],
      category: category,
      difficulty: difficulty,
      timeLimit: parsed.timeLimit ?? 120,
    });
  } catch (err) {
    console.error("Generate question error:", err.message);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// POST /api/interview/analyze-answer — AI analyzes answer (streaming SSE)
router.post("/analyze-answer", async (req, res) => {
  const { question, answer, category } = req.body;
  if (!question || !answer || !category) {
    return res.status(400).json({ error: "question, answer, and category are required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await grok.chat.completions.create({
      model: GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert interview coach who gives detailed, structured feedback. 
Format your response exactly like this:

**Score: X/10**

**Strengths:**
- [specific positive aspect 1]
- [specific positive aspect 2]

**Areas for Improvement:**
- [specific gap or weakness 1]
- [specific gap or weakness 2]

**Suggested Answer Framework:**
[Brief outline of how a strong answer should be structured]

**Sample Strong Answer:**
[Concise example of an excellent answer]

**Key Takeaways:**
- [actionable tip 1]
- [actionable tip 2]

Be honest, specific, and constructive. Score fairly out of 10.`,
        },
        {
          role: "user",
          content: `Interview Question: ${question}

Category: ${category}

Candidate's Answer:
${answer}

Please analyze this answer thoroughly and provide detailed feedback.`,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Analyze answer error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to analyze answer" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Analysis failed" })}\n\n`);
      res.end();
    }
  }
});

// POST /api/interview/generate-quiz — AI generates quiz questions
router.post("/generate-quiz", async (req, res) => {
  const { topic, count, difficulty } = req.body;
  if (!topic || !count || !difficulty) {
    return res.status(400).json({ error: "topic, count, and difficulty are required" });
  }

  const numQuestions = Math.min(parseInt(count) || 5, 20);

  try {
    const response = await grok.chat.completions.create({
      model: GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert quiz creator for technical interview preparation.
Generate multiple-choice questions that test real understanding.
Always respond with ONLY a valid JSON array, no extra text:
[
  {
    "id": 1,
    "question": "the question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "detailed explanation of why option A is correct and others are wrong",
    "category": "the topic area"
  }
]`,
        },
        {
          role: "user",
          content: `Generate exactly ${numQuestions} ${difficulty} level multiple-choice questions about: ${topic}.
Make the questions challenging with plausible distractors. Test real-world application, not just definitions.`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    let parsed = [];
    try {
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      parsed = [];
    }

    // Ensure proper structure
    const questions = parsed.map((q, idx) => ({
      id: q.id ?? idx + 1,
      question: q.question ?? "Question not available",
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correct: typeof q.correct === "number" ? q.correct : 0,
      explanation: q.explanation ?? "No explanation provided",
      category: q.category ?? topic,
    }));

    res.json(questions);
  } catch (err) {
    console.error("Generate quiz error:", err.message);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// GET /api/interview/sessions — List all sessions
router.get("/sessions", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, topic, category, score, status, feedback, created_at FROM interview_sessions ORDER BY created_at DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("List sessions error:", err.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// POST /api/interview/sessions — Create session
router.post("/sessions", async (req, res) => {
  const { topic, category } = req.body;
  if (!topic || !category) {
    return res.status(400).json({ error: "topic and category are required" });
  }
  try {
    const result = await query(
      "INSERT INTO interview_sessions (topic, category) VALUES ($1, $2) RETURNING *",
      [topic, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create session error:", err.message);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// PATCH /api/interview/sessions/:id — Update session score/status
router.patch("/sessions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid session ID" });

  const { score, status, feedback } = req.body;

  try {
    const result = await query(
      `UPDATE interview_sessions 
       SET score = COALESCE($1, score), 
           status = COALESCE($2, status), 
           feedback = COALESCE($3, feedback)
       WHERE id = $4 
       RETURNING *`,
      [score ?? null, status ?? null, feedback ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update session error:", err.message);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// GET /api/interview/stats — Get user statistics
router.get("/stats", async (req, res) => {
  try {
    const sessions = await query(
      "SELECT id, topic, category, score, status, created_at FROM interview_sessions ORDER BY created_at DESC"
    );
    const rows = sessions.rows;

    const completed = rows.filter((s) => s.status === "completed" && s.score != null);
    const totalSessions = rows.length;
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length)
      : 0;

    // Compute streak
    const daySet = new Set(rows.map((s) => new Date(s.created_at).toDateString()));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (daySet.has(d.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const rank = avgScore >= 90 ? 1 : avgScore >= 75 ? 2 : avgScore >= 60 ? 3 : 4;

    // Weekly scores (last 7 days)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyScores = dayNames.map((day, idx) => {
      const daySessions = completed.filter((s) => {
        const d = new Date(s.created_at);
        return d.getDay() === idx && d >= weekAgo && d <= now;
      });
      const score = daySessions.length > 0
        ? Math.round(daySessions.reduce((sum, s) => sum + (s.score || 0), 0) / daySessions.length)
        : 0;
      return { day, score };
    });

    // Topics breakdown
    const topicMap = {};
    for (const s of completed) {
      if (!topicMap[s.topic]) topicMap[s.topic] = { count: 0, total: 0 };
      topicMap[s.topic].count++;
      topicMap[s.topic].total += s.score || 0;
    }

    const topicsBreakdown = Object.entries(topicMap)
      .map(([topic, { count, total }]) => ({
        topic,
        count,
        avgScore: Math.round(total / count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalSessions,
      avgScore,
      streak,
      rank,
      weeklyScores,
      topicsBreakdown,
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
