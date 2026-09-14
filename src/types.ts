export type IntentCategory =
  | 'saludo_general'
  | 'saludo_temporal'
  | 'saludo_interrogativo'
  | 'saludo_coloquial_regional'
  | 'saludo_formal'
  | 'saludo_multilingue'
  | 'despedida'
  | 'pregunta_identidad'
  | 'conversacion_personal'
  | 'agradecimiento'
  | 'chiste_humor'
  | 'curiosidades_ciencia'
  | 'consejos_motivacion'
  | 'filosofia_pensamiento'
  | 'juegos_acertijos'
  | 'poemas_creatividad'
  | 'calculo_matematico'
  | 'informacion_temporal'
  | 'busqueda_web'
  | 'desconocido';

export interface TimeData {
  time12: string;
  time24: string;
  fullDate: string;
  dayOfWeek: string;
  year: number;
  timeZone: string;
  locationName: string;
  isWorldTime: boolean;
}

export interface MathCalculationData {
  rawExpression: string;
  cleanedExpression: string;
  result: string | number;
  formattedResult: string;
  type: string;
  steps?: string[];
  executionTimeMs: number;
}

export interface WebSearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
  domain?: string;
  imageUrl?: string;
  engine?: string;
}

export interface WebSearchData {
  query: string;
  results: WebSearchResultItem[];
  searchedAt: string;
  totalResults: number;
  executionTimeMs: number;
  sourceProvider: string;
  sourcesList?: string[];
  enginesUsed?: string[];
}

export interface GreetingRule {
  id: string;
  category: IntentCategory;
  categoryName: string;
  patterns: string[];
  regexPatterns?: RegExp[];
  responses: string[];
  description: string;
  example: string;
}

export interface ClassificationResult {
  category: IntentCategory;
  categoryName: string;
  confidence: number;
  matchedPattern?: string;
  tokens: string[];
  normalizedText: string;
  executionTimeMs: number;
  reasoning: string;
  isGreeting: boolean;
  isWebSearch?: boolean;
  isMath?: boolean;
  isTimeDate?: boolean;
  isFollowUp?: boolean;
  contextTopic?: string;
  contextReasoning?: string;
  originalQuestion?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'meteory';
  text: string;
  timestamp: string;
  classification?: ClassificationResult;
  webSearch?: WebSearchData;
  mathResult?: MathCalculationData;
  timeData?: TimeData;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  topicPreview?: string;
}

export interface LiveUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
  isSelf?: boolean;
  level?: number;
  rankTitle?: string;
  status?: string;
  isTyping?: boolean;
  score?: number;
}

export interface LiveChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  type?: 'chat' | 'dice' | 'coin' | 'trivia' | 'action' | 'system';
  badge?: string;
  extraData?: {
    diceRoll?: number;
    coinResult?: 'cara' | 'cruz';
    triviaQuestion?: string;
    triviaAnswer?: string;
    triviaOptions?: string[];
  };
}

