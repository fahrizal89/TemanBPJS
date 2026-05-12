import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithBPJSStream(message: string, onChunk: (text: string) => void) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert consultant for BPJS Kesehatan. 
        Provide expert, actionable advice regarding:
        - Registration (PBPU/Mandiri, Pekerja Penerima Upah)
        - Payment (Cara bayar iuran, autodebet)
        - Services (Faskes, rujukan)
        - Mobile JKN app features
        
        Berikan solusi langsung tanpa menyarankan menghubungi kontak center.
        
        Keep answers concise, polite, and in Indonesian. 
        Respond in clean Markdown. Use bold for emphasis. 
        For lists, provide numbering/bullets followed by a newline.
        If the question is not about BPJS Kesehatan, politely decline.
        PENTING: Jawaban Anda maksimal 400 karakter.
        
        WAJIB: Akhiri jawaban dengan JSON object di dalam block code markdown (\\\`\\\`\\\`json ... \\\`\\\`\\\`) dengan 3 pertanyaan lanjutan seperti ini:
        {"followUp": ["Pertanyaan 1?", "Pertanyaan 2?", "Pertanyaan 3?"]}`,
      },
    });

    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
}
