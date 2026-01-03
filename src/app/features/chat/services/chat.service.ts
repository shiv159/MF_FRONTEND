import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ChatMessage, ChatRequest } from '../models/chat.interface';
import { TokenStorageService } from '../../../core/auth/services/token-storage.service';
import { RxStompService } from '../../../core/services/rx-stomp.service';
import { Message } from '@stomp/stompjs';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService implements OnDestroy {
    private conversationIdKey = 'chat_conversation_id';
    private tokenStorage = inject(TokenStorageService);
    private rxStompService = inject(RxStompService);

    // Signals for Reactive State
    messages = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);
    isVisible = signal<boolean>(false);

    private topicSubscription?: Subscription;

    constructor() {
        this.restoreSession();
        this.initWebSocket();
    }

    private initWebSocket() {
        // Subscribe to user-specific replies
        // Note: The destination /user/queue/reply is mapped by the broker 
        // to /user/{username}/queue/reply automatically
        this.topicSubscription = this.rxStompService.watch('/user/queue/reply').subscribe((message: Message) => {
            const body = message.body;
            this.updateLastMessage(body);
            this.finalizeLastMessage(); // Since we are currently getting full response at once
            this.isLoading.set(false);
        });
    }

    ngOnDestroy() {
        this.topicSubscription?.unsubscribe();
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

        // 3. Send via WebSocket
        const payload: ChatRequest = {
            message: content,
            conversationId: this.getConversationId(),
            userId: userId
        };

        this.rxStompService.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(payload)
        });
    }

    private updateLastMessage(textToAppend: string) {
        this.messages.update(msgs => {
            const newMsgs = [...msgs];
            const last = newMsgs[newMsgs.length - 1];
            if (last.role === 'assistant') {
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
