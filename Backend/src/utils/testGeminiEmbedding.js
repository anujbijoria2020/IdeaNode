import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent("hello world");
    console.log("✅ Success, length:", result.embedding.values.length);
  } catch (e) {
    console.error("❌ Failed:", e.message || e);
  }
}
test();
