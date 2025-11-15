'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export interface JobSearchResult {
  id: number | string;
  companyId?: string;
  title: string;
  companyName: string;
  location?: string;
  industry?: string;
  description?: string;
  tags?: string[];
  postedDate?: string;
  logoUrl?: string;
  salary?: string;
  expLevel?: string;
  type?: string;
  userApply?: boolean | null;
}

type JobCardProps = {
  readonly job: JobSearchResult;
  readonly selected: boolean;
  readonly onSelect: () => void;
};

export default function JobCard({ job, selected, onSelect }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-4 border-b border-gray-700 p-4 text-left transition-colors hover:bg-gray-800 ${
        selected ? 'border-primary-green border-l-4 bg-gray-900' : ''
      }`}
    >
      {/* Company Logo */}
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded bg-gray-600">
        {job.logoUrl ? (
          <Image
            src={job.logoUrl}
            alt={job.companyName}
            width={48}
            height={48}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <div aria-hidden className="h-12 w-12 animate-pulse rounded bg-zinc-700" />
        )}
      </div>

      {/* Job Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-white">{job.title}</h3>
        <p className="text-sm text-gray-400">{job.companyName}</p>
        <p className="text-sm text-gray-400">{job.location || 'Location not specified'}</p>
      </div>
    </button>
  );
}

export function JobDetails({ job }: { readonly job: JobSearchResult }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleApply = () => {
    router.push(`/application/${job.id}`);
  };

  const handleExternalLink = () => {
    window.open(`/job-post/${job.id}`, '_blank');
  };

  const handleCompanyClick = () => {
    if (job.companyId) {
      router.push(`/company/${job.companyId}`);
    }
  };

  const userRole = session?.backendUser?.role;
  const hasAlreadyApplied = job.userApply === true;
  const showApplyButton = userRole !== 'Company' && userRole !== 'Visitor' && !hasAlreadyApplied;

  const formatPostedDate = (value?: string): string | undefined => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString();
  };

  return (
    <div className="bg-very-dark-gray rounded-lg border border-gray-700 p-6">
      {/* Header Section with Company Logo and External Link */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {job.companyId ? (
            <button
              type="button"
              onClick={handleCompanyClick}
              className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded bg-gray-600 transition-opacity hover:opacity-80"
            >
              {job.logoUrl ? (
                <Image
                  src={job.logoUrl}
                  alt={job.companyName}
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <div aria-hidden className="h-14 w-14 animate-pulse rounded bg-zinc-600" />
              )}
            </button>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-600">
              {job.logoUrl ? (
                <Image
                  src={job.logoUrl}
                  alt={job.companyName}
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <div aria-hidden className="h-14 w-14 animate-pulse rounded bg-zinc-600" />
              )}
            </div>
          )}
          <div>
            {job.companyId ? (
              <button
                type="button"
                onClick={handleCompanyClick}
                className="hover:text-primary-green cursor-pointer text-left text-lg text-white transition-colors"
              >
                {job.companyName}
              </button>
            ) : (
              <p className="text-lg text-white">{job.companyName}</p>
            )}
            <p className="text-sm text-white">{job.location || 'Location not specified'}</p>
            {(job.type || job.expLevel || job.salary) && (
              <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-400">
                {job.type && <span>{job.type}</span>}
                {job.expLevel && <span>Experience: {job.expLevel}</span>}
                {job.salary && <span>Salary: {job.salary}</span>}
              </div>
            )}
          </div>
        </div>
        <ExternalLink
          onClick={handleExternalLink}
          className="hover:text-primary-green mt-2 h-6 w-6 cursor-pointer text-gray-400"
        />
      </div>

      {/* Job Title */}
      <h1 className="mb-4 text-2xl font-bold text-white">{job.title}</h1>

      {/* Tags and Posted Date */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {job.tags?.map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
              job.tags?.[0] === tag ? 'bg-primary-green text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {tag}
          </span>
        ))}
        {formatPostedDate(job.postedDate) && (
          <span className="text-sm text-gray-400">Posted {formatPostedDate(job.postedDate)}</span>
        )}
      </div>

      {/* Apply Button */}
      {showApplyButton && (
        <Button
          onClick={handleApply}
          className="bg-primary-green mb-6 cursor-pointer rounded-full px-8 py-3 text-sm text-white hover:bg-green-600"
        >
          Apply
        </Button>
      )}

      {/* Job Description */}
      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-300">
        {job.description || 'No description provided for this role.'}
      </div>
    </div>
  );
}
