export interface ChatRequest {
    message: string;
    conversationId?: string;
    contextHint?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}
