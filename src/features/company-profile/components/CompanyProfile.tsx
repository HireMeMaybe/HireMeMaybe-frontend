"use client";

import { useRouter } from 'next/navigation';
import { useCompanyProfile } from '../hooks/useCompanyProfile';
import CompanyHeader from './CompanyHeader';
import CompanyAbout from './CompanyAbout';
import JobOpenings from './JobOpenings';
import { Button } from '@/components/ui/button';
import type { CompanyProfileProps } from '@/types/company';

export default function CompanyProfile({ companyId, viewType }: Readonly<CompanyProfileProps>) {
  const { company, jobOpenings, isLoading, error } = useCompanyProfile(companyId);
  const router = useRouter();

  const handlePostNewJob = () => {
    router.push('/job-post');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-text">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Company Not Found</h2>
          <p className="text-gray-text mb-4">
            {error || 'The company profile you are looking for does not exist.'}
          </p>
          <Button 
            onClick={() => window.history.back()}
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
      <CompanyHeader company={company} viewType={viewType} />
      <CompanyAbout company={company} />
      <JobOpenings 
        jobOpenings={jobOpenings} 
        viewType={viewType}
        onPostNewJob={handlePostNewJob}
      />
    </div>
  );
}