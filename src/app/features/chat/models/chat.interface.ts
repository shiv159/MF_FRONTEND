export interface ChatRequest {
    message: string;
    conversationId?: string;
    contextHint?: string;
    userId?: string; // Added for portfolio context injection
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}
