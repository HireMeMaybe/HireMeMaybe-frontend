'use client';

import { Button } from '@/components/ui/button';
import SuccessModal from '@/components/modals/SuccessModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { JobService } from '@/lib/services/job.service';
import type { JobOpening } from '@/types/company';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import EditJobModal from './EditJob';
import JobCard from './JobCard';

interface JobOpeningsProps {
  readonly jobOpenings: JobOpening[];
  readonly viewType: 'owner' | 'company' | 'cpsk';
  readonly companyId: string;
}

export default function JobOpenings({ jobOpenings, viewType, companyId }: JobOpeningsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [jobs, setJobs] = useState<JobOpening[]>(jobOpenings);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [successModalType, setSuccessModalType] = useState<'edit' | 'delete' | null>(null);
  const [jobIdToDelete, setJobIdToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setJobs(jobOpenings);
  }, [jobOpenings]);

  const userRole = session?.backendUser?.role;

  const handleApply = (jobId: number) => {
    router.push(`/application/${jobId}`);
  };

  const handleEdit = (jobId: number) => {
    setEditingJobId(jobId);
  };

  const handleEditSuccess = () => {
    setSuccessModalType('edit');
  };

  const handleSuccessModalClose = () => {
    const lastAction = successModalType;
    setSuccessModalType(null);

    if (lastAction === 'edit') {
      // Reload the page to show updated job data
      globalThis.location.reload();
    }
  };

  const handleDelete = (jobId: number) => {
    setJobIdToDelete(jobId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (jobIdToDelete == null || isDeleting) return;

    const jobId = jobIdToDelete;
    setIsDeleting(true);
    try {
      await JobService.deleteJobPost(String(jobId));
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setSuccessModalType('delete');
    } catch (error) {
      console.error('Failed to delete job post:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setJobIdToDelete(null);
    }
  };

  const handleDeleteModalClose = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setJobIdToDelete(null);
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
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            viewType={viewType}
            onApply={userRole === 'Visitor' || isAdminAuthenticated ? undefined : handleApply}
            onEdit={handleEdit}
            onViewApplications={handleViewApplications}
            onDelete={handleDelete}
          />
        ))}

        {jobs.length === 0 && (
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
        isOpen={successModalType !== null}
        onClose={handleSuccessModalClose}
        title={
          successModalType === 'delete' ? 'Job Deleted Successfully' : 'Job Updated Successfully'
        }
        message={
          successModalType === 'delete'
            ? 'Your job post has been deleted'
            : 'Your job post has been updated'
        }
        description={
          successModalType === 'delete'
            ? 'This job posting has been removed and candidates will no longer be able to apply.'
            : 'The changes to your job posting have been saved and are now live.'
        }
        buttonText="Got it"
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Post?"
        message="This action is permanent"
        description="This will permanently delete this job post and all associated data. This action cannot be undone."
      />
    </div>
  );
}
