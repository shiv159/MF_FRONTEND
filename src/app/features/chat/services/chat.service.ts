import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AlertItem,
  ChatAction,
  ChatMessage,
  ChatMessageRequest,
  ChatMetadata,
  ChatSource,
  ChatStatusEvent,
  ChatStreamEvent,
  ScreenContext,
  StarterPromptGroup,
  StarterPromptsResponse
} from '../models/chat.interface';
import { TokenStorageService } from '../../../core/auth/services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly conversationIdKey = 'chat_conversation_id';
  private readonly alertsPollIntervalMs = 5 * 60 * 1000;
  private readonly baseUrl = `${environment.apiUrl}/api/chat`;
  private readonly alertsUrl = `${environment.apiUrl}/api/alerts`;
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private alertsIntervalId: number | null = null;
  private readonly conversationId = signal<string | null>(null);

  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isVisible = signal<boolean>(false);
  readonly screenContext = signal<ScreenContext>('LANDING');
  readonly starterPrompts = signal<string[]>([]);
  readonly starterPromptGroups = signal<StarterPromptGroup[]>([]);
  readonly statusEvents = signal<ChatStatusEvent[]>([]);
  readonly alerts = signal<AlertItem[]>([]);
  readonly pendingLaunchPrompt = signal<{ id: number; prompt: string } | null>(null);
  readonly unreadAlertCount = computed(() =>
    this.alerts().filter((alert) => alert.status === 'OPEN').length
  );

  constructor() {
    this.restoreSession();
    this.startAlertPolling();
  }

  setContext(screenContext: ScreenContext, visible: boolean): void {
    this.screenContext.set(screenContext);
    this.isVisible.set(visible);

    if (visible && this.tokenStorage.hasValidSession()) {
      void this.loadStarterPrompts();
      void this.loadAlerts();
    }
  }

  getConversationId(): string | undefined {
    return this.conversationId() ?? undefined;
  }

  resetSession(): void {
    this.setConversationId(null);
    this.messages.set([]);
    this.statusEvents.set([]);
    void this.loadStarterPrompts();
  }

  launchPrompt(prompt: string, screenContext: ScreenContext = this.screenContext()): void {
    this.setContext(screenContext, true);
    this.pendingLaunchPrompt.set({ id: Date.now(), prompt });
  }

  consumeLaunchPrompt(id: number): void {
    const current = this.pendingLaunchPrompt();
    if (current?.id === id) {
      this.pendingLaunchPrompt.set(null);
    }
  }

  sendAction(action: ChatAction): void {
    if (action.type !== 'FOLLOW_UP_PROMPT') {
      return;
    }

    const prompt = this.readString(action.payload, 'prompt');
    if (prompt) {
      this.sendMessage(prompt);
    }
  }

  sendMessage(content: string): void {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };
    const assistantPlaceholderId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      statusEvents: []
    };

    this.messages.update((messages) => [...messages, userMessage, assistantMessage]);
    this.statusEvents.set([]);
    this.isLoading.set(true);

    const payload: ChatMessageRequest = {
      message: trimmed,
      conversationId: this.getConversationId(),
      screenContext: this.screenContext()
    };

    void this.dispatchMessage(payload, assistantPlaceholderId);
  }

  async loadStarterPrompts(): Promise<void> {
    if (!this.tokenStorage.hasValidSession()) {
      this.starterPrompts.set([]);
      this.starterPromptGroups.set([]);
      return;
    }

    try {
      const params = new HttpParams().set('screenContext', this.screenContext());
      const response = await firstValueFrom(
        this.http.get<StarterPromptsResponse>(`${this.baseUrl}/starter-prompts`, { params })
      );
      this.starterPrompts.set(response.prompts ?? []);
      this.starterPromptGroups.set(response.groups ?? []);
    } catch {
      this.starterPrompts.set([]);
      this.starterPromptGroups.set([]);
    }
  }

  async loadAlerts(): Promise<void> {
    if (!this.tokenStorage.hasValidSession()) {
      this.alerts.set([]);
      return;
    }

    try {
      const alerts = await firstValueFrom(this.http.get<AlertItem[]>(this.alertsUrl));
      this.alerts.set(alerts ?? []);
    } catch {
      this.alerts.set([]);
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await firstValueFrom(this.http.post<AlertItem>(`${this.alertsUrl}/${alertId}/acknowledge`, {}));
    this.alerts.update((alerts) =>
      alerts.map((alert) => (alert.alertId === alertId ? { ...alert, status: 'ACKNOWLEDGED' } : alert))
    );
  }

  private restoreSession(): void {
    this.setConversationId(sessionStorage.getItem(this.conversationIdKey));
  }

  private setConversationId(conversationId: string | null): void {
    this.conversationId.set(conversationId);
    if (conversationId) {
      sessionStorage.setItem(this.conversationIdKey, conversationId);
    } else {
      sessionStorage.removeItem(this.conversationIdKey);
    }
  }

  private async dispatchMessage(
    payload: ChatMessageRequest,
    assistantPlaceholderId: string
  ): Promise<void> {
    try {
      await this.streamViaFetch(payload, assistantPlaceholderId);
    } catch (streamError) {
      const message = this.hasStreamingStarted(assistantPlaceholderId)
        ? 'The live stream was interrupted. You can resend the question if needed.'
        : this.extractRuntimeErrorMessage(streamError);
      this.applyAssistantError(assistantPlaceholderId, message);
    }
  }

  private async streamViaFetch(
    payload: ChatMessageRequest,
    assistantPlaceholderId: string
  ): Promise<void> {
    const token = this.tokenStorage.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok || !response.body) {
      throw new Error(await this.readErrorText(response));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let sawEvent = false;

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      buffer = buffer.replace(/\r/g, '');

      let boundaryIndex = buffer.indexOf('\n\n');
      while (boundaryIndex >= 0) {
        const rawBlock = buffer.slice(0, boundaryIndex).trim();
        buffer = buffer.slice(boundaryIndex + 2);
        if (rawBlock) {
          const event = this.parseSseBlock(rawBlock);
          if (event) {
            sawEvent = true;
            this.handleStreamEvent(event, assistantPlaceholderId);
          }
        }
        boundaryIndex = buffer.indexOf('\n\n');
      }

      if (done) {
        break;
      }
    }

    if (!sawEvent) {
      throw new Error('Empty streaming response');
    }
  }

  private parseSseBlock(rawBlock: string): ChatStreamEvent | null {
    const lines = rawBlock.replace(/\r/g, '').split('\n');
    let eventType = '';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length === 0) {
      return null;
    }

    try {
      const parsed = JSON.parse(dataLines.join('\n')) as ChatStreamEvent;
      return { ...parsed, type: parsed.type ?? (eventType as ChatStreamEvent['type']) };
    } catch {
      return null;
    }
  }

  private handleStreamEvent(event: ChatStreamEvent, assistantPlaceholderId: string): void {
    if (event.conversationId) {
      this.setConversationId(event.conversationId);
    }

    switch (event.type) {
      case 'status':
      case 'tool_start':
      case 'tool_result':
        this.pushStatusEvent(assistantPlaceholderId, event);
        break;
      case 'message_delta':
        this.appendAssistantDelta(assistantPlaceholderId, event.contentDelta ?? '');
        break;
      case 'message_complete':
        this.completeAssistantMessage(assistantPlaceholderId, {
          backendMessageId: event.assistantMessageId,
          intent: this.readString(event.payload, 'intent'),
          sources: this.readArray<ChatSource>(event.payload, 'sources'),
          warnings: this.readArray<string>(event.payload, 'warnings'),
          actions: this.readArray<ChatAction>(event.payload, 'actions'),
          requiresConfirmation: this.readBoolean(event.payload, 'requiresConfirmation'),
          workflowRoute: this.readString(event.payload, 'workflowRoute'),
          confidence: this.readNumber(event.payload, 'confidence'),
          toolCalls: this.readArray<string>(event.payload, 'toolCalls'),
          modelProfileUsed: this.readString(event.payload, 'modelProfileUsed'),
          fallbackUsed: this.readBoolean(event.payload, 'fallbackUsed')
        });
        break;
      case 'error':
        this.applyAssistantError(assistantPlaceholderId, this.extractStreamErrorMessage(event.payload));
        break;
    }
  }

  private appendAssistantDelta(messageId: string, delta: string): void {
    if (!delta) {
      return;
    }

    this.messages.update((messages) =>
      messages.map((message) =>
        message.id === messageId ? { ...message, content: `${message.content}${delta}` } : message
      )
    );
  }

  private pushStatusEvent(messageId: string, event: ChatStreamEvent): void {
    const statusEvent: ChatStatusEvent = {
      type: event.type,
      generatedAt: event.generatedAt ? new Date(event.generatedAt) : new Date(),
      payload: event.payload
    };

    this.statusEvents.update((events) => [...events, statusEvent]);
    this.messages.update((messages) =>
      messages.map((message) =>
        message.id === messageId
          ? { ...message, statusEvents: [...(message.statusEvents ?? []), statusEvent] }
          : message
      )
    );
  }

  private completeAssistantMessage(
    messageId: string,
    completion: {
      content?: string;
      backendMessageId?: string;
      intent?: string;
      sources?: ChatSource[];
      warnings?: string[];
      actions?: ChatAction[];
      requiresConfirmation?: boolean;
      workflowRoute?: string;
      confidence?: number;
      toolCalls?: string[];
      modelProfileUsed?: string;
      fallbackUsed?: boolean;
    }
  ): void {
    this.messages.update((messages) =>
      messages.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        const metadata: ChatMetadata = {
          intent: completion.intent,
          sources: completion.sources ?? [],
          warnings: completion.warnings ?? [],
          actions: completion.actions ?? [],
          requiresConfirmation: completion.requiresConfirmation ?? false,
          workflowRoute: completion.workflowRoute,
          confidence: completion.confidence,
          toolCalls: completion.toolCalls ?? [],
          modelProfileUsed: completion.modelProfileUsed,
          fallbackUsed: completion.fallbackUsed ?? false
        };

        return {
          ...message,
          id: completion.backendMessageId ?? message.id,
          content: completion.content ?? message.content,
          isStreaming: false,
          intent: completion.intent ?? message.intent,
          sources: completion.sources ?? [],
          warnings: completion.warnings ?? [],
          actions: completion.actions ?? [],
          requiresConfirmation: completion.requiresConfirmation ?? false,
          metadata
        };
      })
    );

    this.isLoading.set(false);
  }

  private applyAssistantError(messageId: string, errorMessage: string): void {
    this.messages.update((messages) =>
      messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content: message.content
                ? `${message.content}\n\n${errorMessage}`
                : `Sorry, I could not respond right now. ${errorMessage}`,
              isStreaming: false
            }
          : message
      )
    );

    this.isLoading.set(false);
  }

  private hasStreamingStarted(assistantPlaceholderId: string): boolean {
    const assistant = this.messages().find((message) => message.id === assistantPlaceholderId);
    return !!assistant?.content || (assistant?.statusEvents?.length ?? 0) > 0;
  }

  private extractRuntimeErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Your session has expired. Please sign in again.';
      }
      return error.error?.message || error.message || 'Unable to process chat request.';
    }

    return error instanceof Error ? error.message : 'Unable to process chat request.';
  }

  private extractStreamErrorMessage(payload: unknown): string {
    return this.readString(payload, 'message') || 'Unable to process the live response.';
  }

  private async readErrorText(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }

  private startAlertPolling(): void {
    if (this.alertsIntervalId !== null) {
      return;
    }

    this.alertsIntervalId = window.setInterval(() => {
      if (this.tokenStorage.hasValidSession()) {
        void this.loadAlerts();
      }
    }, this.alertsPollIntervalMs);

    if (this.tokenStorage.hasValidSession()) {
      void this.loadAlerts();
    }
  }

  private readString(source: unknown, key: string): string {
    if (!source || typeof source !== 'object') {
      return '';
    }
    const value = (source as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
  }

  private readBoolean(source: unknown, key: string): boolean {
    if (!source || typeof source !== 'object') {
      return false;
    }
    return Boolean((source as Record<string, unknown>)[key]);
  }

  private readNumber(source: unknown, key: string): number | undefined {
    if (!source || typeof source !== 'object') {
      return undefined;
    }
    const value = (source as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : undefined;
  }

  private readArray<T>(source: unknown, key: string): T[] {
    if (!source || typeof source !== 'object') {
      return [];
    }
    const value = (source as Record<string, unknown>)[key];
    return Array.isArray(value) ? (value as T[]) : [];
  }
}
