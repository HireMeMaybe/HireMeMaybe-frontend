import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'authorization code is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: 'server misconfiguration: BACKEND_URL not set' },
        { status: 500 }
      );
    }

    console.log('Forwarding code to backend:', `${backendUrl}/auth/google/cpsk`, { code });

    const res = await fetch(`${backendUrl}/auth/google/cpsk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    let data = null;
    let text = null;
    try {
      data = await res.json();
    } catch (err) {
      try {
        text = await res.text();
      } catch (e) {
        text = null;
      }
    }

    console.log('Backend response status:', res.status, 'json:', data, 'text:', text);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'backend error', status: res.status, data: data ?? null, text },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data ?? text });
  } catch (error) {
    console.error('Error in /api/auth/forward-code:', error);
    return NextResponse.json({ success: false, message: 'internal server error' }, { status: 500 });
  }
}
