'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationCard from './ApplicationCard';
import { CompanyService } from '@/lib/services/company.service';
import type { JobApplicationsProps } from '@/types/application';
import { useState, useEffect } from 'react';
import type { JobPostDetail, ApplicationCpskUser } from '@/lib/services/job.service';

export default function JobApplications({ jobId, companyId }: Readonly<JobApplicationsProps>) {
  const router = useRouter();
  const [jobPost, setJobPost] = useState<JobPostDetail | null>(null);
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
    const fetchJobPost = async () => {
      try {
        setIsLoading(true);
        // Fetch company profile with job posts and applications
        const companyProfile = await CompanyService.getMyProfileAndSync();

        // Find the specific job post by ID from the company profile
        const foundJobPost = companyProfile.job_post?.find((post) => post.id === Number(jobId));

        if (foundJobPost) {
          // Map the job post data to JobPostDetail format
          const mappedJobPost: JobPostDetail = {
            id: foundJobPost.id!,
            company_id: foundJobPost.company_id!,
            title: foundJobPost.title || 'Untitled Position',
            desc: foundJobPost.desc || '',
            exp_lvl: foundJobPost.exp_lvl || '',
            location: foundJobPost.location || '',
            type: foundJobPost.type || '',
            req: foundJobPost.req || '',
            salary: foundJobPost.salary || '',
            tags: foundJobPost.tags || [],
            post_time: foundJobPost.post_time || '',
            expiring: foundJobPost.expiring || '',
            applications:
              foundJobPost.applications?.map((app) => ({
                id: app.id!,
                post_id: app.post_id!,
                cpsk_id: app.cpsk_id!,
                answer_id: app.answer_id!,
                status: app.status!,
                applied_at: app.applied_at!,
                resume_id: app.resume_id!,
                answer: {
                  id: app.answer?.id ?? 0,
                  expected_salary: app.answer?.expected_salary ?? '',
                  programming_languages: app.answer?.programming_languages || [],
                  right_to_work: app.answer?.right_to_work ?? '',
                  year_of_experience: app.answer?.year_of_experience ?? 0,
                },
                cpsk_user: app.cpsk_user,
              })) || null,
          };
          setJobPost(mappedJobPost);
        } else {
          setError('Job post not found in your company profile');
        }
      } catch (err) {
        console.error('Failed to fetch job post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load job applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobPost();
  }, [jobId]);

  const handleViewPost = () => {
    console.log('View job post:', jobId);
    // Implement navigation to job post
  };

  const handleViewApplication = (applicationId: number) => {
    router.push(`/company/${companyId}/applications/${applicationId}`);
  };

  const handleBackToProfile = () => {
    router.push(`/company/${companyId}?view=company`);
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

  if (error) {
    throw new Error(error);
  }

  if (!jobPost) {
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
            <h1 className="mb-2 text-3xl font-bold text-white">Job Post Not Found</h1>
          </div>

          {/* Empty State */}
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
              <h3 className="mb-2 text-xl font-semibold text-white">
                This job post could not be found
              </h3>
              <p className="text-gray-text mb-6">
                The job post you&apos;re looking for doesn&apos;t exist or has been removed from
                your company profile.
              </p>
              <Button
                onClick={handleBackToProfile}
                className="bg-primary-green text-white hover:bg-green-700"
              >
                Back to Company Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const applications = jobPost.applications || [];
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
          <h1 className="mb-2 text-3xl font-bold text-white">{jobPost.title} Applications</h1>
          <p className="text-gray-400">{totalApplications} applications received</p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                  application={{
                    id: application.id,
                    jobId: jobPost.id,
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
                onViewPost={handleViewPost}
                onViewApplication={() => handleViewApplication(application.id)}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-text text-lg">No applications found for this position.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
