export type ChatRole = 'user' | 'assistant';

export type ScreenContext = 'LANDING' | 'RISK_PROFILE_RESULT' | 'MANUAL_SELECTION_RESULT' | 'GOAL_PLANNER' | 'FUND_STORY' | 'PEER_COMPARE';

export type ChatIntent =
  | 'REBALANCE_DRAFT'
  | 'DATA_QUALITY'
  | 'FUND_COMPARE'
  | 'FUND_RISK'
  | 'FUND_PERFORMANCE'
  | 'RISK_PROFILE_EXPLAINER'
  | 'DIAGNOSTIC_EXPLAINER'
  | 'PORTFOLIO_SUMMARY'
  | 'GENERAL_QA'
  | 'WHAT_IF'
  | 'GOAL_PLANNING'
  | 'FUND_STORY'
  | 'STATEMENT_ANALYZE'
  | 'PEER_COMPARE';

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
  contentDelta?: string;
  payload?: unknown;
  generatedAt?: string;
}

export interface StarterPromptsResponse {
  prompts: string[];
}

export interface WhatIfResult {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  diff: Record<string, unknown>;
}

export interface GoalPlan {
  goalSummary: Record<string, unknown>;
  sipPlan: Record<string, unknown>;
  allocationAdvice: Record<string, unknown>;
  recommendedFunds: Array<Record<string, unknown>>;
}

export interface FundStory {
  identity: Record<string, unknown>;
  position?: Record<string, unknown>;
  performance?: Record<string, unknown>;
  riskMetrics?: Record<string, unknown>;
  sectorAllocation?: Record<string, unknown>;
  topStockHoldings?: Record<string, unknown>;
  categoryPeers?: Array<Record<string, unknown>>;
  categoryAvgExpenseRatio?: number;
}

export interface PeerComparison {
  you: Record<string, unknown>;
  peers: Record<string, unknown>;
  highlights: Record<string, unknown>;
  riskProfile: string;
  portfolioSizeBracket: string;
}

export interface PortfolioBriefing {
  briefingId: string;
  briefingType: string;
  title: string;
  content: string;
  metricsJson: Record<string, unknown>;
  alertsSummary: Array<Record<string, unknown>>;
  isRead: boolean;
  createdAt: string;
}

export interface UserGoal {
  goalId: string;
  goalType: string;
  goalName: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  monthlySip: number;
  expectedReturnPct: number;
  status: string;
  createdAt: string;
}

export interface StatementAnalysisResult {
  extractedCount: number;
  matchedToPortfolio: Array<Record<string, unknown>>;
  newFunds: Array<Record<string, unknown>>;
  unmatched: Array<Record<string, unknown>>;
  matchedCount: number;
  newFundCount: number;
  unmatchedCount: number;
  error?: string;
}

export interface ChatConversation {
  conversationId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface RebalanceExecutionPlan {
  steps: Array<{
    step: number;
    action: string;
    fundName: string;
    amount: number;
    units?: number;
    instruction: string;
    taxImpact?: Record<string, unknown>;
  }>;
  totalRedemption: number;
  totalInvestment: number;
  taxSummary: Record<string, unknown>;
  disclaimer: string;
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
