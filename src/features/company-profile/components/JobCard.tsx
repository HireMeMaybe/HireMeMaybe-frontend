"use client";

import { Button } from '@/components/ui/button';
import { Users, Edit, Eye } from 'lucide-react';
import type { JobOpening } from '@/types/company';

interface JobCardProps {
  readonly job: JobOpening;
  readonly viewType: 'student' | 'company';
  readonly onApply?: (jobId: number) => void;
  readonly onEdit?: (jobId: number) => void;
  readonly onViewApplications?: (jobId: number) => void;
}

export default function JobCard({ 
  job, 
  viewType, 
  onApply, 
  onEdit, 
  onViewApplications 
}: JobCardProps) {
  return (
    <div className="border border-gray-cancel rounded-xl p-4 bg-very-dark-gray flex items-start justify-between">
      {/* Left Side - Job Info */}
      <div className="flex-1">
        <div className="mb-1">
          <span className="text-lighter-gray-text text-sm">{job.department}</span>
        </div>
        <h3 className="text-white font-semibold text-lg mb-1">
          {job.title}
        </h3>
        <p className="text-lighter-gray-text text-sm mb-3">
          {job.location} | {job.type}
        </p>

        {/* Application Count - Company View Only */}
        {viewType === 'company' && (
          <div className="flex items-center gap-1 text-white text-sm mb-4">
            <Users className="w-4 h-4 text-primary-green" />
            <span>{job.applicationCount} Applications</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {viewType === 'company' ? (
            <>
              <Button
                onClick={() => onEdit?.(job.id)}
                className="bg-[#595256] hover:bg-gray-cancel text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                onClick={() => onViewApplications?.(job.id)}
                className="bg-[#02BC77] hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View Applications
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onApply?.(job.id)}
              className="bg-[#02BC77] hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm"
            >
              Apply
            </Button>
          )}
        </div>
      </div>

      {/* Right Side - Job Image */}
      <div className="flex-shrink-0 ml-6">
        <div className="w-60 h-40 rounded-lg overflow-hidden">
          {job.id === 1 ? (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 flex items-center justify-center relative">
              <div className="absolute inset-2 border-2 border-amber-400/30 rounded-lg"></div>
              <div className="absolute inset-4 border border-amber-400/20 rounded-md"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center relative">
              <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}