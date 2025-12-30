
import { GoogleGenAI, Type } from "@google/genai";
import { InsightResponse, Language } from "./types";

export const generateInsight = async (
  input: string, 
  language: Language,
  imageBase64?: string
): Promise<InsightResponse> => {
  // Use the pre-configured environment variable directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are InsightAI, a professional assistant for personal, career, and business guidance.
    Your task is to provide intelligent, structured guidance.
    
    1. Identify context: Personal, Career, Business, or General.
    2. LANGUAGE RULE: ALWAYS respond in ${language}.
    3. STRUCTURE: You must provide output in three specific sections:
       - Understand: Summarize the input and highlight important details.
       - Grow: Suggest improvements or skill gaps.
       - Act: Suggest actionable steps.
    4. TONE: Professional and clear.
  `;

  const contents: any[] = [{ text: input }];
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          context: { type: Type.STRING },
          understand: { type: Type.STRING },
          grow: { type: Type.STRING },
          act: { type: Type.STRING },
        },
        required: ["context", "understand", "grow", "act"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Empty response from AI engine.");
  }

  try {
    return JSON.parse(response.text) as InsightResponse;
  } catch (e) {
    console.error("Failed to parse AI response", response.text);
    throw new Error("Invalid response format from AI.");
  }
};
