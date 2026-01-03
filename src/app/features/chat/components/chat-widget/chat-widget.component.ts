import { Component, computed, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../../services/chat.service';

interface PredefinedPrompt {
    label: string;
    prompt: string;
    icon: string;
}

@Component({
    selector: 'app-chat-widget',
    standalone: true,
    imports: [CommonModule, MarkdownModule],
    templateUrl: './chat-widget.component.html',
    styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent {
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    isOpen = signal<boolean>(false);

    // Pre-defined prompts for quick actions
    predefinedPrompts: PredefinedPrompt[] = [
        { label: 'Analyze my portfolio', prompt: 'Analyze my portfolio and give me a summary', icon: '📊' },
        { label: 'Risk assessment', prompt: 'What is my portfolio risk level and how can I improve it?', icon: '⚠️' },
        { label: 'Top performers', prompt: 'Which funds in my portfolio are performing best?', icon: '🏆' },
        { label: 'Suggestions', prompt: 'What changes should I make to improve my portfolio?', icon: '💡' }
    ];

    // Helper to check if last message is streaming
    isStreaming = computed(() => {
        const msgs = this.chatService.messages();
        return msgs.length > 0 && msgs[msgs.length - 1].isStreaming;
    });

    // Show prompts only when chat is empty
    showPrompts = computed(() => {
        return this.chatService.messages().length === 0 && !this.chatService.isLoading();
    });

    constructor(public chatService: ChatService) {
        // Auto-scroll effect when messages change
        effect(() => {
            this.chatService.messages(); // Subscribe to message changes
            this.scrollToBottom();
        });
    }

    toggleChat() {
        this.isOpen.update(v => !v);
    }

    resetChat() {
        this.chatService.resetSession();
    }

    sendMessage(content: string) {
        if (!content.trim()) return;
        this.chatService.sendMessage(content);
    }

    sendPredefinedPrompt(prompt: string) {
        this.chatService.sendMessage(prompt);
    }

    private scrollToBottom() {
        setTimeout(() => {
            if (this.messagesContainer?.nativeElement) {
                const el = this.messagesContainer.nativeElement;
                el.scrollTop = el.scrollHeight;
            }
        }, 50);
    }
}
