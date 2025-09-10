import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireMethod } from '@/lib/middleware/auth';

// Configuration for file uploads
const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_EXTENSIONS = ['.pdf'];

// File validation middleware
function validateResumeFile(file: File): string | null {
  // Check if file exists
  if (!file || !file.name) {
    return 'No file provided';
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be ${MAX_FILE_SIZE / (1024 * 1024)}MB or smaller`;
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'File must be a PDF document';
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'File must have a .pdf extension';
  }

  // Additional size check (in case browser reports 0 size)
  if (file.size === 0) {
    return 'File appears to be empty';
  }

  return null; // File is valid
}

// Parse and validate form data
async function parseFormData(request: NextRequest): Promise<
  | {
      file: File;
    }
  | NextResponse
> {
  try {
    const formData = await request.formData();

    // Check if form data is empty
    if (!formData || [...formData.entries()].length === 0) {
      return NextResponse.json({ error: 'Sending nothing in payload' }, { status: 400 });
    }

    // Extract resume file
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file found in form data. Field name should be "resume"' },
        { status: 400 }
      );
    }

    // Validate file
    const validationError = validateResumeFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    return { file };
  } catch (error) {
    console.error('Error parsing form data:', error);
    return NextResponse.json({ error: 'Invalid form data format' }, { status: 400 });
  }
}

// Forward file to backend
async function forwardResumeToBackend(file: File, token: string) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  // Create form data for backend
  const formData = new FormData();
  formData.append('resume', file, file.name);

  const response = await fetch(`${backendUrl}/cpsk/profile/resume`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - let fetch set it with boundary for multipart/form-data
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Backend error' }));
    throw new Error(`Backend error: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  return response.json();
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // 1. Validate method
    const methodError = requireMethod(request, ['POST']);
    if (methodError) {
      return methodError;
    }

    // 2. Authenticate user
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Authentication failed
    }
    const { session, token } = authResult;

    // 3. Parse and validate form data
    const formResult = await parseFormData(request);
    if (formResult instanceof NextResponse) {
      return formResult; // Form data validation failed
    }
    const { file } = formResult;

    // 4. Forward to backend
    const backendResponse = await forwardResumeToBackend(file, token);

    // 5. Return successful response
    return NextResponse.json(backendResponse, { status: 200 });
  } catch (error) {
    console.error('Error in POST /cpsk/profile/resume:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Backend error')) {
        return NextResponse.json(
          { error: 'Failed to upload resume to backend service' },
          { status: 502 }
        );
      }
    }

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
