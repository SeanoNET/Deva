import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@deva/ai';
import { LinearClient } from '@deva/linear';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // Get Linear token from cookie
    const linearToken = request.cookies.get('linear_token')?.value;
    
    if (!linearToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Linear' },
        { status: 401 }
      );
    }

    // Initialize AI engine
    const ai = new AIEngine();
    
    // Parse the message
    const parsed = await ai.parseRequest(message);
    
    // Generate response
    let response = '';
    let issuePreview = null;

    if (parsed.confidence > 0.7) {
      issuePreview = {
        title: parsed.title,
        description: parsed.description,
        workType: parsed.workType,
        priority: parsed.priority,
        confidence: parsed.confidence,
      };

      response = `I've understood your request. Here's what I'll create:

**${parsed.title}**

${parsed.description}

Type: ${parsed.workType}
Priority: ${parsed.priority}
Confidence: ${Math.round(parsed.confidence * 100)}%

Would you like me to create this issue in Linear, or would you like to refine it further?`;
    } else {
      response = `I need more information to create a work item. Could you provide more details about:
      
- What specific functionality you want to build?
- What problem does it solve?
- Any technical requirements or constraints?`;
    }

    return NextResponse.json({
      response,
      issuePreview,
      parsed,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}