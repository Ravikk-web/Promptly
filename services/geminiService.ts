import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptAnalysis } from "../types";

// Define the response schema for structured JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 rating the quality of the prompt.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief, encouraging summary of the analysis (max 2 sentences).",
    },
    originalSegments: {
      type: Type.ARRAY,
      description: "Breakdown of the user's original prompt. Mark weak/vague parts as 'bad'.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { 
            type: Type.STRING, 
            enum: ["neutral", "bad"],
            description: "Use 'bad' for vague, misleading, or weak parts. Use 'neutral' for the rest."
          },
          reason: { type: Type.STRING, description: "Short explanation if type is bad." }
        },
        required: ["text", "type"]
      }
    },
    improvedSegments: {
      type: Type.ARRAY,
      description: "The improved prompt broken into segments. Mark key improvements/additions as 'good'.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { 
            type: Type.STRING, 
            enum: ["neutral", "good"],
            description: "Use 'good' for parts that add value, clarity, or structure. Use 'neutral' for the rest."
          },
          reason: { type: Type.STRING, description: "Short explanation if type is good." }
        },
        required: ["text", "type"]
      }
    },
    tips: {
      type: Type.ARRAY,
      description: "List of 3 actionable tips to improve this specific prompt.",
      items: { type: Type.STRING }
    }
  },
  required: ["score", "summary", "originalSegments", "improvedSegments", "tips"]
};

export const analyzePrompt = async (promptText: string): Promise<PromptAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Efficient for text analysis
      contents: `Analyze the following prompt for an LLM. 
      Identify weaknesses (vague instructions, missing context, lack of constraints) and strengths.
      Reconstruct the prompt to be significantly better (Prompt Engineering best practices).
      
      User Prompt: "${promptText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert AI Prompt Engineer. Your goal is to teach users how to write better prompts. Be critical but constructive. When segmenting text, ensure the full original text and full improved text can be reconstructed by joining the segments."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(text) as PromptAnalysis;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getStructuredJsonPrompt = async (promptText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following prompt into a highly structured JSON format optimized for LLM inputs. 
    Organize it into logical keys such as "role", "task", "context", "constraints", "style", and "output_format".
    Ensure the JSON is valid and the content captures the essence of the prompt perfectly.
    
    Prompt: "${promptText}"`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return response.text ?? "{}";
};