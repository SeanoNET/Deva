import { ClaudeCode } from 'claude-code-sdk';
import type { 
  WorkType, 
  IssueData, 
  UXPattern, 
  Message, 
  AIReasoningData, 
  ConfidenceMetrics, 
  EditableIssueData, 
  CreationMode 
} from '@deva/types';

export class AIEngine {
  private claudeCode: ClaudeCode;

  constructor() {
    // Initialize Claude Code SDK (works with desktop subscriptions)
    this.claudeCode = new ClaudeCode({
      // No API key needed - uses Claude desktop subscription
    });
  }

  async processInput(input: string, context?: Message[]): Promise<{
    workType: WorkType;
    pattern: UXPattern;
    issueData: Partial<IssueData>;
    confidence: number;
    suggestedLabels?: string[];
    questions?: string[];
    reasoning?: AIReasoningData;
    metrics?: ConfidenceMetrics;
    editableIssue?: EditableIssueData;
    creationMode?: CreationMode;
  }> {
    // Try Claude Code SDK first
    try {
      const response = await this.analyzeWithClaudeCode(input, context);
      return response;
    } catch (error) {
      console.warn('Claude Code SDK analysis failed, falling back to pattern matching:', error);
    }
    
    // Fallback to enhanced pattern matching
    return this.simulateAIAnalysis(input, context);
  }

