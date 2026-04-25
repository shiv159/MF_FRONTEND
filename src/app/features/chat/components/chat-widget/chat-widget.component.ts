import { Component, ElementRef, ViewChild, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatService } from '../../services/chat.service';
import {
  AlertItem,
  ChatAction,
  ChatMessage,
  ChatStatusEvent,
  RebalanceDraftPayload
} from '../../models/chat.interface';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  readonly isOpen = signal(false);
  readonly isAlertsOpen = signal(false);
  readonly draftMessage = signal('');

  readonly isStreaming = computed(() => {
    const messages = this.chatService.messages();
    return messages.length > 0 && !!messages[messages.length - 1].isStreaming;
  });

  readonly showPrompts = computed(
    () => this.chatService.messages().length === 0 && !this.chatService.isLoading()
  );

  constructor(public readonly chatService: ChatService) {
    effect(() => {
      this.chatService.messages();
      queueMicrotask(() => this.scrollToBottom());
    });

    effect(() => {
      const launch = this.chatService.pendingLaunchPrompt();
      if (!launch) {
        return;
      }

      this.isOpen.set(true);
      this.chatService.consumeLaunchPrompt(launch.id);
      queueMicrotask(() => this.sendPrompt(launch.prompt));
    });
  }

  toggleChat(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      void this.chatService.loadStarterPrompts();
      void this.chatService.loadAlerts();
    } else {
      this.isAlertsOpen.set(false);
    }
  }

  toggleAlerts(): void {
    this.isAlertsOpen.update((open) => !open);
  }

  resetChat(): void {
    this.chatService.resetSession();
    this.draftMessage.set('');
  }

  sendCurrentMessage(): void {
    const content = this.draftMessage();
    if (!content.trim()) {
      return;
    }
    this.chatService.sendMessage(content);
    this.draftMessage.set('');
  }

  sendPrompt(prompt: string): void {
    this.chatService.sendMessage(prompt);
  }

  promptGroups() {
    return this.chatService.starterPromptGroups();
  }

  sendAction(action: ChatAction): void {
    this.chatService.sendAction(action);
  }

  acknowledgeAlert(alertId: string): void {
    void this.chatService.acknowledgeAlert(alertId);
  }

  rebalanceDraft(message: ChatMessage): RebalanceDraftPayload | null {
    const action = message.actions?.find((candidate) => candidate.type === 'REBALANCE_DRAFT');
    return (action?.payload as RebalanceDraftPayload | undefined) ?? null;
  }

  followUpActions(message: ChatMessage): ChatAction[] {
    return message.actions?.filter((action) => action.type === 'FOLLOW_UP_PROMPT') ?? [];
  }

  allocationEntries(values?: Record<string, number>): Array<{ label: string; value: number }> {
    return Object.entries(values ?? {}).map(([label, value]) => ({
      label,
      value: Number(value)
    }));
  }

  draftItems(
    draft: RebalanceDraftPayload | null,
    key: 'proposedReductions' | 'proposedAdditions'
  ): Array<Record<string, unknown>> {
    const value = draft?.[key];
    return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  }

  suggestedFunds(item: Record<string, unknown>): Array<Record<string, unknown>> {
    const value = item['suggestedFunds'];
    return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  }

  asText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  asNumber(value: unknown): number {
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  statusLabel(event: ChatStatusEvent): string {
    const payload = (event.payload ?? {}) as Record<string, unknown>;

    if (event.type === 'status') {
      const status = typeof payload['status'] === 'string' ? payload['status'] : 'working';
      return status.replace(/_/g, ' ');
    }
    if (event.type === 'tool_start') {
      return `Running ${this.asText(payload['tool']).replace(/_/g, ' ')}`;
    }
    if (event.type === 'tool_result') {
      return `${this.asText(payload['tool']).replace(/_/g, ' ')} ready`;
    }
    if (event.type === 'error') {
      return this.asText(payload['message']) || 'An error occurred';
    }

    return event.type.replace(/_/g, ' ');
  }

  trackAlert(_index: number, alert: AlertItem): string {
    return alert.alertId;
  }

  trackStatusEvent(index: number, event: ChatStatusEvent): string {
    return `${event.type}-${event.generatedAt.getTime()}-${index}`;
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer?.nativeElement) {
      return;
    }
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}
