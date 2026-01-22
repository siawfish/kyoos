import { Skill, Worker } from "./types";

/**
 * Agent Conversation Protocol Types
 * 
 * This module defines the types for the conversational AI agent that helps
 * users find service providers. The agent asks clarifying questions until
 * it has enough information to provide accurate skill matching, duration
 * estimates, and price estimates.
 */

// ============================================================================
// Conversation Session Types
// ============================================================================

/**
 * Unique identifier for a conversation session
 */
export type ConversationId = string;

/**
 * Status of the conversation
 */
export enum ConversationStatus {
  /** Agent is gathering information */
  IN_PROGRESS = 'in_progress',
  /** Agent has enough info and is ready to search */
  READY_TO_SEARCH = 'ready_to_search',
  /** Agent has completed the search and returned results */
  COMPLETED = 'completed',
  /** Conversation was abandoned or expired */
  EXPIRED = 'expired',
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Role of the message sender
 */
export enum MessageRole {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system',
}

/**
 * Base message structure
 */
export interface BaseMessage {
  id: string;
  role: MessageRole;
  timestamp: string;
}

/**
 * User message sent to the agent
 */
export interface UserMessage extends BaseMessage {
  role: MessageRole.USER;
  content: string;
  /** If user selected an option, this contains the selected option ID */
  selectedOptionId?: string;
}

/**
 * Agent message response
 */
export interface AgentMessage extends BaseMessage {
  role: MessageRole.AGENT;
  content: string;
  /** Question for the user (if agent needs more info) */
  question?: AgentQuestion;
  /** Thinking/reasoning shown to user (like Cursor's plan mode) */
  thinking?: string;
  /** Final analysis result (when agent has enough info) */
  analysis?: AgentAnalysis;
}

/**
 * System message for internal tracking
 */
export interface SystemMessage extends BaseMessage {
  role: MessageRole.SYSTEM;
  content: string;
}

export type ConversationMessage = UserMessage | AgentMessage | SystemMessage;

// ============================================================================
// Agent Question Types
// ============================================================================

/**
 * Type of question the agent is asking
 */
export enum QuestionType {
  /** Multiple choice with single selection */
  SINGLE_SELECT = 'single_select',
  /** Multiple choice with multiple selections */
  MULTI_SELECT = 'multi_select',
  /** Single selection with optional text input */
  SINGLE_SELECT_WITH_TEXT = 'single_select_with_text',
  /** Free text input */
  TEXT_INPUT = 'text_input',
  /** Yes/No confirmation */
  CONFIRMATION = 'confirmation',
  /** Number input (e.g., for room count, area size) */
  NUMBER_INPUT = 'number_input',
}

/**
 * Option for multiple choice questions
 */
export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Question the agent asks the user
 */
export interface AgentQuestion {
  id: string;
  type: QuestionType;
  /** Main question text */
  text: string;
  /** Optional hint or helper text */
  hint?: string;
  /** Options for select-type questions */
  options?: QuestionOption[];
  /** Whether the question can be skipped */
  optional?: boolean;
  /** For number inputs: min/max values */
  validation?: {
    min?: number;
    max?: number;
    placeholder?: string;
  };
  /** Whether to show text input alongside options (for hybrid questions) */
  allowAdditionalText?: boolean;
}

// ============================================================================
// Agent Analysis Types (Final Result)
// ============================================================================

/**
 * Agent's analysis when it has gathered enough information
 */
export interface AgentAnalysis {
  /** Whether this is a valid service task */
  isServiceTask: boolean;
  /** Explanation of the analysis */
  reasoning: string;
  /** Summary of what the user needs */
  taskSummary: string;
  /** Identified required skills */
  requiredSkills: Skill[];
  /** Tools that might be needed */
  requiredTools: string[];
  /** Estimated duration in milliseconds */
  estimatedDuration: number;
  /** Price estimate range */
  estimatedPrice: {
    min: number;
    max: number;
    currency: string;
  };
  /** Confidence score (0-1) */
  confidence: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request to start a new conversation
 */
export interface StartConversationRequest {
  query: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

/**
 * Request to continue an existing conversation
 */
export interface ContinueConversationRequest {
  conversationId: ConversationId;
  /** User's text response */
  message?: string;
  /** Selected option ID (for question responses) */
  selectedOptionId?: string;
  /** Multiple selected option IDs (for multi-select) */
  selectedOptionIds?: string[];
}

/**
 * Response from the agent
 */
export interface AgentResponse {
  conversationId: ConversationId;
  status: ConversationStatus;
  /** The agent's message */
  message: AgentMessage;
  /** History of the conversation */
  messages: ConversationMessage[];
  /** If ready_to_search or completed, includes search results */
  results?: AgentSearchResults;
}

/**
 * Final search results from the agent
 */
export interface AgentSearchResults {
  analysis: AgentAnalysis;
  closestWorkers: Worker[];
  recommendedWorkers: Worker[];
  searchReferenceId: string;
  formattedPrice: string;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * State for the agent conversation UI
 */
export interface AgentConversationState {
  /** Current conversation ID */
  conversationId: ConversationId | null;
  /** Conversation status */
  status: ConversationStatus | null;
  /** All messages in the conversation */
  messages: ConversationMessage[];
  /** Current question being asked (if any) */
  currentQuestion: AgentQuestion | null;
  /** Is the agent processing */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Final results when conversation is complete */
  results: AgentSearchResults | null;
}
