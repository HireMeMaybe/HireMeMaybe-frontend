import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, redirect_uri } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'authorization code is required' },
        { status: 400 }
      );
    }

    // Forward the authorization code to your backend
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error('BACKEND_URL not set');
      return NextResponse.json(
        { success: false, message: 'server misconfiguration' },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/auth/google/cpsk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirect_uri: redirect_uri || `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/callback`,
      }),
    });

    const data = await res.json();
    console.log('Google Auth Response:', data);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Google authentication failed', error: data },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Google authentication successful', data });
  } catch (error) {
    console.error('Error in /api/auth/callback:', error);
    return NextResponse.json({ success: false, message: 'internal server error' }, { status: 500 });
  }
}
