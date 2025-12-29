
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { InsightResponse, Language } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateInsight = async (
  input: string, 
  language: Language,
  imageBase64?: string
): Promise<InsightResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    You are InsightAI, a professional assistant for personal, career, and business guidance.
    Your task is to process user input and provide intelligent, structured guidance.
    
    1. Identify context: Personal/paperwork, Career/education, or Business/work decisions.
    2. LANGUAGE RULE: ALWAYS respond in ${language}.
    3. STRUCTURE: You must provide output in three specific sections:
       - Understand: Summarize the input and highlight important details.
       - Grow: Suggest career improvements, skill gaps, or personal growth opportunities.
       - Act: Suggest actionable steps, decisions, or recommendations.
    4. TONE: Professional, clear, actionable, and supportive.
    5. RESTRICTION: Avoid legal or medical advice.
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
          context: {
            type: Type.STRING,
            description: "The identified context: Personal, Career, Business, or General",
          },
          understand: {
            type: Type.STRING,
            description: "Summary and key details in the specified language.",
          },
          grow: {
            type: Type.STRING,
            description: "Growth suggestions and skill gaps in the specified language.",
          },
          act: {
            type: Type.STRING,
            description: "Actionable steps and recommendations in the specified language.",
          },
        },
        required: ["context", "understand", "grow", "act"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data as InsightResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Invalid response format from AI");
  }
};
