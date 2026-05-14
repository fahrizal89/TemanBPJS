import { GoogleGenAI } from "@google/genai";
import { systemInstruction } from "./instructions";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithBPJS(message: string): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text || '';
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
}
