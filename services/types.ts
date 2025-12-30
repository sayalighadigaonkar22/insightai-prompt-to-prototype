
export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  MARATHI = 'Marathi'
}

export type ContextType = 'Personal' | 'Career' | 'Business' | 'General';

export type AppTab = 'dashboard' | 'analyze' | 'history' | 'resources' | 'settings' | 'help';

export interface InsightResponse {
  context: ContextType;
  understand: string;
  grow: string;
  act: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  language: Language;
  response: InsightResponse;
}
