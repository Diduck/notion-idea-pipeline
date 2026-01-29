
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

export const refineIdeas = async (text: string, category: Category): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Refine the following list of ideas for the category "${category}". 
    Each line represents a single idea. 
    Clean up typos, make them concise, and return them as a JSON array of strings. 
    Keep the meaning identical but professional.
    
    Text:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["refinedIdeas"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.refinedIdeas;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    // Fallback: split by newline if JSON fails
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }
};
