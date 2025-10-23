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

    // Validate backend URL format
    try {
      new URL(backendUrl);
    } catch (err) {
      console.error('Invalid NEXT_PUBLIC_BACKEND_URL:', backendUrl, err);
      return NextResponse.json(
        { success: false, message: 'invalid backend URL configuration' },
        { status: 500 }
      );
    }

    console.log('Forwarding code to backend:', {
      code: code.substring(0, 10) + '...',
      selectedRole,
      backendUrl,
    });

    // Determine backend endpoint based on selected role
    const backendEndpoint =
      selectedRole === 'Company'
        ? `${backendUrl}/auth/google/company`
        : `${backendUrl}/auth/google/cpsk`;

    console.log('Using backend endpoint:', backendEndpoint);

    // Helper: fetch with timeout
    const fetchWithTimeout = async (
      url: string,
      options: RequestInit,
      timeoutMs = 15000
    ): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return resp;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    // Try fetch with simple retry/backoff strategy
    const maxRetries = 1; // Reduce retries to avoid long waits
    let res: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const startTime = Date.now();
      try {
        console.log(
          `🔄 Attempt ${attempt + 1}/${maxRetries + 1}: Sending POST to ${backendEndpoint}...`
        );

        res = await fetchWithTimeout(
          backendEndpoint,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          },
          30000 // 30s timeout for slow backends (increased from 20s)
        );

        const elapsed = Date.now() - startTime;
        console.log(`✅ Backend responded in ${elapsed}ms with status ${res.status}`);
        break; // success
      } catch (err) {
        lastError = err;
        const elapsed = Date.now() - startTime;
        console.error(
          `❌ Attempt ${attempt + 1} failed after ${elapsed}ms:`,
          err instanceof Error ? err.message : err
        );
        // small backoff before retrying
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${500 * (attempt + 1)}ms...`);
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    if (!res) {
      console.error('All attempts to contact backend failed:', lastError);
      const detail = lastError instanceof Error ? lastError.message : String(lastError);
      return NextResponse.json(
        { success: false, message: 'backend unreachable', detail },
        { status: 502 }
      );
    }

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
