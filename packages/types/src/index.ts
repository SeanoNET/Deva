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