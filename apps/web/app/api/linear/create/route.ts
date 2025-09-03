import { NextRequest, NextResponse } from 'next/server';
import { LinearService } from '@deva/linear';
import type { IssueData } from '@deva/types';

export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const { issueData, teamId, options } = await request.json() as {
      issueData: IssueData;
      teamId?: string;
      options?: {
        assigneeId?: string;
        stateId?: string;
        labelIds?: string[];
        parentId?: string;
      };
    };

    // Validate required fields
    if (!issueData.title || !issueData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Initialize Linear service with OAuth token
    const linearService = new LinearService();
    linearService.initWithOAuth(linearToken);

    // Create the issue in Linear
    const createdIssue = await linearService.createIssue(
      issueData,
      teamId,
      options
    );

    // Return the created issue details
    return NextResponse.json({
      success: true,
      issue: createdIssue ? {
        id: createdIssue.id,
        identifier: createdIssue.identifier,
        title: createdIssue.title,
        url: createdIssue.url,
      } : null,
    });
  } catch (error) {
    console.error('Error creating Linear issue:', error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('team')) {
        return NextResponse.json(
          { error: 'Failed to find or select team. Please ensure you have access to at least one team.' },
          { status: 400 }
        );
      }
      if (error.message.includes('authenticated') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please reconnect to Linear.' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create Linear issue' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch teams and other metadata
export async function GET(request: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.linearToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Linear' },
        { status: 401 }
      );
    }
    
    const linearToken = session.linearToken;

    const linearService = new LinearService();
    linearService.initWithOAuth(linearToken);

    // Get available teams and users for the UI
    const [teams, users, labels, currentUser] = await Promise.all([
      linearService.getTeams(),
      linearService.getUsers(),
      linearService.getLabels(),
      linearService.getMyUser(),
    ]);

    return NextResponse.json({
      teams: teams.nodes.map(team => ({
        id: team.id,
        name: team.name,
        key: team.key,
      })),
      users: users.nodes.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName,
      })),
      labels: labels.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
    });
  } catch (error) {
    console.error('Error fetching Linear metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Linear data' },
      { status: 500 }
    );
  }
}