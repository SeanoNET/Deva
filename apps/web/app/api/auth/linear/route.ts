import { NextResponse } from 'next/server';

const LINEAR_OAUTH_URL = 'https://linear.app/oauth/authorize';

export async function GET(request: Request) {
  console.log('Linear OAuth route called');
  
  const clientId = process.env.LINEAR_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI;
  
  console.log('Client ID:', clientId ? 'Set' : 'Not set');
  console.log('Redirect URI:', redirectUri);
  
  if (!clientId || !redirectUri || clientId === 'your_linear_client_id') {
    console.log('Linear OAuth not configured properly');
    
    // Redirect back to home with error
    const url = new URL(request.url);
    const homeUrl = new URL('/?error=oauth_not_configured', url.origin);
    return NextResponse.redirect(homeUrl);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read write issues:create',
  });

  const authUrl = `${LINEAR_OAUTH_URL}?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}