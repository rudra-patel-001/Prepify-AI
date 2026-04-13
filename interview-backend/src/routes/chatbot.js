import { Router } from "express";
import { grok, GROK_MODEL } from "../grok.js";
import { query } from "../db.js";

const router = Router();

// GET /api/chatbot/conversations — List all conversations
router.get("/conversations", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, title, created_at FROM conversations ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("List conversations error:", err.message);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// POST /api/chatbot/conversations — Create new conversation
router.post("/conversations", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  try {
    const result = await query(
      "INSERT INTO conversations (title) VALUES ($1) RETURNING *",
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create conversation error:", err.message);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /api/chatbot/conversations/:id — Get conversation with messages
router.get("/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  try {
    const convResult = await query(
      "SELECT id, title, created_at FROM conversations WHERE id = $1",
      [id]
    );
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const msgResult = await query(
      "SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [id]
    );

    res.json({
      ...convResult.rows[0],
      messages: msgResult.rows,
    });
  } catch (err) {
    console.error("Get conversation error:", err.message);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// DELETE /api/chatbot/conversations/:id — Delete conversation
router.delete("/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  try {
    const result = await query(
      "DELETE FROM conversations WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Delete conversation error:", err.message);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// GET /api/chatbot/conversations/:id/messages — List messages
router.get("/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  try {
    const result = await query(
      "SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("List messages error:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/chatbot/conversations/:id/messages — Send message (Grok AI streaming SSE)
router.post("/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid conversation ID" });

  const { content } = req.body;
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content is required" });
  }

  try {
    // Verify conversation exists
    const convResult = await query(
      "SELECT id FROM conversations WHERE id = $1",
      [id]
    );
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Save user message
    await query(
      "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)",
      [id, "user", content]
    );

    // Load full conversation history
    const historyResult = await query(
      "SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [id]
    );

    const chatMessages = historyResult.rows.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let fullResponse = "";

    // Stream from Grok AI
    const stream = await grok.chat.completions.create({
      model: GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert AI Interview Coach with 10+ years of experience preparing candidates for top tech companies like Google, Amazon, Meta, Microsoft, and startups.

Your coaching style:
- Provide detailed, actionable feedback
- Use the STAR method for behavioral questions
- Give specific examples and frameworks
- Be encouraging but brutally honest about weaknesses
- Help with system design, coding, behavioral, and HR questions
- Provide example answers when asked
- Break down complex topics clearly

Always respond in a helpful, professional coaching tone.`,
        },
        ...chatMessages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    // Save assistant response to DB
    await query(
      "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)",
      [id, "assistant", fullResponse]
    );

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat message error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
      res.end();
    }
  }
});

export default router;
