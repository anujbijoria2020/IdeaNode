import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

/* -------------------- CONFIG -------------------- */
const JINA_URL = "https://api.jina.ai/v1/embeddings";
const JINA_MODEL = "jina-embeddings-v2-base-en";
const JINA_API_KEY = process.env.JINA_API_KEY;

const HF_URL = "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;


/* -------------------- GENERATE EMBEDDING -------------------- */
export const generateEmbedding = async (text:string) => {
  if (!text?.trim()) return [];

  try {
    console.log("🧠 Generating Jina embedding for:", text.slice(0, 60));

    const response = await axios.post(
      JINA_URL,
      {
        model: JINA_MODEL,
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${JINA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const vector = response.data?.data?.[0]?.embedding;
    if (!vector) throw new Error("Invalid response from Jina API");

    console.log(`✅ Jina embedding generated (${vector.length} dims)`);
    return vector;
  } catch (err:any) {
    console.error("❌ Jina embedding failed:", err.message);
    return [];
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const generateAnswer = async (question: string, context: string) => {
  try {
    console.log("context is",context);
    console.log("🤖 Generating answer with Gemini...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a helpful AI assistant.
Answer the question ONLY using the provided context.

Context:
${context}

Question:
${question}

Rules:
1. Use ONLY the info from context.
2. If context lacks info, reply "I couldn't find that in your brain."
3. Keep it under 4 sentences.
4. Don't make up information.

Answer:
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text?.trim()) throw new Error("Empty Gemini response");

    console.log("✅ Gemini answer generated.");
    console.log(text.trim());
    return text.trim();
  } catch (err: any) {
    console.error("❌ Gemini generation failed:", err.message);
    return "I couldn't generate an answer right now. Please try again later.";
  }
};

/* -------------------- COSINE SIMILARITY -------------------- */
export const cosineSimilarity = (a:any, b:any) => {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  const dot = a.reduce((sum:any, v:any, i:any) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum:any, v:any) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum:any, v:any) => sum + v * v, 0));
  return dot / (normA * normB);
};
