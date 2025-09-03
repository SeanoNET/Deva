import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@deva/ai';
import { LinearService } from '@deva/linear';
import type { Message } from '@deva/types';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json() as { message: string; context?: Message[] };
    
    // Get Linear token from session
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.linearToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Linear' },
        { status: 401 }
      );
    }
    
    const linearToken = session.linearToken;

    // Initialize AI engine
    const ai = new AIEngine();
    
    // Process the input with context if available
    const result = await ai.processInput(message, context);
    
    // Generate response based on pattern and confidence
    let response = '';
    let issuePreview = null;

    if (result.pattern === 'quick-create' && result.confidence > 70) {
      // Quick create pattern - show preview immediately
      issuePreview = {
        ...result.issueData,
        workType: result.workType,
        confidence: result.confidence,
      };

      response = `I've understood your ${result.workType} request. Here's what I'll create:

**${result.issueData.title}**

${result.issueData.description}

- **Type**: ${result.workType}
- **Priority**: ${result.issueData.priority}
- **Labels**: ${result.suggestedLabels?.join(', ') || 'None'}
- **Confidence**: ${result.confidence}%

Click "Create Issue" to submit this to Linear, or tell me what you'd like to change.`;
    } else if (result.pattern === 'conversational') {
      // Conversational pattern - ask clarifying questions
      issuePreview = {
        ...result.issueData,
        workType: result.workType,
        confidence: result.confidence,
      };

      const questions = result.questions || [];
      
      if (questions.length > 0) {
        response = `I'm processing your ${result.workType} request. To ensure I capture everything correctly, could you help me with:

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Current understanding:**
- ${result.issueData.title || 'Working title needed'}
- Priority: ${result.issueData.priority}
- Type: ${result.workType}`;
      } else {
        response = `I've understood your request as a ${result.workType}:

**${result.issueData.title}**

${result.issueData.description}

Would you like to add any additional details before I create this issue?`;
      }
    } else {
      // Low confidence - need more information
      response = `I need more information to create a clear work item. Could you provide more details about:
      
- What specific functionality or issue you're addressing?
- What's the expected outcome?
- Any technical requirements or constraints?

Current understanding: ${result.workType} with ${result.confidence}% confidence.`;
    }

    return NextResponse.json({
      response,
      issuePreview,
      workType: result.workType,
      pattern: result.pattern,
      confidence: result.confidence,
      suggestedLabels: result.suggestedLabels,
      questions: result.questions,
      reasoning: result.reasoning,
      metrics: result.metrics,
      editableIssue: result.editableIssue,
      creationMode: result.creationMode,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}