import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pick one; adjust if you want flash for cheaper/faster
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

