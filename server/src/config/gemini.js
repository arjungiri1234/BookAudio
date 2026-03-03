import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  Missing GEMINI_API_KEY in .env");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
