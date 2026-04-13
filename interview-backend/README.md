# AI Interview Prep — Backend

A complete Node.js + Express backend for the AI Interview Preparation platform.
Uses **Grok AI (xAI)** for all AI features: coaching chatbot, question generation, answer analysis, and quiz creation.

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI**: Grok AI (grok-3-mini via xAI API)
- **Database**: PostgreSQL
- **Features**: SSE streaming, CORS, JSON

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `GROK_API_KEY` — Get from https://console.x.ai/
- `DATABASE_URL` — Your PostgreSQL connection string

### 3. Start the Server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs on http://localhost:3001

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROK_API_KEY` | YES | Grok AI API key from console.x.ai |
| `DATABASE_URL` | YES | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3001) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:5173) |

### Get Grok API Key
1. Go to https://console.x.ai/
2. Sign up / Log in
3. Create a new API key
4. Copy it to your `.env` file as `GROK_API_KEY`

### PostgreSQL Setup
If you don't have PostgreSQL, you can use:
- **Local**: Install PostgreSQL and create a database named `interview_prep`
- **Supabase** (free): https://supabase.com — Create project, get connection string
- **Neon** (free): https://neon.tech — Create project, get connection string

Database tables are created **automatically** on first startup — no manual migrations needed!

---

## API Endpoints

### Health Check
```
GET /api/health
```

### Chatbot (Grok AI — Streaming SSE)

```
GET  /api/chatbot/conversations
POST /api/chatbot/conversations          { title }
GET  /api/chatbot/conversations/:id
DEL  /api/chatbot/conversations/:id
GET  /api/chatbot/conversations/:id/messages
POST /api/chatbot/conversations/:id/messages  { content }  → SSE Stream
```

#### SSE Chat Example (Frontend JavaScript)
```javascript
const res = await fetch(`http://localhost:3001/api/chatbot/conversations/${convId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: "What is the STAR method?" }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      if (data.content) console.log(data.content); // append to UI
      if (data.done) console.log("Stream complete");
    }
  }
}
```

### Interview

```
POST /api/interview/generate-question
Body: { topic, difficulty: "easy"|"medium"|"hard", category: "behavioral"|"technical"|"system-design"|"coding"|"hr" }
Response: { question, hints[], category, difficulty, timeLimit }

POST /api/interview/analyze-answer   → SSE Stream
Body: { question, answer, category }
Stream: data: { content } ... data: { done: true }

POST /api/interview/generate-quiz
Body: { topic, count: 5-20, difficulty: "easy"|"medium"|"hard"|"mixed" }
Response: [{ id, question, options[], correct, explanation, category }]

GET   /api/interview/sessions
POST  /api/interview/sessions        { topic, category }
PATCH /api/interview/sessions/:id    { score, status, feedback }
GET   /api/interview/stats
```

---

## Connecting Your Frontend

In your React app, point all API calls to `http://localhost:3001`:

```javascript
// vite.config.ts — Add proxy
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3001",
      changeOrigin: true,
    }
  }
}
```

Or set `VITE_API_BASE_URL=http://localhost:3001` and prefix all fetch calls.

---

## Project Structure

```
interview-backend/
├── src/
│   ├── index.js          # Express server + startup
│   ├── db.js             # PostgreSQL client + DB init
│   ├── grok.js           # Grok AI client setup
│   └── routes/
│       ├── chatbot.js    # AI chatbot routes (Grok streaming)
│       └── interview.js  # Interview/quiz/session routes
├── .env.example          # Environment template
├── package.json
└── README.md
```
