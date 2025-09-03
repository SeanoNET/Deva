// Work Types
export type WorkType = 
  | 'bug'
  | 'documentation'
  | 'testing'
  | 'feature'
  | 'infrastructure'
  | 'research';

// UX Patterns
export type UXPattern = 'quick-create' | 'conversational';

// Priority Levels
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// Issue Interface
export interface IssueData {
  title: string;
  description: string;
  workType: WorkType;
  team?: string;
  assignee?: string;
  priority: Priority;
  labels: string[];
  linkedIssues: string[];
  confidence: number;
}

// User Preferences
export interface UserPreferences {
  userId: string;
  linearWorkspaceId: string;
  defaultTeam?: string;
  workTypePatterns: Record<WorkType, PatternPreferences>;
  teamAssignmentRules: AssignmentRule[];
}

export interface PatternPreferences {
  defaultPriority: Priority;
  defaultLabels: string[];
  preferredPattern: UXPattern;
}

export interface AssignmentRule {
  condition: string;
  team: string;
  assignee?: string;
}

// Chat Messages
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  issuePreview?: IssueData;
}

// Issue History
export interface IssueHistory {
  id: string;
  userId: string;
  originalInput: string;
  workType: WorkType;
  finalIssue: IssueData;
  corrections: UserCorrection[];
  createdAt: number;
}

export interface UserCorrection {
  field: keyof IssueData;
  originalValue: any;
  correctedValue: any;
  timestamp: number;
}

// Enhanced UX Types for Phase 1 Implementation

// AI Reasoning and Transparency
export interface AIReasoningData {
  workTypeReasoning: {
    detected: WorkType;
    confidence: number;
    reasoning: string;
    alternatives: { type: WorkType; confidence: number }[];
  };
  priorityReasoning: {
    detected: Priority;
    confidence: number;
    reasoning: string;
    factors: string[];
  };
  labelReasoning: {
    suggested: string[];
    confidence: number;
    reasoning: string;
    sources: string[];
  };
  questionsReasoning: {
    questions: string[];
    reasoning: string;
    confidenceImpact: number;
  };
}

// Confidence Metrics with Explanations
export interface ConfidenceMetrics {
  overall: number;
  breakdown: {
    workType: number;
    priority: number;
    title: number;
    description: number;
    labels: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  improvementSuggestions: string[];
}

// Real-time Editing Support
export interface EditableField {
  value: any;
  isEditing: boolean;
  hasChanges: boolean;
  originalValue: any;
  validationError?: string;
}

export interface EditableIssueData {
  title: EditableField;
  description: EditableField;
  workType: EditableField;
  priority: EditableField;
  labels: EditableField;
  confidence: number;
  reasoning?: AIReasoningData;
  metrics?: ConfidenceMetrics;
}

// UX Flow Control
export type CreationMode = 'quick-fix' | 'collaborative' | 'power-user';

export interface UXFlowState {
  mode: CreationMode;
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  requiresReview: boolean;
}

// Enhanced Message with UX Features
export interface EnhancedMessage extends Message {
  reasoning?: AIReasoningData;
  editableIssue?: EditableIssueData;
  uxFlow?: UXFlowState;
}