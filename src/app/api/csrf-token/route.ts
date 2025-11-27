/**
 * CSRF Token API Endpoint
 * Returns CSRF token for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/middleware/csrf';

export async function GET(req: NextRequest) {
  try {
    const token = await generateCsrfToken(req);
    return NextResponse.json({ token });
  } catch (error: unknown) {
    console.error('CSRF token generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 401 });
  }
}
