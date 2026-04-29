import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
  RESEARCH: "compound-beta",
  ANALYSIS: "llama-3.3-70b-versatile",
} as const;

export default groq;
