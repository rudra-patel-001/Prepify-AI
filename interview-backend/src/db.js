import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// ✅ Use DATABASE_URL from .env / Render
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Render PostgreSQL
  },
});

// ✅ Query function (same as before)
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// ✅ Initialize DB tables
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