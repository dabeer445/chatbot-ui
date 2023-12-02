import { OpenAIModel } from './openai';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  convID: string;
  messages: Message[];
  key: string;
  // model: OpenAIModel;
  // prompt: string;
  // temperature: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  folderId: string | null;
  // model: OpenAIModel;
  // prompt: string;
  // temperature: number;
}
