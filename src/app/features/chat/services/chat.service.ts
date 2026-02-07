import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ChatMessage, ChatRequest } from '../models/chat.interface';
import { TokenStorageService } from '../../../core/auth/services/token-storage.service';

type ChatHttpResponse = {
    response: string;
    conversationId?: string;
};

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly conversationIdKey = 'chat_conversation_id';
    private readonly apiUrl = `${environment.apiUrl}/api/chat/message`;
    private readonly tokenStorage = inject(TokenStorageService);
    private readonly http = inject(HttpClient);

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

    sendMessage(content: string) {
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

        // 3. Send via HTTP endpoint
        const payload: ChatRequest = {
            message: content,
            conversationId: this.getConversationId(),
            userId: userId
        };

        this.http.post<ChatHttpResponse>(this.apiUrl, payload).subscribe({
            next: (response) => {
                if (response.conversationId) {
                    sessionStorage.setItem(this.conversationIdKey, response.conversationId);
                }

                this.setLastAssistantMessage(response.response || 'No response received.');
                this.finalizeLastMessage();
                this.isLoading.set(false);
            },
            error: (error) => {
                const errorMessage = error?.error?.message || error?.message || 'Unable to process chat request.';
                this.setLastAssistantMessage(`Sorry, I could not respond right now. ${errorMessage}`);
                this.finalizeLastMessage();
                this.isLoading.set(false);
            }
        });
    }

    private setLastAssistantMessage(content: string) {
        this.messages.update(msgs => {
            const newMsgs = [...msgs];
            const last = newMsgs[newMsgs.length - 1];
            if (last.role === 'assistant') {
                newMsgs[newMsgs.length - 1] = { ...last, content };
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
