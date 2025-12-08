export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

export interface UploadedDocument {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  tokens?: number; // Estimated
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export type LoadingState = 'idle' | 'loading' | 'streaming' | 'error';
