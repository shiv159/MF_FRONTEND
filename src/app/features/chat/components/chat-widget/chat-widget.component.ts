import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-chat-widget',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chat-widget.component.html',
    styleUrl: './chat-widget.component.css' // Optional if using Tailwind mostly
})
export class ChatWidgetComponent {

    isOpen = signal<boolean>(false);

    // Helper to check if last message is streaming
    isStreaming = computed(() => {
        const msgs = this.chatService.messages();
        return msgs.length > 0 && msgs[msgs.length - 1].isStreaming;
    });

    constructor(public chatService: ChatService) { }

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
}
