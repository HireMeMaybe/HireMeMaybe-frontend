'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { JobApplicationHistory } from '@/types/history';
import { Button } from '@/components/ui/button';

type HistoryCardProps = {
  readonly application: JobApplicationHistory;
  readonly selected: boolean;
  readonly onSelect: () => void;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-400';
    case 'in consideration':
      return 'text-blue-400';
    case 'rejected':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in consideration':
      return 'In Consideration';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

export default function HistoryCard({ application, selected, onSelect }: HistoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-start gap-4 p-4 text-left transition-colors hover:bg-gray-800 ${
        selected ? 'border-primary-green border-l-4 bg-gray-900' : ''
      }`}
    >
      {/* Company Logo */}
      {application.companyLogo ? (
        <div className="relative h-12 w-12 overflow-hidden rounded">
          <Image
            src={application.companyLogo}
            alt={`${application.companyName} logo`}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent) parent.style.display = 'none';
              const fallback = parent?.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        </div>
      ) : null}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded bg-gray-600 text-sm font-semibold text-white ${application.companyLogo ? 'hidden' : ''}`}
      >
        {application.companyName.substring(0, 2).toUpperCase()}
      </div>

      {/* Job Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-white">{application.jobTitle}</h3>
        <p className="truncate text-sm text-gray-400">{application.companyName}</p>
        <p className="truncate text-sm text-gray-400">{application.location}</p>

        {/* Status and Date */}
        <div className="mt-2 flex items-center gap-4">
          <span className={`text-xs font-medium ${getStatusColor(application.status)}`}>
            {formatStatus(application.status)}
          </span>
          <span className="text-xs text-gray-500">
            Applied {formatDate(application.appliedDate)}
          </span>
        </div>
      </div>
    </button>
  );
}

// Job Details Component for the right panel
type JobDetailsProps = {
  readonly application: JobApplicationHistory;
};

export function HistoryDetails({ application }: JobDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-very-dark-gray rounded-lg border border-gray-700 p-6">
      {/* Header Section with Company Logo and External Link */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          {application.companyLogo ? (
            <div className="relative h-16 w-16 overflow-hidden rounded">
              <Image
                src={application.companyLogo}
                alt={`${application.companyName} logo`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) parent.style.display = 'none';
                  const fallback = parent?.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            </div>
          ) : null}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded bg-gray-600 text-lg font-bold text-white ${application.companyLogo ? 'hidden' : ''}`}
          >
            {application.companyName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg text-white">{application.companyName}</p>
            <p className="text-sm text-white">{application.location}</p>
          </div>
        </div>
        <ExternalLink className="hover:text-primary-green mt-2 h-6 w-6 cursor-pointer text-gray-400" />
      </div>

      {/* Job Title */}
      <h1 className="mb-4 text-2xl font-bold text-white">{application.jobTitle}</h1>

      {/* Status and Applied Date */}
      <div className="mb-6 flex items-center gap-4">
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${getStatusColor(application.status)} bg-gray-800`}
        >
          {formatStatus(application.status)}
        </span>
        <span className="text-sm text-gray-400">Applied {formatDate(application.appliedDate)}</span>
      </div>

      {/* View Application Button */}
      <Button className="bg-primary-green mb-6 cursor-pointer rounded-full px-8 py-3 text-sm text-white hover:bg-green-600">
        View Application
      </Button>

      {/* Job Description */}
      <div className="text-sm leading-relaxed text-gray-300">
        {/* Job Details as Tags */}
        <div className="mb-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Job Details</h3>
          <div className="flex flex-wrap gap-3">
            {/* Job Type Tag (Onsite/Hybrid/Remote) */}
            <div className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2">
              <p className="mb-1 text-xs text-gray-400">Job Type</p>
              <p className="text-sm font-medium text-white">{application.jobType || 'Onsite'}</p>
            </div>

            {/* Experience Level Tag */}
            {application.answer?.experience_level && (
              <div className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2">
                <p className="mb-1 text-xs text-gray-400">Experience Level</p>
                <p className="text-sm font-medium text-white">
                  {application.answer.experience_level}
                </p>
              </div>
            )}

            {/* Salary Tag */}
            {application.answer?.expected_salary && (
              <div className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2">
                <p className="mb-1 text-xs text-gray-400">Expected Salary</p>
                <p className="text-sm font-medium text-white">
                  {application.answer.expected_salary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tags/Skills */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {application.answer?.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full border border-gray-600 bg-gray-700 px-3 py-1 text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Job Description</h3>
          <p className="text-sm leading-relaxed text-gray-300">
            We are looking for a skilled {application.jobTitle} to join our dynamic team at{' '}
            {application.companyName}. This position offers an excellent opportunity to work with
            cutting-edge technologies and contribute to innovative projects in{' '}
            {application.location}.
          </p>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Requirements</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Strong problem-solving and analytical skills</li>
            <li>• Excellent communication and teamwork abilities</li>
            {application.answer?.tags && application.answer.tags.length > 0 && (
              <li>• Experience with {application.answer.tags.slice(0, 3).join(', ')}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
