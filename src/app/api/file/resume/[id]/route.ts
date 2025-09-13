import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireMethod } from '@/lib/middleware/auth';

// Main GET handler for downloading resume by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // 3. Get file ID from params
    const { id: fileId } = await params;
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // 4. Fetch file from backend
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error('Backend URL not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(`${backendUrl}/file/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 5. Handle backend response
    if (response.status === 404) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
    }

    // 6. Return file as octet-stream
    const fileBuffer = await response.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="resume_${fileId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/file/resume/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle unsupported methods
export async function POST(request: NextRequest) {
  const methodError = requireMethod(request, ['GET']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  const methodError = requireMethod(request, ['GET']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  const methodError = requireMethod(request, ['GET']);
  return methodError || NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
