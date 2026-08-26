export interface SearchEntryPoint {
  renderedContent?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  searchEntryPoint?: SearchEntryPoint;
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingMetadata?: GroundingMetadata;
  isLoading?: boolean;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}

// HEALTHY + BRAIN Premium Extensions
export interface BioMetrics {
  bioScore: number;
  hrv: number; // in ms
  steps: number; // current steps
  sleepHours: number; // e.g. 8.25
  glucose: number; // in mg/dL
  glucoseStable: boolean;
  sunSync: boolean;
  hydrationMl: number;
}

export interface MealResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  proteinCalories?: number;
  vitaminsDetected?: string[];
  bioScore: number;
  warnings: string[];
  timing: string;
  veredicto: string;
  rewardNTK: number;
}

export interface MealPreset {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  analysis: MealResult;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  tokens: number;
  bioScore: number;
  isSelf?: boolean;
}

export interface SquadChallenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  participants: number;
  progress: number; // percentage (0 - 100)
  completed: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  type: 'subscription' | 'tokens';
  value: number; // tokens quantity or level
}
