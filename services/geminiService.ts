
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptAnalysis, AppSettings, AIProvider } from "../types";

// --- GOOGLE SCHEMA ---
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

// --- HELPER: ROBUST JSON PARSER ---
const parseAIResponse = (content: string): PromptAnalysis => {
  if (!content) throw new Error("Empty response from model.");

  // 1. Clean <think> tags (Common in DeepSeek/R1 models)
  content = content.replace(/<think>[\s\S]*?<\/think>/g, '');

  // 2. Clean Markdown code blocks if the model wraps the JSON
  content = content.replace(/```json\n?|\n?```/g, '');

  // 3. Extract JSON object by finding the first '{' and last '}'
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1) {
    content = content.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(content) as PromptAnalysis;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    throw new Error("Failed to parse AI response. The model might have returned invalid JSON.");
  }
};

// --- SYSTEM PROMPT ---
const SYSTEM_INSTRUCTION = `You are an expert AI Prompt Engineer. Your goal is to teach users how to write better prompts. 
Be critical but constructive. When segmenting text, ensure the full original text and full improved text can be reconstructed by joining the segments.
IMPORTANT: Return ONLY raw JSON. No markdown formatting. No code blocks.`;

const JSON_STRUCTURE_HINT = `
Respond with a valid JSON object with this structure:
{
  "score": number (0-100),
  "summary": string,
  "originalSegments": [{"text": string, "type": "neutral"|"bad", "reason": string}],
  "improvedSegments": [{"text": string, "type": "neutral"|"good", "reason": string}],
  "tips": [string]
}
`;

// --- MAIN ANALYZE FUNCTION ---
export const analyzePrompt = async (promptText: string, settings?: AppSettings): Promise<PromptAnalysis> => {
  const provider = settings?.provider || AIProvider.GOOGLE;

  switch (provider) {
    case AIProvider.GOOGLE:
      return analyzeWithGoogle(promptText, settings?.googleKey);
    case AIProvider.OPENAI:
      return analyzeWithOpenAI(promptText, settings!.openAIKey);
    case AIProvider.CLAUDE:
      return analyzeWithClaude(promptText, settings!.claudeKey);
    case AIProvider.LOCAL:
      return analyzeWithLocal(promptText, settings!.localBaseUrl, settings!.localModelName);
    default:
      throw new Error("Unknown provider selected.");
  }
};

// --- GOOGLE IMPLEMENTATION ---
const analyzeWithGoogle = async (promptText: string, userKey?: string): Promise<PromptAnalysis> => {
  // Use import.meta.env for Vite compatibility, fallback to process.env safely
  const apiKey = userKey || import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
  if (!apiKey) throw new Error("Google API Key is missing. Please configure it in settings.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this prompt: "${promptText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini.");
    return parseAIResponse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- OPENAI / LOCAL IMPLEMENTATION (Compatible APIs) ---
const analyzeWithOpenAI = async (promptText: string, apiKey: string) => {
  if (!apiKey) throw new Error("OpenAI API Key is required.");
  // OpenAI supports strict json_object mode
  return callOpenAICompatible("https://api.openai.com/v1/chat/completions", apiKey, "gpt-4o", promptText, true);
};

const analyzeWithLocal = async (promptText: string, baseUrl: string, model: string) => {
  if (!baseUrl) throw new Error("Local API URL is required.");
  // Normalize URL
  const url = baseUrl.endsWith('/') ? `${baseUrl}v1/chat/completions` : `${baseUrl}/v1/chat/completions`;
  // Local models (like LM Studio) may not support 'json_object' response_format or require 'json_schema'.
  // To stay compatible with the widest range of local servers/models, we disable the strict flag
  // and rely on the system prompt + robust parsing.
  return callOpenAICompatible(url, "not-needed", model || "local-model", promptText, false);
};

const callOpenAICompatible = async (url: string, apiKey: string, model: string, promptText: string, useJsonMode: boolean): Promise<PromptAnalysis> => {
  try {
    const body: any = {
      model: model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION + JSON_STRUCTURE_HINT },
        { role: "user", content: `Analyze this prompt: "${promptText}"` }
      ]
    };

    if (useJsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from model.");

    return parseAIResponse(content);
  } catch (error: any) {
    console.error("Provider API Error:", error);
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Connection failed. Ensure the local server is running and 'CORS' is enabled in its settings (common issue with LM Studio/Ollama).");
    }
    throw new Error(error.message || "Failed to connect to AI Provider. Check your settings and keys.");
  }
};

// --- CLAUDE IMPLEMENTATION ---
const analyzeWithClaude = async (promptText: string, apiKey: string): Promise<PromptAnalysis> => {
  if (!apiKey) throw new Error("Claude API Key is required.");

  // Note: Client-side Claude calls often fail CORS. This is a best-effort implementation.
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'dangerously-allow-browser': 'true' // Required for client-side usage if supported
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        system: SYSTEM_INSTRUCTION + JSON_STRUCTURE_HINT,
        messages: [
          { role: "user", content: `Analyze this prompt: "${promptText}"` }
        ]
      })
    });

    if (!response.ok) {
      // Handle CORS specifically or general errors
      if (response.status === 0) throw new Error("CORS Error: Claude API does not allow direct browser access. Please use a proxy.");
      const err = await response.text();
      throw new Error(`Claude API Error: ${err}`);
    }

    const data = await response.json();
    return parseAIResponse(data.content[0]?.text);

  } catch (error: any) {
    console.error("Claude API Error:", error);
    throw new Error(error.message || "Failed to communicate with Claude.");
  }
};

// --- UTILS ---
export const getStructuredJsonPrompt = async (promptText: string): Promise<string> => {
  // This function defaults to Google for simplicity, or could handle settings if passed
  // For now, we keep it using the environment key for stability
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert to JSON: "${promptText}"`,
    config: { responseMimeType: "application/json" }
  });
  return response.text ?? "{}";
};
