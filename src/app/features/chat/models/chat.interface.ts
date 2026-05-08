export type ChatRole = 'user' | 'assistant';

export type ScreenContext = 'LANDING' | 'RISK_PROFILE_RESULT' | 'MANUAL_SELECTION_RESULT';

export type ChatIntent =
  | 'REBALANCE_DRAFT'
  | 'SCENARIO_ANALYSIS'
  | 'DATA_QUALITY'
  | 'FUND_COMPARE'
  | 'FUND_RISK'
  | 'FUND_PERFORMANCE'
  | 'RISK_PROFILE_EXPLAINER'
  | 'DIAGNOSTIC_EXPLAINER'
  | 'PORTFOLIO_SUMMARY'
  | 'GENERAL_QA';

export type ChatStreamEventType =
  | 'status'
  | 'tool_start'
  | 'tool_result'
  | 'message_delta'
  | 'message_complete'
  | 'error';

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'DISMISSED';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
  screenContext?: ScreenContext;
}

export interface ChatSource {
  label: string;
  type: string;
  entityId: string | null;
}

export interface ChatAction {
  type: string;
  label: string;
  payload?: unknown;
}

export interface ChatMetadata {
  intent?: ChatIntent | string;
  sources?: ChatSource[];
  warnings?: string[];
  actions?: ChatAction[];
  toolTrace?: unknown;
  fallbackUsed?: boolean;
  requiresConfirmation?: boolean;
  workflowRoute?: string;
  routingConfidence?: number;
  correlationId?: string;
  toolCalls?: string[];
  modelProfileUsed?: string;
}

export interface ChatStatusEvent {
  type: ChatStreamEventType;
  generatedAt: Date;
  payload?: unknown;
}

export interface RebalanceDraftPayload {
  currentAllocationSummary?: Record<string, number>;
  targetAllocationSummary?: Record<string, number>;
  proposedReductions?: Array<Record<string, unknown>>;
  proposedAdditions?: Array<Record<string, unknown>>;
  rationale?: string;
  expectedRiskShift?: string;
  expectedDiversificationImprovement?: string;
  requiresConfirmation?: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  intent?: ChatIntent | string;
  sources?: ChatSource[];
  warnings?: string[];
  actions?: ChatAction[];
  statusEvents?: ChatStatusEvent[];
  requiresConfirmation?: boolean;
  metadata?: ChatMetadata;
}

export interface ChatStreamEvent {
  type: ChatStreamEventType;
  conversationId?: string;
  assistantMessageId?: string;
  correlationId?: string;
  contentDelta?: string;
  payload?: unknown;
  generatedAt?: string;
}

export interface StarterPromptsResponse {
  prompts: string[];
  groups?: StarterPromptGroup[];
}

export interface StarterPromptGroup {
  key: string;
  title: string;
  prompts: string[];
}

export interface AlertItem {
  alertId: string;
  type: string;
  severity: AlertSeverity | string;
  title: string;
  body: string;
  status: AlertStatus | string;
  payload?: unknown;
  createdAt: string;
}
