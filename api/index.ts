import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Gemini API Proxy
app.post("/api/interview", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured on server." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    res.json(response);
  } catch (error: any) {
    console.error("Interview API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post("/api/intelligence", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured on server." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    res.json(response);
  } catch (error: any) {
    console.error("Intelligence API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 导出 app 供 Vercel 使用
export default app;
