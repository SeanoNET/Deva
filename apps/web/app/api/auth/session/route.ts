import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.linearToken) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'No valid session found'
        },
        { status: 401 }
      );
    }

    // Return user info without exposing the token
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.userEmail,
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        message: 'Session validation failed'
      },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    // Clear the session
    session.destroy();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Logout failed'
      },
      { status: 500 }
    );
  }
}