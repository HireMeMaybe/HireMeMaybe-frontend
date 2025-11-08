'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Image from 'next/image';
import { JobService, type JobPostDetail } from '@/lib/services/job.service';
import { CompanyService, type CompanyProfileResponse } from '@/lib/services/company.service';
import { Button } from '@/components/ui/button';
import Loading from '@/app/loading';

// Extend the Session type to include isRegistered
declare module 'next-auth' {
  interface Session {
    isRegistered?: boolean;
    role?: string;
  }
}

export default function JobPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [jobPost, setJobPost] = useState<JobPostDetail | null>(null);
  const [company, setCompany] = useState<CompanyProfileResponse | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobPostId = params.id as string;

  // Protect page: redirect unauthenticated and unregistered users (but allow admins)
  useEffect(() => {
    // Allow admin users to access this page
    if (isAdminAuthenticated) return;

    if (status === 'loading') return;

    // If user is not authenticated, send to sign-in
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    // If authenticated but not registered, redirect to registration
    const isRegistered = session?.isRegistered;
    if (status === 'authenticated' && isRegistered === false) {
      router.push('/');
    }
  }, [status, session, router]);

  const setSafeLogoUrl = (newUrl: string | null) => {
    setLogoUrl((previous) => {
      if (previous && previous !== newUrl) {
        URL.revokeObjectURL(previous);
      }
      return newUrl;
    });
  };

  // Fetch job post data directly (company info comes embedded in response)
  useEffect(() => {
    let isActive = true;

    const fetchJobPostAndCompany = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch job post data
        const jobPostData = await JobService.getJobPostById(jobPostId);
        if (!isActive) return;

        setJobPost(jobPostData);

        // Fetch company logo if logo_id exists on embedded company data
        const logoId = jobPostData.company_user?.logo_id;
        if (logoId) {
          try {
            const logoBlob = await CompanyService.fetchLogo(logoId);
            const url = URL.createObjectURL(logoBlob);
            if (!isActive) {
              URL.revokeObjectURL(url);
              return;
            }
            setSafeLogoUrl(url);
          } catch (logoError) {
            console.error('Error fetching company logo:', logoError);
            if (!isActive) return;
            setSafeLogoUrl(null);
          }
        } else {
          setSafeLogoUrl(null);
        }
      } catch (err) {
        if (!isActive) return;
        console.error('Error fetching job post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load job post');
        setJobPost(null);
        setSafeLogoUrl(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    if (jobPostId) {
      fetchJobPostAndCompany();
    }

    return () => {
      isActive = false;
    };
  }, [jobPostId]);

  // Cleanup logo URL on unmount
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show loading state
  if (loading || status === 'loading') {
    return <Loading />;
  }

  // Let error.tsx handle errors
  if (error) {
    throw new Error(error);
  }

  // Let not-found.tsx handle missing job posts
  if (!jobPost) {
    throw new Error('Job post not found');
  }

  const companyUser = jobPost.company_user;
  const companyName = companyUser?.name ?? 'Company';
  const companyId = companyUser?.id;
  const companyIndustry = companyUser?.industry ?? null;
  const metadataParts = [companyIndustry, jobPost.location].filter(Boolean);
  const companyMetadata = metadataParts.join(' • ');
  const companyInitials = companyName.slice(0, 2).toUpperCase();

  const handleCompanyClick = () => {
    if (companyId) {
      router.push(`/company/${companyId}`);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
        >
          ← Back
        </Button>
      </div>

      {/* Main Content - Full Width Job Post Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="bg-very-dark-gray rounded-lg border border-gray-700 p-8">
            {/* Header Section with Company Logo */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {companyId ? (
                  <button
                    type="button"
                    onClick={handleCompanyClick}
                    className="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                  >
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={companyName}
                        width={64}
                        height={64}
                        unoptimized
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-600 text-lg font-bold text-white">
                        {companyInitials}
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="flex-shrink-0">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={companyName}
                        width={64}
                        height={64}
                        unoptimized
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-600 text-lg font-bold text-white">
                        {companyInitials}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  {companyId ? (
                    <button
                      type="button"
                      onClick={handleCompanyClick}
                      className="hover:text-primary-green cursor-pointer text-left text-lg font-semibold text-white transition-colors"
                    >
                      {companyName}
                    </button>
                  ) : (
                    <p className="text-lg font-semibold text-white">{companyName}</p>
                  )}
                  <p className="text-sm text-gray-400">
                    {companyMetadata || jobPost.location || 'Location not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Title */}
            <h1 className="mb-4 text-3xl font-bold text-white">{jobPost.title}</h1>

            {/* Posted Date */}
            <div className="mb-6">
              <span className="text-sm text-gray-400">Posted {formatDate(jobPost.post_time)}</span>
              {jobPost.expiring && (
                <span className="ml-4 text-sm text-gray-400">
                  Expires {formatDate(jobPost.expiring)}
                </span>
              )}
            </div>

            {/* Job Details as Tags */}
            <div className="mb-6">
              <h3 className="mb-4 text-base font-semibold text-white">Job Details</h3>
              <div className="flex flex-wrap gap-3">
                {/* Job Type */}
                <div className="min-w-[180px] flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-3">
                  <p className="mb-1 text-xs text-gray-400">Job Type</p>
                  <p className="text-sm font-medium text-white">{jobPost.type}</p>
                </div>

                {/* Experience Level */}
                <div className="min-w-[180px] flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-3">
                  <p className="mb-1 text-xs text-gray-400">Experience Level</p>
                  <p className="text-sm font-medium text-white">{jobPost.exp_lvl}</p>
                </div>

                {/* Salary */}
                {jobPost.salary && (
                  <div className="min-w-[180px] flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-3">
                    <p className="mb-1 text-xs text-gray-400">Salary</p>
                    <p className="text-sm font-medium text-white">{jobPost.salary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {jobPost.tags && jobPost.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-base font-semibold text-white">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {jobPost.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Description */}
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-white">Job Description</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                {jobPost.desc}
              </p>
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-white">Requirements</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                {jobPost.req}
              </p>
            </div>

            {/* Action Button - Only show for CPSK users (not Company, Visitor, or Admin) */}
            {session?.role !== 'Company' &&
              session?.role !== 'Visitor' &&
              !isAdminAuthenticated && (
                <div className="mt-8">
                  <Button className="bg-primary-green w-full rounded-lg px-8 py-3 text-base font-medium text-white hover:bg-green-600 sm:w-auto">
                    Apply Now
                  </Button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
