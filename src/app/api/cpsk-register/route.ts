import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating registration data
const cpskRegistrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  program: z.enum(['CPE', 'SKE'], { message: 'Program is required' }),
  year: z.string().min(1, 'Year is required'),
  soft_skill: z.array(z.string()).optional(),
});

// File validation
function validateResumeFile(file: File | null): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: true }; // Resume is optional
  }

  // Check file type
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Resume must be a PDF file' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Resume must be 10 MB or smaller' };
  }

  return { isValid: true };
}

// Parse and validate form data
async function parseRegistrationData(request: NextRequest): Promise<
  | {
      data: z.infer<typeof cpskRegistrationSchema>;
      resume?: File;
    }
  | NextResponse
> {
  try {
    const formData = await request.formData();

    // Extract form fields
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const program = formData.get('program') as string;
    const year = formData.get('year') as string;

    // Handle soft skills (can be multiple values)
    const soft_skill = formData.getAll('soft_skill') as string[];

    // Extract resume file
    const resume = formData.get('resume') as File | null;

    // Validate resume file
    const fileValidation = validateResumeFile(resume);
    if (!fileValidation.isValid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Validate form data
    const validatedData = cpskRegistrationSchema.parse({
      first_name,
      last_name,
      email,
      phone,
      program,
      year,
      soft_skill: soft_skill.length > 0 ? soft_skill : undefined,
    });

    return {
      data: validatedData,
      resume: resume || undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid registration data',
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error parsing registration data:', error);
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }
}

// Forward registration to backend
async function forwardRegistration(data: z.infer<typeof cpskRegistrationSchema>, resume?: File) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  // Create form data for backend
  const formData = new FormData();

  // Add all form fields
  formData.append('first_name', data.first_name);
  formData.append('last_name', data.last_name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('program', data.program);
  formData.append('year', data.year);

  // Add soft skills
  if (data.soft_skill) {
    data.soft_skill.forEach((skill) => formData.append('soft_skill', skill));
  }

  // Add resume if provided
  if (resume) {
    formData.append('resume', resume, resume.name);
  }

  const response = await fetch(`${backendUrl}/cpsk/register`, {
    method: 'POST',
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
    // 1. Validate content type (should be multipart/form-data)
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // 2. Parse and validate form data
    const parseResult = await parseRegistrationData(request);
    if (parseResult instanceof NextResponse) {
      return parseResult; // Validation failed
    }

    const { data, resume } = parseResult;

    // 3. Forward to backend
    const backendResponse = await forwardRegistration(data, resume);

    // 4. Return successful response
    return NextResponse.json(
      {
        message: 'Registration completed successfully!',
        data: backendResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /cpsk-register:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Backend error')) {
        return NextResponse.json(
          { error: 'Failed to submit registration to backend service' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
