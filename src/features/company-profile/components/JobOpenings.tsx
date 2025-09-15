"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import JobCard from './JobCard';
import type { JobOpening } from '@/types/company';

interface JobOpeningsProps {
  readonly jobOpenings: JobOpening[];
  readonly viewType: 'student' | 'company';
  readonly companyId: string; // Add companyId prop
  readonly onPostNewJob?: () => void;
}

export default function JobOpenings({ 
  jobOpenings, 
  viewType,
  companyId, // Add companyId parameter
  onPostNewJob 
}: JobOpeningsProps) {
  const router = useRouter();

  const handleApply = (jobId: string) => {
    console.log('Applied to job:', jobId);
    // Implement actual application logic
  };

  const handleEdit = (jobId: string) => {
    console.log('Edit job:', jobId);
    // Implement edit functionality
  };

  const handleViewApplications = (jobId: string) => {
    // Navigate to job applications page
    router.push(`/company/${companyId}/jobs/${jobId}/applications`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Current Job Openings</h2>
        {viewType === 'company' && (
          <Button
            onClick={onPostNewJob}
            className="bg-primary-green hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {jobOpenings.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            viewType={viewType}
            onApply={handleApply}
            onEdit={handleEdit}
            onViewApplications={handleViewApplications}
          />
        ))}
        
        {jobOpenings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-text text-lg">No job openings available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}