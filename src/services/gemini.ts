import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationSettings, OptimizedContent } from "../types";

export async function optimizeContent(content: string, settings: OptimizationSettings): Promise<OptimizedContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert content strategist and editor. 
    Optimize the following content based on these specific settings:
    - Goal: ${settings.goal}
    - Target Audience: ${settings.targetAudience}
    - Keywords to include: ${settings.keywords}
    - Desired Tone: ${settings.tone}

    Original Content:
    """
    ${content}
    """

    Provide the optimized version in Markdown format.
    Explain the key changes made and provide metrics comparing the original and optimized versions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimized: { 
              type: Type.STRING,
              description: "The fully optimized content in Markdown format."
            },
            explanation: { 
              type: Type.STRING,
              description: "A brief summary of what was changed and why."
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                originalWordCount: { type: Type.NUMBER },
                optimizedWordCount: { type: Type.NUMBER },
                readabilityScore: { 
                  type: Type.STRING,
                  description: "e.g., 'Grade 8', 'Advanced', 'Easy to read'"
                },
                improvements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of specific improvements made (e.g., 'Removed passive voice', 'Added SEO keywords')"
                }
              },
              required: ["originalWordCount", "optimizedWordCount", "readabilityScore", "improvements"]
            }
          },
          required: ["optimized", "explanation", "metrics"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    const result = JSON.parse(text);
    return {
      original: content,
      ...result
    };
  } catch (error) {
    console.error("Gemini optimization error:", error);
    throw error;
  }
}
