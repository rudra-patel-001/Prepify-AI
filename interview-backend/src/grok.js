import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is required");
}

// Groq uses an OpenAI-compatible API, just like x.ai did!
export const grok = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Using Llama 3 70B - Groq's most powerful free model, perfect for interview coaching
export const GROK_MODEL = "llama-3.3-70b-versatile";