import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireMethod, requireFormData } from '@/lib/middleware/auth';

// Forward file to backend (simple proxy)
async function forwardToBackend(request: NextRequest, token: string) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  // Get the form data from the request
  const formData = await request.formData();

  const response = await fetch(`${backendUrl}/cpsk/profile/resume`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - let fetch set it with boundary for multipart/form-data
    },
    body: formData,
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

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // 1. Validate method
    const methodError = requireMethod(request, ['POST']);
    if (methodError) {
      return methodError;
    }

    // 2. Validate Content-Type (form-data)
    const contentTypeError = requireFormData(request);
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
    console.error('Error in POST /cpsk/profile/resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET(request: NextRequest) {
  const methodError = requireMethod(request, ['POST']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  const methodError = requireMethod(request, ['POST']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  const methodError = requireMethod(request, ['POST']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
