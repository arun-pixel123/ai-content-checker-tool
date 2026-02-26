import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Content Optimization
  app.post("/api/optimize", async (req, res) => {
    const { content, settings } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is missing on the server." });
    }

    try {
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
                    description: "List of specific improvements made"
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
      res.json({
        original: content,
        ...result
      });
    } catch (error: any) {
      console.error("Gemini optimization error:", error);
      res.status(500).json({ error: error.message || "Failed to optimize content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
