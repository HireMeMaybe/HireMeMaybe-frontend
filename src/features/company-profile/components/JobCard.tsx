'use client';

import { Button } from '@/components/ui/button';
import { Users, Edit, Eye, Trash2, ExternalLink } from 'lucide-react';
import type { JobOpening } from '@/types/company';

interface JobCardProps {
  readonly job: JobOpening;
  readonly viewType: 'owner' | 'company' | 'cpsk';
  readonly onApply?: (jobId: number) => void;
  readonly onEdit?: (jobId: number) => void;
  readonly onViewApplications?: (jobId: number) => void;
  readonly onDelete?: (jobId: number) => void;
}

export default function JobCard({
  job,
  viewType,
  onApply,
  onEdit,
  onViewApplications,
  onDelete,
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
        <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
          <span>{job.title}</span>
          {job.id ? (
            <a
              href={`/job-post/${job.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${job.title} in a new tab`}
              className="text-zinc-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </h3>
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
                onClick={() => onDelete?.(job.id)}
                className="bg-red-reject flex cursor-pointer items-center gap-1 rounded-md px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={() => onViewApplications?.(job.id)}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-[#02BC77] px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <Eye className="h-4 w-4" />
                View Applications
              </Button>
            </>
          ) : viewType === 'cpsk' ? (
            <Button
              onClick={() => onApply?.(job.id)}
              className="rounded-md bg-[#02BC77] px-6 py-2 text-sm text-white hover:bg-green-700"
            >
              Apply
            </Button>
          ) : null}
        </div>
      </div>

      {/* Right Side - Job Info */}
      <div className="ml-6 flex-shrink-0">
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
      </div>
    </div>
  );
}
