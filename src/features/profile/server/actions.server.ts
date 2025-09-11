'use server';

import type { ProfileData } from '@/types/cpsk';

export async function fetchProfileData(): Promise<{
  success: boolean;
  data?: ProfileData;
  error?: string;
}> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cpsk/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return {
      success: false,
      error: 'Failed to load profile data',
    };
  }
}

export async function downloadResume(resumeId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // This would be implemented based on your backend API
    // For now, returning a placeholder
    console.log('Downloading resume with ID:', resumeId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error downloading resume:', error);
    return {
      success: false,
      error: 'Failed to download resume',
    };
  }
}
