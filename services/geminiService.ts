
import { GoogleGenAI, Type } from "@google/genai";
import { InsightResponse, Language } from "./types";

export const generateInsight = async (
  input: string, 
  language: Language,
  imageBase64?: string
): Promise<InsightResponse> => {
  const apiKey = process.env.API_KEY;

  // Validation check before initializing the SDK to avoid the generic browser error
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error(
      "API Key is missing. If you are seeing this on a deployed site, ensure the API_KEY environment variable is correctly exposed to the client."
    );
  }

  // Initialize the SDK with the verified key
  const ai = new GoogleGenAI({ apiKey });
  
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

  const parts: any[] = [{ text: input }];
  
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
            context: { type: Type.STRING, description: "The categorized context of the query" },
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
    // Handle specific common API errors
    if (err.message?.includes("API key not valid")) {
      throw new Error("The provided API key is invalid. Please check your configuration.");
    }
    throw new Error(err.message || "Failed to connect to the AI service. Please try again later.");
  }
};
