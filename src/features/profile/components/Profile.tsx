'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Download, Edit } from 'lucide-react';
import type { ProfileData } from '@/types/cpsk';
import { useProfile } from '../hooks/useProfile';

interface ProfileViewProps {
  profileData: ProfileData;
  onEditClick: () => void;
  onDownloadResume: (resumeId: number) => void;
}

function ProfileView({ profileData, onEditClick, onDownloadResume }: ProfileViewProps) {
  const fullName = profileData
    ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
    : 'Unknown User';

  const programDisplay =
    profileData?.program === 'CPE'
      ? 'Computer Engineering (CPE)'
      : profileData?.program === 'SKE'
        ? 'Software and Knowledge Engineering (SKE)'
        : profileData?.program || 'Not specified';

  const yearDisplay =
    typeof profileData?.year === 'string'
      ? profileData.year
      : profileData?.year?.toString() || 'Not specified';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header with Edit Button */}
      <div className="mb-8 flex items-center justify-between">
        <div></div>
        <Button
          onClick={onEditClick}
          variant="outline"
          className="flex items-center gap-2 border-gray-600 bg-transparent text-white hover:bg-gray-800"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-2xl font-bold">
          {fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'U'}
        </div>
        <h1 className="mb-2 text-2xl font-bold">{fullName}</h1>
        <p className="text-green-400">{programDisplay}</p>
        <p className="text-gray-400">Year {yearDisplay} • Kasetsart University</p>
      </div>

      {/* Contact Information */}
      <Card className="mb-6 border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300">{profileData?.User?.tel || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300">{profileData?.User?.email || 'Not provided'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="mb-6 border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">Education</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Bachelor of Engineering</h3>
            <p className="text-green-400">{programDisplay}</p>
            <p className="text-gray-400">Kasetsart University • Bangkok, Thailand</p>
          </div>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card className="mb-6 border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">Resume</CardTitle>
        </CardHeader>
        <CardContent>
          {profileData?.resume_id ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-700 p-3">
              <div className="flex items-center gap-3">
                <div className="rounded bg-green-500 p-2">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {fullName.replace(' ', '_')}_Resume_2024.pdf
                  </p>
                  <p className="text-sm text-gray-400">Last updated: 2 weeks ago • 1.2 MB</p>
                </div>
              </div>
              <Button
                onClick={() => onDownloadResume(profileData.resume_id!)}
                variant="outline"
                size="sm"
                className="border-green-500 bg-green-500 text-white hover:bg-green-600"
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-600 p-4 text-center">
              <p className="text-gray-400">No resume uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Soft Skills */}
      <Card className="mb-6 border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">Soft Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profileData?.soft_skill && profileData.soft_skill.length > 0
              ? profileData.soft_skill.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white"
                  >
                    {skill}
                  </span>
                ))
              : ['Communication', 'Teamwork', 'Leadership', 'Time Management'].map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white"
                    >
                      {skill}
                    </span>
                  )
                )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Skills */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">Technical Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Python', 'JavaScript', 'React', 'Node.js', 'Git', 'Docker'].map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p className="mb-4 text-red-400">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-gray-600 text-white">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Profile(): React.JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profileData, loading, error, refetch } = useProfile();

  // Handle authentication checks
  React.useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session?.backendToken || !session?.backendUser?.program) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Handle edit button click
  const handleEditClick = () => {
    router.push('/cpsk-register');
  };

  // Handle resume download
  const handleDownloadResume = async (resumeId: number) => {
    try {
      // Implement resume download logic here
      console.log('Downloading resume with ID:', resumeId);
      // You would typically make an API call to download the file
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <LoadingState message="Checking authentication..." />;
  }

  // Don't render if user is not authenticated (safety check)
  if (status === 'unauthenticated' || !session?.backendToken || !session?.backendUser?.program) {
    return <div></div>;
  }

  // Show loading state while fetching profile data
  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Show message if no profile data
  if (!profileData) {
    return <ErrorState error="No profile data found" onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <ProfileView
          profileData={profileData}
          onEditClick={handleEditClick}
          onDownloadResume={handleDownloadResume}
        />
      </div>
    </div>
  );
}
