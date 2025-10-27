'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import JobCard from './JobCard';
import EditJobModal from './EditJob';
import SuccessModal from '@/components/modals/SuccessModal';
import type { JobOpening } from '@/types/company';

interface JobOpeningsProps {
  readonly jobOpenings: JobOpening[];
  readonly viewType: 'owner' | 'company' | 'cpsk';
  readonly companyId: string;
}

export default function JobOpenings({ jobOpenings, viewType, companyId }: JobOpeningsProps) {
  const router = useRouter();
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleApply = (jobId: number) => {
    console.log('Applied to job:', jobId);
    // Implement actual application logic
  };

  const handleEdit = (jobId: number) => {
    setEditingJobId(jobId);
  };

  const handleEditSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reload the page to show updated job data
    window.location.reload();
  };

  const handleViewApplications = (jobId: number) => {
    router.push(`/company/${companyId}/jobs/${jobId}/applications`);
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

      {/* Edit Job Modal */}
      {editingJobId !== null && (
        <EditJobModal
          isOpen={editingJobId !== null}
          onClose={() => setEditingJobId(null)}
          jobId={editingJobId}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Job Updated Successfully"
        message="Your job post has been updated"
        description="The changes to your job posting have been saved and are now live."
        buttonText="Got it"
      />
    </div>
  );
}
