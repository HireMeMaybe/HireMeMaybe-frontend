import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, selectedRole } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'authorization code is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: 'server misconfiguration: NEXT_PUBLIC_BACKEND_URL not set' },
        { status: 500 }
      );
    }

    console.log('Forwarding code to backend:', { code, selectedRole });

    // Determine backend endpoint based on selected role
    const backendEndpoint =
      selectedRole === 'Company'
        ? `${backendUrl}/auth/google/company`
        : `${backendUrl}/auth/google/cpsk`;

    console.log('Using backend endpoint:', backendEndpoint);

    const res = await fetch(backendEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    let data = null;
    let text = null;
    try {
      data = await res.json();
    } catch (err) {
      console.warn('Failed to parse backend response as JSON:', err);
      try {
        text = await res.text();
      } catch (e) {
        console.warn('Failed to read backend response text:', e);
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

    // Add selected role to the user data if available
    if (data && data.user && selectedRole) {
      data.user.role = selectedRole;
    }

    return NextResponse.json({ success: true, data: data ?? text });
  } catch (error) {
    console.error('Error in /api/auth/forward-code:', error);
    return NextResponse.json({ success: false, message: 'internal server error' }, { status: 500 });
  }
}
