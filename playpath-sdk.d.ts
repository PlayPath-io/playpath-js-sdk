/**
 * TypeScript definitions for PlayPath SDK
 */

export interface PlayPathConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface RagChatParams {
  message: string;
  history?: ChatMessage[];
  system_prompt?: string;
}

export interface RagChatResponse {
  reply: string;
  usage?: number;
  limit?: number;
}

export interface Item {
  id?: number;
  title?: string;
  url?: string;
  text?: string;
  tags?: string[];
  state?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

export interface ItemWithNeighbors extends Item {
  neighbors?: Item[];
}

export interface ChatSession {
  sendMessage(message: string): Promise<RagChatResponse>;
  getHistory(): ChatMessage[];
  clearHistory(): void;
  setSystemPrompt(prompt: string): void;
}

export interface DeleteResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
  errors?: string[];
}

export class PlayPathError extends Error {
  status: number | null;
  data: any;
  
  constructor(message: string, status?: number | null, data?: any);
}

export class PlayPathSDK {
  baseUrl: string;
  apiKey: string;
  headers: Record<string, string>;

  constructor(config?: PlayPathConfig);

  setApiKey(apiKey: string): void;
  setBaseUrl(baseUrl: string): void;

  // RAG API Methods
  ragChat(params: RagChatParams): Promise<RagChatResponse>;
  /**
   * Stream chat messages via Server-Sent Events (SSE)
   * @param params Chat parameters including message and optional history and system prompt
   */
  ragChatStream(params: RagChatParams): EventSource;

  // Items API Methods
  getItems(): Promise<Item[]>;
  getItem(id: string | number): Promise<ItemWithNeighbors>;
  createItem(item: Item): Promise<Item>;
  updateItem(id: string | number, item: Partial<Item>): Promise<Item>;
  deleteItem(id: string | number): Promise<DeleteResponse>;

  // Utility Methods
  formatChatHistory(messages: any[]): ChatMessage[];
  createChatSession(systemPrompt?: string | null): ChatSession;
}

export default PlayPathSDK;