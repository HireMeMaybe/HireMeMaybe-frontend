"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationCard from './ApplicationCard';
import { useJobApplications } from '@/features/job-applications/hooks/useJobApplications';
import { useCompanyProfile } from '@/features/company-profile/hooks/useCompanyProfile'; // Import useCompanyProfile
import type { JobApplicationsProps } from '@/types/application';

export default function JobApplications({ jobId, companyId }: JobApplicationsProps) {
  const router = useRouter();
  const { applications, totalApplications, isLoading, error } = useJobApplications({ jobId });

  // Use the useCompanyProfile hook to get jobOpenings
  const { jobOpenings } = useCompanyProfile(companyId);

  // Get job data from jobOpenings
  const jobData = jobOpenings.find((job) => job.id === jobId);

  const handleViewPost = () => {
    console.log('View job post:', jobId);
    // Implement navigation to job post
  };

  const handleViewApplication = (applicationId: string) => {
    console.log('View application details:', applicationId);
    // Implement navigation to application details
  };

  const handleBackToProfile = () => {
    router.push(`/company/${companyId}?view=company`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-text">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Applications Not Found</h2>
          <p className="text-gray-text mb-4">
            {error || 'The job applications you are looking for do not exist.'}
          </p>
          <Button 
            onClick={handleBackToProfile}
            className="bg-primary-green hover:bg-green-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <Button
            onClick={handleBackToProfile}
            variant="ghost"
            className="text-gray-400 hover:text-white mb-4 px-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company Profile
          </Button>
          
          {/* Page Title */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {jobData.title} Applications
          </h1>
          <p className="text-gray-400">
            {totalApplications} applications received
          </p>
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
            <div className="text-center py-12">
              <p className="text-gray-text text-lg">No applications found for this position.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}