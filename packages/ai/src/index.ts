import type { WorkType, IssueData, UXPattern } from '@deva/types';

export class AIEngine {
  constructor() {
    // Claude Code SDK is available in the runtime environment
    // No API key needed when using Claude Code
  }

  async processInput(input: string): Promise<{
    workType: WorkType;
    pattern: UXPattern;
    issueData: Partial<IssueData>;
    confidence: number;
  }> {
    // When running with Claude Code, we can use the built-in Claude model
    // For now, we'll implement a smart pattern matching system
    // In production, this would integrate with Claude Code's SDK
    
    const workType = this.detectWorkType(input);
    const priority = this.detectPriority(input);
    const confidence = this.calculateConfidence(input, workType);
    const pattern = this.determinePattern(workType, confidence);
    
    // Generate a smart title based on the input
    const title = this.generateTitle(input, workType);
    
    return {
      workType,
      pattern,
      issueData: {
        title,
        description: input,
        priority,
      },
      confidence,
    };
  }
  
  private generateTitle(input: string, workType: WorkType): string {
    // Smart title generation based on work type
    const prefixes: Record<WorkType, string> = {
      bug: 'Fix: ',
      documentation: 'Docs: ',
      testing: 'Test: ',
      feature: 'Feature: ',
      infrastructure: 'Infra: ',
      research: 'Research: ',
    };
    
    // Clean up the input for title
    const cleanInput = input
      .replace(/^(bug|fix|issue|problem|error):?\s*/i, '')
      .replace(/^(doc|document|documentation):?\s*/i, '')
      .replace(/^(test|testing|spec):?\s*/i, '')
      .replace(/^(feature|add|implement|create):?\s*/i, '')
      .trim();
    
    // Capitalize first letter
    const capitalizedInput = cleanInput.charAt(0).toUpperCase() + cleanInput.slice(1);
    
    return prefixes[workType] + capitalizedInput;
  }
  
  private detectPriority(input: string): IssueData['priority'] {
    // Detect priority based on keywords
    if (/critical|urgent|asap|immediately|emergency/i.test(input)) {
      return 'critical';
    }
    if (/high|important|soon|quickly/i.test(input)) {
      return 'high';
    }
    if (/low|minor|nice.to.have|eventually/i.test(input)) {
      return 'low';
    }
    return 'medium';
  }
  
  private calculateConfidence(input: string, workType: WorkType): number {
    // Calculate confidence based on clarity and specificity
    let confidence = 50; // Base confidence
    
    // Increase confidence for clear work type indicators
    const patterns = {
      bug: /bug|crash|error|broken|fix|issue/i,
      documentation: /doc|readme|guide|manual|document/i,
      testing: /test|spec|coverage|e2e|unit/i,
      feature: /feature|add|new|implement|create/i,
      infrastructure: /deploy|ci|cd|docker|kubernetes|infrastructure/i,
      research: /research|investigate|explore|analyze|study/i,
    };
    
    if (patterns[workType].test(input)) {
      confidence += 20;
    }
    
    // Increase confidence for specific details
    if (input.length > 50) confidence += 10;
    if (/when|where|what|how/i.test(input)) confidence += 10;
    if (/error\s+message|stack\s+trace|steps\s+to/i.test(input)) confidence += 15;
    
    return Math.min(confidence, 95);
  }

  async refineIssue(issueData: Partial<IssueData>, _refinement: string): Promise<IssueData> {
    // TODO: Implement issue refinement based on refinement input
    return issueData as IssueData;
  }

  async generateQuestions(_workType: WorkType, _context: string): Promise<string[]> {
    // TODO: Generate follow-up questions for conversational pattern
    return [];
  }

  detectWorkType(input: string): WorkType {
    const patterns = {
      bug: /bug|crash|error|broken|fix|issue/i,
      documentation: /doc|readme|guide|manual|document/i,
      testing: /test|spec|coverage|e2e|unit/i,
      feature: /feature|add|new|implement|create/i,
      infrastructure: /deploy|ci|cd|docker|kubernetes|infrastructure/i,
      research: /research|investigate|explore|analyze|study/i,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(input)) {
        return type as WorkType;
      }
    }

    return 'feature'; // default
  }

  determinePattern(workType: WorkType, confidence: number): UXPattern {
    const quickCreateTypes: WorkType[] = ['bug', 'documentation', 'testing'];
    
    if (quickCreateTypes.includes(workType) && confidence > 70) {
      return 'quick-create';
    }
    
    return 'conversational';
  }
}