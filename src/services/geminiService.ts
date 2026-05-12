import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithBPJS(message: string, history: { role: string, parts: { text: string }[] }[] = []) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a helpful assistant for BPJS Kesehatan. 
        You provide information about BPJS Kesehatan services, such as:
        - Registration (Pendaftaran PBPU/Mandiri, Pekerja Penerima Upah)
        - Payment (Cara bayar iuran, autodebet, channel pembayaran)
        - Services (Faskes tingkat pertama, rujukan, antrean online)
        - Mobile JKN app features
        - Contact center (165)
        
        Keep answers concise, polite, and in Indonesian. 
        If the question is not about BPJS Kesehatan, politely decline or redirect to the general topic.`,
      },
    });

    // Note: The GenAI SDK Chat interface doesn't explicitly accept history in the same format.
    // For simplicity, we just send the message.
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Mohon maaf, saya sedang mengalami kendala. Bisa diulangi?";
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
}
