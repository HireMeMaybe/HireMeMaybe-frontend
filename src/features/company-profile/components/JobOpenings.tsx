// src/features/company-profile/components/JobOpenings.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import JobCard from './JobCard';
import { ConfirmModal } from '@/components/modals';
import type { JobOpening } from '@/types/company';

interface JobOpeningsProps {
  jobOpenings: JobOpening[];
  viewType: 'student' | 'company';
  onPostNewJob?: () => void;
}

export default function JobOpenings({ 
  jobOpenings, 
  viewType, 
  onPostNewJob 
}: JobOpeningsProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleApply = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsConfirmModalOpen(true);
  };

  const handleEdit = (jobId: string) => {
    console.log('Edit job:', jobId);
    // Implement edit functionality
  };

  const handleViewApplications = (jobId: string) => {
    console.log('View applications for job:', jobId);
    // Implement view applications functionality
  };

  const handleConfirmApplication = () => {
    if (selectedJobId) {
      console.log('Applied to job:', selectedJobId);
      // Implement actual application logic
    }
  };

  const selectedJob = jobOpenings.find(job => job.id === selectedJobId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Current Job Openings</h2>
        {viewType === 'company' && (
          <Button
            onClick={onPostNewJob}
            className="bg-primary-green hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
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

      {/* Application Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedJobId(null);
        }}
        title="Submit Application?"
        message="Please confirm your choice"
        description={selectedJob ? 
          `Are you ready to submit your application to\n${selectedJob.title} at Tech Innovators Inc?` : 
          "Are you ready to submit your application?"
        }
        onConfirm={handleConfirmApplication}
      />
    </div>
  );
}