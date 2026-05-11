import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateTTS(text: string, voiceName: VoiceName, speed: number = 1.0) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is required");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio content");
  }

  return base64Audio;
}

export async function generateScript(topic: string, tone: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a short, engaging documentary script about "${topic}". The tone should be ${tone}. It should be audience-friendly and professional.`,
  });

  return response.text;
}
