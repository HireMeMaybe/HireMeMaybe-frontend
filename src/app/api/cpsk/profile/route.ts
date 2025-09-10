import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireJSON, requireMethod } from '@/lib/middleware/auth';

// Forward request to backend (simple proxy)
async function forwardToBackend(request: NextRequest, token: string) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  // Get the request body
  const body = await request.text();

  const response = await fetch(`${backendUrl}/cpsk/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  // Forward the exact response from backend (including status and body)
  const responseData = await response.text();

  return new NextResponse(responseData, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}

// Main PUT handler
export async function PUT(request: NextRequest) {
  try {
    // 1. Validate method
    const methodError = requireMethod(request, ['PUT']);
    if (methodError) {
      return methodError;
    }

    // 2. Validate Content-Type
    const contentTypeError = requireJSON(request);
    if (contentTypeError) {
      return contentTypeError;
    }

    // 3. Authenticate user
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Authentication failed
    }
    const { token } = authResult;

    // 4. Forward to backend (let backend handle validation and errors)
    return await forwardToBackend(request, token);
  } catch (error) {
    console.error('Error in PUT /cpsk/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Forward GET request to backend
async function forwardGetToBackend(token: string) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  const response = await fetch(`${backendUrl}/cpsk/myprofile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Forward the exact response from backend (including status and body)
  const responseData = await response.text();

  return new NextResponse(responseData, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}

// Main GET handler
export async function GET(request: NextRequest) {
  try {
    // 1. Validate method
    const methodError = requireMethod(request, ['GET']);
    if (methodError) {
      return methodError;
    }

    // 2. Authenticate user
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Authentication failed
    }
    const { token } = authResult;

    // 3. Forward to backend
    return await forwardGetToBackend(token);
  } catch (error) {
    console.error('Error in GET /cpsk/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const methodError = requireMethod(request, ['PUT', 'GET']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  const methodError = requireMethod(request, ['PUT', 'GET']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
