'use client';

import { Button } from '@/components/ui/button';
import { Users, Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import type { JobOpening } from '@/types/company';

interface JobCardProps {
  readonly job: JobOpening;
  readonly viewType: 'owner' | 'company' | 'cpsk';
  readonly onApply?: (jobId: number) => void;
  readonly onEdit?: (jobId: number) => void;
  readonly onViewApplications?: (jobId: number) => void;
}

export default function JobCard({
  job,
  viewType,
  onApply,
  onEdit,
  onViewApplications,
}: JobCardProps) {
  return (
    <div className="border-gray-cancel bg-very-dark-gray flex items-start justify-between rounded-xl border p-4">
      {/* Left Side - Job Info */}
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          {job.expLevel && (
            <span className="text-lighter-gray-text rounded-md bg-zinc-800 px-2 py-1 text-xs">
              {job.expLevel}
            </span>
          )}
          {job.salary && (
            <span className="text-primary-green rounded-md bg-green-900/20 px-2 py-1 text-xs font-medium">
              {job.salary}
            </span>
          )}
        </div>
        <h3 className="mb-1 text-lg font-semibold text-white">{job.title}</h3>
        <p className="text-lighter-gray-text mb-2 text-sm">
          {job.location} | {job.type}
        </p>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {job.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                +{job.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Application Count - Owner View Only */}
        {viewType === 'owner' && (
          <div className="mb-4 flex items-center gap-1 text-sm text-white">
            <Users className="text-primary-green h-4 w-4" />
            <span>{job.applicationCount || 0} Applications</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {viewType === 'owner' ? (
            <>
              <Button
                onClick={() => onEdit?.(job.id)}
                className="hover:bg-gray-cancel flex cursor-pointer items-center gap-1 rounded-md bg-[#595256] px-4 py-2 text-sm text-white"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={() => onViewApplications?.(job.id)}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-[#02BC77] px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <Eye className="h-4 w-4" />
                View Applications
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onApply?.(job.id)}
              className="rounded-md bg-[#02BC77] px-6 py-2 text-sm text-white hover:bg-green-700"
            >
              Apply
            </Button>
          )}
        </div>
      </div>

      {/* Right Side - Job Image/Info */}
      <div className="ml-6 flex-shrink-0">
        <div className="relative h-40 w-60 overflow-hidden rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900">
          {job.imageUrl ? (
            <Image
              src={job.imageUrl}
              alt={job.title}
              fill
              className="object-cover"
              sizes="240px"
            />
          ) : (
            <div className="flex h-full flex-col justify-between p-4">
              {/* Job Stats */}
              <div className="space-y-2">
                {job.postedDate && (
                  <div className="text-xs text-zinc-400">
                    Posted: {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                )}
                {job.expiring && (
                  <div className="text-xs text-orange-400">
                    Expires: {new Date(job.expiring).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Description Preview */}
              {job.description && (
                <div className="mt-auto">
                  <p className="line-clamp-3 text-xs text-zinc-400">
                    {job.description.substring(0, 120)}
                    {job.description.length > 120 && '...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
