import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres", // apna DB name yaha change kar sakte ho
  password: "Rudra@001",
  port: 5432,
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDB() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id SERIAL PRIMARY KEY,
        topic TEXT NOT NULL,
        category TEXT NOT NULL,
        score INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        feedback TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `);

    console.log("✅ Database tables initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
    throw err;
  }
}