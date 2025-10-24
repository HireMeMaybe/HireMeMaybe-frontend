import { NextResponse } from 'next/server';

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

// Validate and return backend URL
const getValidatedBackendUrl = (): { url: string | null; error: NextResponse | null } => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return {
      url: null,
      error: NextResponse.json(
        { success: false, message: 'server misconfiguration: NEXT_PUBLIC_BACKEND_URL not set' },
        { status: 500 }
      ),
    };
  }

  try {
    new URL(backendUrl);
    return { url: backendUrl, error: null };
  } catch (err) {
    console.error('Invalid NEXT_PUBLIC_BACKEND_URL:', backendUrl, err);
    return {
      url: null,
      error: NextResponse.json(
        { success: false, message: 'invalid backend URL configuration' },
        { status: 500 }
      ),
    };
  }
};

// Attempt to fetch from backend with retries
const fetchFromBackend = async (
  backendEndpoint: string,
  code: string
): Promise<{ response: Response | null; error: NextResponse | null }> => {
  const maxRetries = 1;
  let res: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    try {
      res = await fetchWithTimeout(
        backendEndpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        },
        30000
      );

      const elapsed = Date.now() - startTime;
      console.info(`Backend responded in ${elapsed}ms (attempt ${attempt + 1})`);
      return { response: res, error: null };
    } catch (err) {
      lastError = err;
      const elapsed = Date.now() - startTime;
      console.error(
        `❌ Attempt ${attempt + 1} failed after ${elapsed}ms:`,
        err instanceof Error ? err.message : err
      );

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  console.error('All attempts to contact backend failed:', lastError);
  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  return {
    response: null,
    error: NextResponse.json(
      { success: false, message: 'backend unreachable', detail },
      { status: 502 }
    ),
  };
};

// Parse backend response
const parseBackendResponse = async (
  res: Response
): Promise<{ data: unknown; text: string | null }> => {
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
    }
  }

  return { data, text };
};

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

    const { url: backendUrl, error: urlError } = getValidatedBackendUrl();
    if (urlError) return urlError;

    // Determine backend endpoint based on selected role
    const backendEndpoint =
      selectedRole === 'Company'
        ? `${backendUrl}/auth/google/company`
        : `${backendUrl}/auth/google/cpsk`;

    console.log('Forwarding code to backend:', {
      code: code.substring(0, 10) + '...',
      selectedRole,
      backendUrl,
    });

    const { response: res, error: fetchError } = await fetchFromBackend(backendEndpoint, code);
    if (fetchError) return fetchError;

    const { data, text } = await parseBackendResponse(res!);
    console.log('Backend response status:', res!.status, 'json:', data, 'text:', text);

    if (!res!.ok) {
      return NextResponse.json(
        { success: false, message: 'backend error', status: res!.status, data: data ?? null, text },
        { status: res!.status }
      );
    }

    // Add selected role to the user data if available
    if (data && typeof data === 'object' && 'user' in data && selectedRole) {
      (data as Record<string, unknown>).user = {
        ...(data.user as Record<string, unknown>),
        role: selectedRole,
      };
    }

    return NextResponse.json({ success: true, data: data ?? text });
  } catch (error) {
    console.error('Error in /api/auth/forward-code:', error);
    return NextResponse.json({ success: false, message: 'internal server error' }, { status: 500 });
  }
}
