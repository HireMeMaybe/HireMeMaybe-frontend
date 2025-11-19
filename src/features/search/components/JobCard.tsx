'use client';

import { ExternalLink, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import ReportModal from '@/components/modals/ReportModal';
import { AdminService } from '@/lib/services';
import { SuccessModal } from '@/components/modals';

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

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

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

  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const userRole = session?.backendUser?.role ?? session?.role;
  const hasAlreadyApplied = job.userApply === true;
  const showApplyButton = userRole !== 'Company' && userRole !== 'Visitor' && !hasAlreadyApplied;
  const canReportJob =
    isAdminAuthenticated || ['CPSK', 'Visitor', 'Admin'].includes(userRole ?? '');

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
      {/* Header Section with Company Logo, External Link, and Report */}
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
        <div className="flex items-center gap-3">
          {canReportJob && (
            <Button
              aria-label="Report job post"
              variant="outline"
              size="icon"
              className="border-red-500/70 text-red-400 hover:border-red-400 hover:bg-red-500/10"
              onClick={() => setShowReportModal(true)}
            >
              <Flag className="size-5" />
            </Button>
          )}
          <ExternalLink
            onClick={handleExternalLink}
            className="hover:text-primary-green mt-2 mb-2 h-6 w-6 cursor-pointer text-gray-400"
          />
        </div>
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

      {/* Actions: Apply (if allowed) */}
      {showApplyButton && (
        <div className="mb-6">
          <Button
            onClick={handleApply}
            className="bg-primary-green cursor-pointer rounded-full px-8 py-3 text-sm text-white hover:bg-green-600"
          >
            Apply
          </Button>
        </div>
      )}

      {/* Job Description */}
      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-300">
        {job.description || 'No description provided for this role.'}
      </div>

      {canReportJob && showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          reportType="post"
          onSubmit={async (data) => {
            try {
              await AdminService.submitReport({
                reported_id: job.id,
                reportedEntityType: 'post',
                reason: data.details,
              });
              setReportSuccess(true);
            } catch (error) {
              console.error('Failed to submit report:', error);
            } finally {
              setShowReportModal(false);
            }
          }}
          onClose={() => setShowReportModal(false)}
        />
      )}
      {canReportJob && reportSuccess && (
        <SuccessModal
          message="Report submitted successfully. Thank you for your feedback."
          isOpen={reportSuccess}
          onClose={() => setReportSuccess(false)}
        />
      )}
    </div>
  );
}
