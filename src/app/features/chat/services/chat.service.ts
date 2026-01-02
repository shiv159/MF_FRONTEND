import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ChatMessage, ChatRequest } from '../models/chat.interface';
import { TokenStorageService } from '../../../core/auth/services/token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    // baseUrl = environment.apiUrl + '/chat'; // Ensure environment has apiUrl
    // Hardcoding for now based on assumption, replace with environment
    private apiUrl = 'http://localhost:8080/api/chat/stream';

    private conversationIdKey = 'chat_conversation_id';
    private tokenStorage = inject(TokenStorageService);

    // Signals for Reactive State
    messages = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);
    isVisible = signal<boolean>(false);

    constructor() {
        this.restoreSession();
    }

    private restoreSession() {
        let id = sessionStorage.getItem(this.conversationIdKey);
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem(this.conversationIdKey, id);
        }
    }

    getConversationId(): string {
        return sessionStorage.getItem(this.conversationIdKey) || '';
    }

    /**
     * Resets the chat session (New Chat)
     */
    resetSession() {
        const newId = crypto.randomUUID();
        sessionStorage.setItem(this.conversationIdKey, newId);
        this.messages.set([]); // Clear UI messages
    }

    async sendMessage(content: string) {
        if (!content.trim()) return;

        // 1. Add User Message
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content,
            timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, userMsg]);
        this.isLoading.set(true);

        // 2. Prepare Assistant Placeholder
        const assistantMsgId = crypto.randomUUID();
        const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: '', // Start empty
            timestamp: new Date(),
            isStreaming: true
        };
        this.messages.update(msgs => [...msgs, assistantMsg]);

        // Get userId from storage for portfolio context
        const user = this.tokenStorage.getUser();
        const userId = user?.id || '';

        try {
            // 3. Fetch with POST support for SSE
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Add logic to get token if needed
                },
                body: JSON.stringify({
                    message: content,
                    conversationId: this.getConversationId(),
                    userId: userId // Include userId for portfolio context
                } as ChatRequest)
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Parse SSE format (data: ...)
                // Simple parser assuming one 'data:' per line or chunk
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const text = line.replace('data:', '').trim();
                        // Update the *last* message (Assistant)
                        this.updateLastMessage(text);
                    }
                }
            }

        } catch (err) {
            console.error('Chat Error:', err);
            this.updateLastMessage('\n[Error: Could not connect to AI]');
        } finally {
            this.isLoading.set(false);
            this.finalizeLastMessage();
        }
    }

    private updateLastMessage(textToAppend: string) {
        this.messages.update(msgs => {
            const newMsgs = [...msgs];
            const last = newMsgs[newMsgs.length - 1];
            if (last.role === 'assistant') {
                // Append token directly - Spring AI streams include proper spacing
                newMsgs[newMsgs.length - 1] = { ...last, content: last.content + textToAppend };
            }
            return newMsgs;
        });
    }

    private finalizeLastMessage() {
        this.messages.update(msgs => {
            const newMsgs = [...msgs];
            const last = newMsgs[newMsgs.length - 1];
            if (last.role === 'assistant') {
                newMsgs[newMsgs.length - 1] = { ...last, isStreaming: false };
            }
            return newMsgs;
        });
    }
}
