'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import JobCard from './JobCard';
import type { JobOpening } from '@/types/company';

interface JobOpeningsProps {
  readonly jobOpenings: JobOpening[];
  readonly viewType: 'owner' | 'company' | 'cpsk';
}

export default function JobOpenings({ jobOpenings, viewType }: JobOpeningsProps) {
  const router = useRouter();

  const handleApply = (jobId: number) => {
    console.log('Applied to job:', jobId);
    // Implement actual application logic
  };

  const handleEdit = (jobId: number) => {
    console.log('Edit job:', jobId);
    // Implement edit functionality
  };

  const handleViewApplications = (jobId: number) => {
    console.log('View applications for job:', jobId);
    // Implement view applications functionality
  };

  const handlePostNewJob = () => {
    router.push('/job-post');
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Current Job Openings</h2>
        {viewType === 'owner' && (
          <Button
            onClick={handlePostNewJob}
            className="bg-primary-green flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
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
          <div className="py-12 text-center">
            <p className="text-gray-text text-lg">No job openings available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
