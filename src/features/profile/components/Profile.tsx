'use client';

import React from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Download, Edit } from 'lucide-react';
import type { ProfileData } from '@/types/cpsk';
import { useProfile } from '../hooks/useProfile';
import { useDownloadResume } from '../hooks/useDownloadResume';
import { getProfileImageUrl } from '@/lib/utils';
import Loading from '@/app/loading';
import ErrorPage from '@/app/error';

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

  // Avatar source: prefer top-level, fallback to nested User.profile_picture from API
  const avatarSrc = getProfileImageUrl(
    profileData.profile_picture || profileData.User?.profile_picture || null
  );

  // Track image load failure to show initials fallback
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header with Edit Button */}
      <div className="mb-8 flex items-center justify-between">
        <div></div>
        <Button
          onClick={onEditClick}
          variant="outline"
          className="flex items-center gap-2 border-gray-600 bg-transparent text-white hover:bg-white hover:text-black"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Header */}
      <div className="mb-8 text-center">
        {avatarSrc && !imgFailed ? (
          <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={avatarSrc}
              alt={fullName || 'Profile picture'}
              fill
              sizes="80px"
              className="object-cover"
              onError={(e) => {
                console.warn('Profile image failed to load:', e, 'URL:', avatarSrc);
                // mark as failed to show initials fallback
                setImgFailed(true);
              }}
            />
          </div>
        ) : (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-green)] text-2xl font-bold">
            {fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || 'U'}
          </div>
        )}
        <h1 className="mb-2 text-2xl font-bold">{fullName}</h1>
        <p className="text-[var(--color-primary-green)]">{programDisplay}</p>
        <p className="text-[var(--color-pale-pink)]">{yearDisplay} • Kasetsart University</p>
      </div>

      {/* Contact Information */}
      <Card className="mb-6 gap-3 border-none bg-[var(--color-background-gray)] py-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[var(--color-primary-green)]">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-light-gray)] p-3">
            <Phone className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="mb-1 font-medium text-white">Phone</p>
              <p className="text-gray-300">{profileData?.User?.tel || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-light-gray)] p-3">
            <Mail className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="mb-1 font-medium text-white">Email</p>
              <p className="text-gray-300">{profileData?.User?.email || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="mb-6 gap-1 border-none bg-[var(--color-background-gray)] py-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[var(--color-primary-green)]">
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="font-semibold text-white">Bachelor of Engineering</h3>
            <p className="text-[var(--color-primary-green)]">{programDisplay}</p>
            <p className="text-gray-400">Kasetsart University</p>
          </div>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card className="mb-6 gap-3 border-none bg-[var(--color-background-gray)] py-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[var(--color-primary-green)]">
            Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileData?.resume_id ? (
            <div className="flex items-center justify-between rounded-lg bg-[var(--color-light-gray)] p-3">
              <div className="flex items-center gap-3">
                <div className="rounded bg-[var(--color-primary-green)] p-2">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">resume_{profileData.resume_id}.pdf</p>
                </div>
              </div>
              <Button
                onClick={() => onDownloadResume(profileData.resume_id!)}
                variant="outline"
                size="sm"
                className="border-[var(--color-primary-green)] bg-[var(--color-primary-green)] text-white hover:bg-[var(--color-darker-green)]"
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
      <Card className="mb-6 gap-3 border-none bg-[var(--color-background-gray)] py-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[var(--color-primary-green)]">
            Soft Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profileData?.soft_skill && profileData.soft_skill.length > 0
              ? profileData.soft_skill.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-[#C4BEBE] bg-[var(--color-light-gray)] px-3 pb-1 text-sm font-medium text-[var(--color-primary-green)]"
                  >
                    {skill}
                  </span>
                ))
              : ['Communication', 'Teamwork', 'Leadership', 'Time Management'].map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[var(--color-primary-green)] px-3 py-1 text-sm font-medium text-white"
                    >
                      {skill}
                    </span>
                  )
                )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Profile(): React.JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profileData, loading, error, refetch } = useProfile();
  const { downloadResume } = useDownloadResume();

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
    router.push('/profile/edit');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorPage
        error={new Error(error)}
        reset={() => {
          refetch();
        }}
      />
    );
  }

  // Don't render if user is not authenticated (safety check)
  if (status === 'unauthenticated' || !session?.backendToken || !session?.backendUser?.program) {
    return <div></div>;
  }

  if (!profileData) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <ProfileView
          profileData={profileData}
          onEditClick={handleEditClick}
          onDownloadResume={downloadResume}
        />
      </div>
    </div>
  );
}
