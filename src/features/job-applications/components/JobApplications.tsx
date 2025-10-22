'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationCard from './ApplicationCard';
import { useJobApplications } from '@/features/job-applications/hooks/useJobApplications';
import { useCompanyProfile } from '@/features/company-profile/hooks/useCompanyProfile'; // Import useCompanyProfile
import type { JobApplicationsProps } from '@/types/application';

export default function JobApplications({ jobId, companyId }: Readonly<JobApplicationsProps>) {
  const router = useRouter();
  const { applications, totalApplications, isLoading, error } = useJobApplications({ jobId });

  // Use the useCompanyProfile hook to get jobOpenings (viewing own company, so isOwner = true)
  const { jobOpenings } = useCompanyProfile(companyId, true);

  // Get job data from jobOpenings
  const jobData = jobOpenings.find((job) => job.id === jobId);

  const handleViewPost = () => {
    console.log('View job post:', jobId);
    // Implement navigation to job post
  };

  const handleViewApplication = (applicationId: number) => {
    console.log('View application details:', applicationId);
    // Implement navigation to application details
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

  if (error || !jobData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Applications Not Found</h2>
          <p className="text-gray-text mb-4">
            {error || 'The job applications you are looking for do not exist.'}
          </p>
          <Button
            onClick={handleBackToProfile}
            className="bg-primary-green text-white hover:bg-green-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="mb-2 text-3xl font-bold text-white">{jobData.title} Applications</h1>
          <p className="text-gray-400">{totalApplications} applications received</p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
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