  private async analyzeWithClaudeCode(
    input: string,
    context?: Message[]
  ): Promise<{
    workType: WorkType;
    pattern: UXPattern;
    issueData: Partial<IssueData>;
    confidence: number;
    suggestedLabels?: string[];
    questions?: string[];
    reasoning?: AIReasoningData;
    metrics?: ConfidenceMetrics;
    editableIssue?: EditableIssueData;
    creationMode?: CreationMode;
  }> {
    const contextString = context ? 
      `Previous conversation context:\n${context.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n` : 
      '';

    const systemPrompt = `You are Deva, an intelligent development assistant that transforms natural language into structured Linear work items. You analyze user input and provide detailed analysis for issue creation.

Your task is to analyze the following input and return a JSON response with the following structure:

{
  "workType": "bug" | "feature" | "documentation" | "testing" | "infrastructure" | "research",
  "priority": "critical" | "high" | "medium" | "low",
  "title": "Clear, concise title for the issue",
  "description": "Enhanced description with appropriate structure for the work type",
  "confidence": number (30-95),
  "labels": ["array", "of", "relevant", "labels"],
  "questions": ["clarifying", "questions", "if", "needed"],
  "reasoning": {
    "workTypeReasoning": {
      "detected": "workType",
      "confidence": number,
      "reasoning": "explanation",
      "alternatives": [{"type": "alternative", "confidence": number}]
    },
    "priorityReasoning": {
      "detected": "priority",
      "confidence": number,
      "reasoning": "explanation",
      "factors": ["factor1", "factor2"]
    },
    "labelReasoning": {
      "suggested": ["labels"],
      "confidence": number,
      "reasoning": "explanation",
      "sources": ["source1", "source2"]
    },
    "questionsReasoning": {
      "questions": ["questions"],
      "reasoning": "explanation",
      "confidenceImpact": number
    }
  }
}

Guidelines:
- Be precise in work type detection
- Generate clear, actionable titles
- Add appropriate structure to descriptions (e.g., steps to reproduce for bugs, acceptance criteria for features)
- Suggest relevant technical labels
- Ask clarifying questions only when necessary
- Provide detailed reasoning for transparency`;

    try {
      // Use Claude Code SDK which works with desktop subscriptions
      const message = await this.claudeCode.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `${contextString}User input: ${input}`
          }
        ]
      });

      const response = message.content[0];
      if (response.type === 'text' && response.text) {
        const claudeResponse = JSON.parse(response.text);
        
        // Transform Claude response to our format
        const workType = claudeResponse.workType as WorkType;
        const pattern = this.determinePattern(workType, claudeResponse.confidence);
        
        const reasoning: AIReasoningData = claudeResponse.reasoning;
        const metrics = this.generateMetrics(
          claudeResponse.confidence,
          input,
          workType,
          claudeResponse.priority
        );
        const editableIssue = this.createEditableIssue(
          claudeResponse.title,
          claudeResponse.description,
          workType,
          claudeResponse.priority,
          claudeResponse.labels,
          claudeResponse.confidence,
          reasoning,
          metrics
        );
        const creationMode = this.determineCreationMode(claudeResponse.confidence, claudeResponse.questions.length);

        return {
          workType,
          pattern,
          issueData: {
            title: claudeResponse.title,
            description: claudeResponse.description,
            priority: claudeResponse.priority,
            labels: claudeResponse.labels,
          },
          confidence: claudeResponse.confidence,
          suggestedLabels: claudeResponse.labels,
          questions: claudeResponse.questions,
          reasoning,
          metrics,
          editableIssue,
          creationMode,
        };
      }
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }

    throw new Error('Unexpected response format from Claude API');
  }

  private async simulateAIAnalysis(input: string, _context?: Message[]): Promise<{
    workType: WorkType;
    pattern: UXPattern;
    issueData: Partial<IssueData>;
    confidence: number;
    suggestedLabels?: string[];
    questions?: string[];
    reasoning?: AIReasoningData;
    metrics?: ConfidenceMetrics;
    editableIssue?: EditableIssueData;
    creationMode?: CreationMode;
  }> {
    // Enhanced AI-style analysis that goes beyond pattern matching
    // Note: _context parameter is reserved for future use with conversational analysis
    let workType: WorkType = 'feature';
    let priority: IssueData['priority'] = 'medium';
    let confidence = 75;
    let title = '';
    let description = input;
    const labels: string[] = [];
    const questions: string[] = [];

    // Advanced work type detection with context awareness
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('error') || lowerInput.includes('crash') || lowerInput.includes('broken') || 
        lowerInput.includes('not work') || lowerInput.includes('bug') || lowerInput.includes('fix')) {
      workType = 'bug';
      confidence += 10;
      
      title = input.replace(/^(bug|fix|error|issue):\s*/i, '').replace(/\s+/g, ' ').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      if (!lowerInput.includes('steps') && !lowerInput.includes('reproduce')) {
        questions.push('What are the steps to reproduce this issue?');
        confidence -= 15;
      }
      if (!lowerInput.includes('expected')) {
        questions.push('What was the expected behavior?');
        confidence -= 10;
      }
      
      description = `${input}\n\n**Steps to Reproduce:**\n${lowerInput.includes('steps') ? '' : '[Please provide steps]'}\n\n**Expected Behavior:**\n[To be specified]\n\n**Actual Behavior:**\n[To be specified]`;
    } 
    else if (lowerInput.includes('doc') || lowerInput.includes('readme') || lowerInput.includes('guide') || 
             lowerInput.includes('manual') || lowerInput.includes('wiki')) {
      workType = 'documentation';
      confidence += 15;
      
      title = input.replace(/^(doc|docs|document|readme):\s*/i, '').replace(/\s+/g, ' ').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      if (!lowerInput.includes('audience') && !lowerInput.includes('user')) {
        questions.push('Who is the target audience for this documentation?');
        confidence -= 10;
      }
    }
    else if (lowerInput.includes('test') || lowerInput.includes('spec') || lowerInput.includes('coverage') || 
             lowerInput.includes('e2e') || lowerInput.includes('unit')) {
      workType = 'testing';
      confidence += 15;
      
      title = input.replace(/^(test|testing|spec):\s*/i, '').replace(/\s+/g, ' ').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      if (!lowerInput.includes('type') && !lowerInput.includes('unit') && !lowerInput.includes('integration')) {
        questions.push('What type of testing is needed (unit, integration, E2E)?');
        confidence -= 10;
      }
    }
    else if (lowerInput.includes('deploy') || lowerInput.includes('ci') || lowerInput.includes('cd') || 
             lowerInput.includes('docker') || lowerInput.includes('kubernetes') || lowerInput.includes('infra')) {
      workType = 'infrastructure';
      confidence += 10;
      
      title = input.replace(/^(deploy|infra|infrastructure):\s*/i, '').replace(/\s+/g, ' ').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      if (!lowerInput.includes('environment')) {
        questions.push('Which environments will this affect?');
        confidence -= 10;
      }
    }
    else if (lowerInput.includes('research') || lowerInput.includes('investigate') || lowerInput.includes('explore') || 
             lowerInput.includes('analyze') || lowerInput.includes('study')) {
      workType = 'research';
      confidence += 10;
      
      title = input.replace(/^(research|investigate|explore):\s*/i, '').replace(/\s+/g, ' ').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      if (!lowerInput.includes('goal') && !lowerInput.includes('outcome')) {
        questions.push('What is the expected outcome or goal of this research?');
        confidence -= 15;
      }
    }
    else {
      // Feature by default
      workType = 'feature';
      title = input.replace(/^(add|create|implement|feature):\s*/i, '').replace(/\s+/g, ' ').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      if (!lowerInput.includes('user') && !lowerInput.includes('customer')) {
        questions.push('Who are the primary users of this feature?');
        confidence -= 10;
      }
      if (!lowerInput.includes('problem') && !lowerInput.includes('solve')) {
        questions.push('What problem does this feature solve?');
        confidence -= 10;
      }
      
      description = `${input}\n\n**Acceptance Criteria:**\n- [ ] [To be specified]\n- [ ] [To be specified]`;
    }

    // Enhanced priority detection
    if (lowerInput.includes('critical') || lowerInput.includes('urgent') || lowerInput.includes('asap') || 
        lowerInput.includes('immediately') || lowerInput.includes('emergency') || lowerInput.includes('crash')) {
      priority = 'critical';
      confidence += 5;
    } else if (lowerInput.includes('high') || lowerInput.includes('important') || lowerInput.includes('soon') || 
               lowerInput.includes('quickly') || lowerInput.includes('priority')) {
      priority = 'high';
      confidence += 5;
    } else if (lowerInput.includes('low') || lowerInput.includes('minor') || lowerInput.includes('nice') || 
               lowerInput.includes('eventually') || lowerInput.includes('later')) {
      priority = 'low';
    }

    // Enhanced label detection
    labels.push(workType);
    
    if (lowerInput.includes('frontend') || lowerInput.includes('ui') || lowerInput.includes('ux') || 
        lowerInput.includes('component') || lowerInput.includes('css') || lowerInput.includes('react')) {
      labels.push('frontend');
    }
    if (lowerInput.includes('backend') || lowerInput.includes('api') || lowerInput.includes('database') || 
        lowerInput.includes('server') || lowerInput.includes('endpoint')) {
      labels.push('backend');
    }
    if (lowerInput.includes('performance') || lowerInput.includes('slow') || lowerInput.includes('optimize') || 
        lowerInput.includes('speed') || lowerInput.includes('fast')) {
      labels.push('performance');
    }
    if (lowerInput.includes('security') || lowerInput.includes('auth') || lowerInput.includes('permission') || 
        lowerInput.includes('vulnerability') || lowerInput.includes('encrypt')) {
      labels.push('security');
    }
    if (lowerInput.includes('mobile') || lowerInput.includes('ios') || lowerInput.includes('android') || 
        lowerInput.includes('responsive')) {
      labels.push('mobile');
    }

    // Adjust confidence based on input quality
    if (input.length > 100) confidence += 10;
    if (input.length < 20) confidence -= 20;
    if (lowerInput.includes('when') || lowerInput.includes('where') || lowerInput.includes('what') || 
        lowerInput.includes('how') || lowerInput.includes('why')) confidence += 5;

    confidence = Math.max(30, Math.min(95, confidence));

    const pattern = this.determinePattern(workType, confidence);

    // Generate reasoning and metrics for enhanced UX
    const reasoning = this.generateReasoning(workType, priority, labels, questions, input, confidence);
    const metrics = this.generateMetrics(confidence, input, workType, priority);
    const editableIssue = this.createEditableIssue(title, description, workType, priority, labels, confidence, reasoning, metrics);
    const creationMode = this.determineCreationMode(confidence, questions.length);

    return {
      workType,
      pattern,
      issueData: {
        title: title || 'New Issue',
        description,
        priority,
        labels: [...new Set(labels)],
      },
      confidence,
      suggestedLabels: [...new Set(labels)],
      questions: questions.slice(0, 3), // Max 3 questions
      reasoning,
      metrics,
      editableIssue,
      creationMode,
    };
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

  async refineIssue(
    issueData: Partial<IssueData>,
    refinement: string,
    context?: Message[]
  ): Promise<IssueData> {
    // Try Claude Code SDK refinement if available
    try {
      const refined = await this.refineWithClaudeCode(issueData, refinement, context);
      return refined;
    } catch (error) {
      console.warn('Claude Code SDK refinement failed:', error);
    }

    // Fallback refinement logic
    return this.refineWithFallback(issueData, refinement);
  }

  private async refineWithClaudeCode(
    issueData: Partial<IssueData>,
    refinement: string,
    context?: Message[]
  ): Promise<IssueData> {
    const contextString = context ? 
      `Previous conversation context:\n${context.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n` : 
      '';

    const systemPrompt = `You are Deva, an intelligent development assistant. You need to refine an existing issue based on user feedback.

Current issue data:
${JSON.stringify(issueData, null, 2)}

User refinement request: ${refinement}

Please return a refined version of the issue in JSON format with the same structure as the original, but updated based on the user's refinement. Make intelligent decisions about what to update, add, or modify.

Ensure the response is a valid JSON object with these required fields:
- title: string
- description: string  
- workType: "bug" | "feature" | "documentation" | "testing" | "infrastructure" | "research"
- priority: "critical" | "high" | "medium" | "low"
- labels: string[]
- linkedIssues: string[]
- confidence: number (30-95)`;

    try {
      const message = await this.claudeCode.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `${contextString}Please refine the issue based on: ${refinement}`
          }
        ]
      });

      const response = message.content[0];
      if (response.type === 'text' && response.text) {
        const refinedIssue = JSON.parse(response.text);
        return refinedIssue as IssueData;
      }
    } catch (error) {
      console.error('Claude Code SDK refinement error:', error);
      throw error;
    }

    throw new Error('Unexpected response format from Claude API');
  }

  private refineWithFallback(
    issueData: Partial<IssueData>,
    refinement: string
  ): IssueData {
    const updatedIssue = { ...issueData };
    
    // Update based on refinement keywords
    if (/priority|urgent|critical|high|medium|low/i.test(refinement)) {
      updatedIssue.priority = this.detectPriority(refinement);
    }
    
    if (/title|rename|called/i.test(refinement)) {
      const titleMatch = refinement.match(/(?:title|rename|called)\s*[:=]?\s*(.+)/i);
      if (titleMatch) {
        updatedIssue.title = titleMatch[1].trim();
      }
    }
    
    if (/label|tag/i.test(refinement)) {
      const labelMatch = refinement.match(/(?:label|tag)\s*[:=]?\s*(.+)/i);
      if (labelMatch) {
        const newLabels = labelMatch[1].split(/[,;]/).map(l => l.trim());
        updatedIssue.labels = [...(updatedIssue.labels || []), ...newLabels];
      }
    }
    
    // Add refinement to description if it contains additional context
    if (!/(priority|title|rename|called|label|tag)/i.test(refinement)) {
      updatedIssue.description = `${issueData.description || ''}\n\nAdditional details:\n${refinement}`;
    }
    
    return {
      ...updatedIssue,
      workType: updatedIssue.workType || 'feature',
      priority: updatedIssue.priority || 'medium',
      labels: updatedIssue.labels || [],
      linkedIssues: updatedIssue.linkedIssues || [],
      confidence: updatedIssue.confidence || 85,
      title: updatedIssue.title || 'New Issue',
      description: updatedIssue.description || '',
    } as IssueData;
  }

  async generateQuestions(workType: WorkType, context: string): Promise<string[]> {
    // Generate contextual follow-up questions
    const questions: string[] = [];
    
    switch (workType) {
      case 'bug':
        questions.push(
          'What steps can reproduce this issue?',
          'What was the expected behavior?',
          'Which environment or version is affected?'
        );
        break;
      case 'feature':
        questions.push(
          'Who are the primary users of this feature?',
          'What problem does this solve?',
          'Are there any technical constraints to consider?'
        );
        break;
      case 'documentation':
        questions.push(
          'Which sections need to be documented?',
          'Who is the target audience?',
          'Are there any examples or code snippets to include?'
        );
        break;
      case 'testing':
        questions.push(
          'What type of testing is needed (unit, integration, E2E)?',
          'What are the critical paths to test?',
          'What is the expected coverage target?'
        );
        break;
      case 'infrastructure':
        questions.push(
          'What environments will this affect?',
          'Are there any security considerations?',
          'What is the rollback plan?'
        );
        break;
      case 'research':
        questions.push(
          'What is the success criteria for this research?',
          'What is the timeline for this investigation?',
          'Who are the stakeholders for the findings?'
        );
        break;
    }
    
    // Filter questions based on context already provided
    return questions.filter(q => {
      const keywords = q.toLowerCase().match(/\b\w+\b/g) || [];
      return !keywords.some(keyword => context.toLowerCase().includes(keyword));
    }).slice(0, 3);
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


  // Method to learn from user corrections
  async learnFromCorrection(
    original: IssueData,
    corrected: IssueData,
    userId: string
  ): Promise<void> {
    // Store correction patterns for future improvement
    // This would typically be stored in a database for pattern learning
    console.log(`Learning from correction for user ${userId}:`, {
      original,
      corrected,
      corrections: this.identifyCorrections(original, corrected),
    });
  }

  private identifyCorrections(original: IssueData, corrected: IssueData): Record<string, any> {
    const corrections: Record<string, any> = {};
    
    Object.keys(original).forEach(key => {
      const k = key as keyof IssueData;
      if (JSON.stringify(original[k]) !== JSON.stringify(corrected[k])) {
        corrections[key] = {
          from: original[k],
          to: corrected[k],
        };
      }
    });
    
    return corrections;
  }

  // Enhanced UX Helper Methods

  private generateReasoning(
    workType: WorkType,
    priority: IssueData['priority'],
    labels: string[],
    questions: string[],
    input: string,
    confidence: number
  ): AIReasoningData {
    // Generate comprehensive reasoning for AI decisions
    const lowerInput = input.toLowerCase();
    const workTypeReasons = this.getWorkTypeReasoning(workType, lowerInput, confidence);
    const priorityReasons = this.getPriorityReasoning(priority, lowerInput, confidence);
    const labelReasons = this.getLabelReasoning(labels, lowerInput, confidence);
    const questionReasons = this.getQuestionReasoning(questions, confidence);

    return {
      workTypeReasoning: workTypeReasons,
      priorityReasoning: priorityReasons,
      labelReasoning: labelReasons,
      questionsReasoning: questionReasons,
    };
  }

  private generateMetrics(
    overallConfidence: number,
    input: string,
    workType: WorkType,
    priority: IssueData['priority']
  ): ConfidenceMetrics {
    // Calculate detailed confidence breakdown
    const lowerInput = input.toLowerCase();
    
    const workTypeConfidence = this.calculateWorkTypeConfidence(workType, lowerInput);
    const priorityConfidence = this.calculatePriorityConfidence(priority, lowerInput);
    const titleConfidence = input.trim().length > 0 ? Math.min(95, input.trim().length * 2) : 30;
    const descriptionConfidence = input.length > 20 ? 85 : Math.max(40, input.length * 2);
    const labelsConfidence = this.calculateLabelsConfidence(lowerInput);

    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const improvementSuggestions: string[] = [];

    // Analyze positive factors
    if (overallConfidence >= 80) positiveFactors.push('Clear and specific request');
    if (lowerInput.includes('user') || lowerInput.includes('customer')) positiveFactors.push('User-focused language detected');
    if (workTypeConfidence >= 85) positiveFactors.push('Strong work type indicators');

    // Analyze negative factors
    if (overallConfidence < 70) negativeFactors.push('Request could be more specific');
    if (input.length < 20) negativeFactors.push('Very brief description provided');
    if (priorityConfidence < 60) negativeFactors.push('Priority indicators unclear');

    // Generate improvement suggestions
    if (titleConfidence < 70) improvementSuggestions.push('Consider providing a clearer title or main objective');
    if (descriptionConfidence < 70) improvementSuggestions.push('Add more details about the requirements or context');
    if (labelsConfidence < 60) improvementSuggestions.push('Include technical context or component names');

    return {
      overall: overallConfidence,
      breakdown: {
        workType: workTypeConfidence,
        priority: priorityConfidence,
        title: titleConfidence,
        description: descriptionConfidence,
        labels: labelsConfidence,
      },
      factors: {
        positive: positiveFactors,
        negative: negativeFactors,
      },
      improvementSuggestions,
    };
  }

  private createEditableIssue(
    title: string,
    description: string,
    workType: WorkType,
    priority: IssueData['priority'],
    labels: string[],
    confidence: number,
    reasoning: AIReasoningData,
    metrics: ConfidenceMetrics
  ): EditableIssueData {
    return {
      title: {
        value: title || 'New Issue',
        isEditing: false,
        hasChanges: false,
        originalValue: title || 'New Issue',
      },
      description: {
        value: description,
        isEditing: false,
        hasChanges: false,
        originalValue: description,
      },
      workType: {
        value: workType,
        isEditing: false,
        hasChanges: false,
        originalValue: workType,
      },
      priority: {
        value: priority,
        isEditing: false,
        hasChanges: false,
        originalValue: priority,
      },
      labels: {
        value: labels,
        isEditing: false,
        hasChanges: false,
        originalValue: labels,
      },
      confidence,
      reasoning,
      metrics,
    };
  }

  private determineCreationMode(confidence: number, questionsCount: number): CreationMode {
    if (confidence >= 85 && questionsCount <= 1) {
      return 'quick-fix';
    } else if (confidence >= 60 && questionsCount <= 2) {
      return 'collaborative';
    }
    return 'power-user';
  }

  // Helper methods for reasoning generation

  private getWorkTypeReasoning(workType: WorkType, input: string, confidence: number) {
    const alternatives: { type: WorkType; confidence: number }[] = [];
    let reasoning = '';

    switch (workType) {
      case 'bug':
        reasoning = 'Detected error-related keywords like "crash", "broken", "not working", or "fix"';
        if (input.includes('feature')) alternatives.push({ type: 'feature', confidence: 65 });
        break;
      case 'feature':
        reasoning = 'Default classification for new functionality or enhancements';
        if (input.includes('fix')) alternatives.push({ type: 'bug', confidence: 60 });
        if (input.includes('test')) alternatives.push({ type: 'testing', confidence: 55 });
        break;
      case 'documentation':
        reasoning = 'Detected documentation keywords like "doc", "guide", "readme", or "wiki"';
        break;
      case 'testing':
        reasoning = 'Detected testing keywords like "test", "spec", "coverage", or "e2e"';
        break;
      case 'infrastructure':
        reasoning = 'Detected infrastructure keywords like "deploy", "docker", "ci/cd", or "kubernetes"';
        break;
      case 'research':
        reasoning = 'Detected research keywords like "investigate", "explore", "analyze", or "study"';
        break;
    }

    return {
      detected: workType,
      confidence,
      reasoning,
      alternatives,
    };
  }

  private getPriorityReasoning(priority: IssueData['priority'], input: string, confidence: number) {
    let reasoning = '';
    const factors: string[] = [];

    switch (priority) {
      case 'critical':
        reasoning = 'High-impact keywords detected suggesting urgent action required';
        factors.push('Contains critical impact indicators');
        break;
      case 'high':
        reasoning = 'Important functionality affected or user-facing impact detected';
        factors.push('Affects user experience or core functionality');
        break;
      case 'medium':
        reasoning = 'Standard priority based on general importance indicators';
        factors.push('Balanced importance without urgency indicators');
        break;
      case 'low':
        reasoning = 'Lower priority based on enhancement or nice-to-have nature';
        factors.push('Enhancement or non-critical improvement');
        break;
    }

    if (input.includes('urgent') || input.includes('critical')) {
      factors.push('Explicit urgency indicators in description');
    }

    return {
      detected: priority,
      confidence,
      reasoning,
      factors,
    };
  }

  private getLabelReasoning(labels: string[], input: string, confidence: number) {
    const sources: string[] = [];
    let reasoning = '';

    if (labels.length > 0) {
      reasoning = `Generated ${labels.length} labels based on technical and contextual indicators`;
      
      if (input.includes('frontend') || input.includes('ui') || input.includes('component')) {
        sources.push('Frontend/UI terminology detected');
      }
      if (input.includes('backend') || input.includes('api') || input.includes('server')) {
        sources.push('Backend/API terminology detected');
      }
      if (input.includes('mobile') || input.includes('responsive')) {
        sources.push('Mobile/responsive indicators found');
      }
    } else {
      reasoning = 'No specific technical labels could be confidently determined';
      sources.push('Generic request without clear technical context');
    }

    return {
      suggested: labels,
      confidence,
      reasoning,
      sources,
    };
  }

  private getQuestionReasoning(questions: string[], _confidence: number) {
    let reasoning = '';
    let confidenceImpact = 0;

    if (questions.length > 0) {
      reasoning = `Generated ${questions.length} clarifying questions to improve accuracy and completeness`;
      confidenceImpact = Math.min(25, questions.length * 8);
    } else {
      reasoning = 'Request is sufficiently detailed, no additional questions needed';
      confidenceImpact = 5;
    }

    return {
      questions,
      reasoning,
      confidenceImpact,
    };
  }

  private calculateWorkTypeConfidence(workType: WorkType, input: string): number {
    const indicators = {
      bug: ['error', 'crash', 'broken', 'not work', 'bug', 'fix', 'issue'],
      feature: ['add', 'create', 'implement', 'new', 'feature'],
      documentation: ['doc', 'readme', 'guide', 'manual', 'wiki'],
      testing: ['test', 'spec', 'coverage', 'e2e', 'unit'],
      infrastructure: ['deploy', 'ci', 'cd', 'docker', 'kubernetes', 'infra'],
      research: ['research', 'investigate', 'explore', 'analyze', 'study'],
    };

    const relevantIndicators = indicators[workType] || [];
    const matchCount = relevantIndicators.filter(indicator => input.includes(indicator)).length;
    
    return Math.min(95, 60 + (matchCount * 15));
  }

  private calculatePriorityConfidence(priority: IssueData['priority'], input: string): number {
    const urgencyIndicators = ['urgent', 'critical', 'asap', 'immediately', 'blocking'];
    const impactIndicators = ['user', 'customer', 'production', 'core', 'main'];
    
    let confidence = 65; // Base confidence
    
    if (urgencyIndicators.some(indicator => input.includes(indicator))) {
      confidence += (priority === 'critical' || priority === 'high') ? 20 : -10;
    }
    
    if (impactIndicators.some(indicator => input.includes(indicator))) {
      confidence += (priority === 'high' || priority === 'medium') ? 15 : -5;
    }
    
    return Math.min(95, Math.max(30, confidence));
  }

  private calculateLabelsConfidence(input: string): number {
    const technicalTerms = ['frontend', 'backend', 'ui', 'api', 'database', 'mobile', 'web', 'component'];
    const matchCount = technicalTerms.filter(term => input.includes(term)).length;
    
    return Math.min(90, 40 + (matchCount * 15));
  }
}