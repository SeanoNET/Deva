import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { LinearClient } from '@linear/sdk';

const LINEAR_TOKEN_URL = 'https://api.linear.app/oauth/token';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=no_code', request.url)
    );
  }

  try {
    const response = await fetch(LINEAR_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINEAR_CLIENT_ID!,
        client_secret: process.env.LINEAR_CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    
    // Get user info from Linear
    const linearClient = new LinearClient({ accessToken: data.access_token });
    const viewer = await linearClient.viewer;
    
    // Create response with redirect
    const redirectResponse = NextResponse.redirect(
      new URL('/?auth=success', request.url)
    );
    
    // Get the session and store encrypted data
    const session = await getSessionFromRequest(request, redirectResponse);
    session.linearToken = data.access_token;
    session.userId = viewer.id;
    session.userEmail = viewer.email;
    session.isLoggedIn = true;
    await session.save();

    return redirectResponse;
  } catch (error) {
    console.error('Linear OAuth error:', error);
    return NextResponse.redirect(
      new URL('/?error=auth_failed', request.url)
    );
  }
}