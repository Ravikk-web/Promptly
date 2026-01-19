
export interface Segment {
  text: string;
  type: 'neutral' | 'bad' | 'good' | 'highlight';
  reason?: string;
}

export interface PromptAnalysis {
  score: number;
  summary: string;
  originalSegments: Segment[];
  improvedSegments: Segment[];
  tips: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  analysis: PromptAnalysis;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AIProvider {
  GOOGLE = 'google',
  OPENAI = 'openai',
  CLAUDE = 'claude',
  LOCAL = 'local' // LM Studio, Ollama, etc.
}

export interface AppSettings {
  provider: AIProvider;
  openAIKey: string;
  claudeKey: string;
  googleKey: string;
  localBaseUrl: string;
  localModelName: string;
}
