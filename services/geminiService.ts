
import { GoogleGenAI, Type } from "@google/genai";
import { InsightResponse, Language } from "./types";

/**
 * Generates an insight using the Gemini API.
 * 
 * Rules:
 * - Always initialize GoogleGenAI with { apiKey: process.env.API_KEY }.
 * - Initialize a new instance for every call to ensure the latest key is used.
 */
export const generateInsight = async (
  input: string, 
  language: Language,
  imageBase64?: string
): Promise<InsightResponse> => {
  // Directly use the environment variable as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are InsightAI, a professional assistant for personal, career, and business guidance.
    Your task is to provide intelligent, structured guidance based on documents or queries provided by the user.
    
    1. Identify context: Personal, Career, Business, or General.
    2. LANGUAGE RULE: ALWAYS respond in ${language}. Use native vocabulary but maintain professional clarity.
    3. STRUCTURE: You must provide output in three specific sections:
       - Understand: Summarize the input, identify key facts, and clarify ambiguities.
       - Grow: Suggest areas for improvement, skill gaps, or long-term benefits.
       - Act: Provide a clear, numbered list of actionable steps for the user to take immediately.
    4. TONE: Professional, supportive, and direct.
  `;

  const parts: any[] = [{ text: input || "Analyze the provided information/image." }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            context: { type: Type.STRING, description: "The categorized context of the query (Personal, Career, Business, General)" },
            understand: { type: Type.STRING, description: "Summary and key details" },
            grow: { type: Type.STRING, description: "Improvements and gaps" },
            act: { type: Type.STRING, description: "Actionable steps" },
          },
          required: ["context", "understand", "grow", "act"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI model returned an empty response.");
    }

    return JSON.parse(text) as InsightResponse;
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw new Error(err.message || "Failed to connect to the AI service. Please try again later.");
  }
};
