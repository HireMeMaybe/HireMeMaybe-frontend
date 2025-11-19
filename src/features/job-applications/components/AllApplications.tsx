'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationCard from './ApplicationCard';
import { CompanyService } from '@/lib/services/company.service';
import type { ApplicationCpskUser, JobPostApplication } from '@/lib/services/job.service';

interface ApplicationWithJobInfo extends JobPostApplication {
  jobTitle: string;
  jobId: number;
}

interface AllApplicationsProps {
  readonly companyId: string;
}

export default function AllApplications({ companyId }: AllApplicationsProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithJobInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatYearLabel = (year?: string | null) => {
    if (!year) return null;
    const trimmed = year.trim();
    if (!trimmed) return null;
    return trimmed.toLowerCase().startsWith('year') ? trimmed : `Year ${trimmed}`;
  };

  const getCandidateName = (user?: ApplicationCpskUser | null, fallbackId?: string) => {
    const first = user?.first_name?.trim() || '';
    const last = user?.last_name?.trim() || '';
    const fullName = [first, last].filter(Boolean).join(' ');
    return fullName || (fallbackId ? `Applicant ${fallbackId}` : 'Applicant');
  };

  const getProgram = (user?: ApplicationCpskUser | null) => user?.program || 'Program not specified';

  const getUniversityDisplay = (user?: ApplicationCpskUser | null) => {
    if (!user) return 'CPSK';
    const yearLabel = formatYearLabel(user.year);
    if (yearLabel) return `CPSK (${yearLabel})`;
    return 'CPSK';
  };

  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        setIsLoading(true);
        // Fetch company profile with job posts and applications
        const companyProfile = await CompanyService.getMyProfileAndSync();

        // Collect all applications from all job posts
        const allApps: ApplicationWithJobInfo[] = [];

        if (companyProfile.job_post) {
          companyProfile.job_post.forEach((jobPost) => {
            if (jobPost.applications && jobPost.applications.length > 0) {
              jobPost.applications.forEach((app) => {
                if (
                  app.id &&
                  app.post_id &&
                  app.cpsk_id &&
                  app.answer_id &&
                  app.status &&
                  app.applied_at &&
                  app.resume_id
                ) {
                  allApps.push({
                    id: app.id,
                    post_id: app.post_id,
                    cpsk_id: app.cpsk_id,
                    answer_id: app.answer_id,
                    status: app.status,
                    applied_at: app.applied_at,
                    resume_id: app.resume_id,
                    answer: {
                      id: app.answer?.id ?? 0,
                      expected_salary: app.answer?.expected_salary ?? '',
                      programming_languages: app.answer?.programming_languages || [],
                      right_to_work: app.answer?.right_to_work ?? '',
                      year_of_experience: app.answer?.year_of_experience ?? 0,
                    },
                    cpsk_user: app.cpsk_user,
                    jobTitle: jobPost.title || 'Untitled Position',
                    jobId: jobPost.id || 0,
                  });
                }
              });
            }
          });
        }

        // Sort by applied date (most recent first)
        allApps.sort((a, b) => {
          const dateA = new Date(a.applied_at).getTime();
          const dateB = new Date(b.applied_at).getTime();
          return dateB - dateA;
        });

        setApplications(allApps);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllApplications();
  }, []);

  const handleBackToProfile = () => {
    router.push(`/company/${companyId}?view=company`);
  };

  const handleViewPost = (jobId: number) => {
    router.push(`/job-post/${jobId}`);
  };

  const handleViewApplication = (applicationId: number) => {
    router.push(`/company/${companyId}/applications/${applicationId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary-green h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-text">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Let error.tsx handle errors
  if (error) {
    throw new Error(error);
  }

  const totalApplications = applications.length;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <Button
            onClick={handleBackToProfile}
            variant="ghost"
            className="mb-4 cursor-pointer px-0 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Company Profile
          </Button>

          {/* Page Title */}
          <h1 className="mb-2 text-3xl font-bold text-white">All Applications</h1>
          <p className="text-gray-400">{totalApplications} total applications</p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <div key={application.id} className="space-y-2">
                {/* Job Title Badge */}
                <div className="flex items-center gap-2">
                  <span className="bg-primary-green rounded-full px-3 py-1 text-xs font-medium text-white">
                    {application.jobTitle}
                  </span>
                </div>

                {/* Application Card */}
                <ApplicationCard
                  application={{
                    id: application.id,
                    jobId: application.jobId,
                    candidateName: getCandidateName(application.cpsk_user, application.cpsk_id),
                    university: getUniversityDisplay(application.cpsk_user),
                    program: getProgram(application.cpsk_user),
                    skills:
                      application.answer?.programming_languages?.length
                        ? application.answer.programming_languages
                        : application.cpsk_user?.soft_skill || [],
                    appliedDate: application.applied_at,
                    profilePicture: undefined,
                  }}
                  onViewPost={() => handleViewPost(application.jobId)}
                  onViewApplication={() => handleViewApplication(application.id)}
                />
              </div>
            ))
          ) : (
            <div className="bg-very-dark-gray rounded-lg border border-gray-700 p-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">No Applications Yet</h3>
                <p className="text-gray-text mb-6">
                  You haven&apos;t received any applications for your job posts yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
