/**
 * File Quota API Endpoint
 * Returns current file quota for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserFileQuota } from '@/lib/utils/file-quota';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token?.backendUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUser = token.backendUser as {
      id?: string | number;
      role?: 'CPSK' | 'Company' | 'Visitor';
    };

    const role = backendUser.role || 'Visitor';
    const userId = String(backendUser.id || '');

    const quota = await getUserFileQuota(userId, role);

    return NextResponse.json({ quota });
  } catch (error: unknown) {
    console.error('Failed to get file quota:', error);
    return NextResponse.json({ error: 'Failed to retrieve file quota' }, { status: 500 });
  }
}
