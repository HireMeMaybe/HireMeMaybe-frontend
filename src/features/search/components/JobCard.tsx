'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { JobWithQuestions } from '@/types/application';
import Image from 'next/image';

type JobCardProps = {
  readonly job: JobWithQuestions;
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
      <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-600">
        <Image
          src={job.logoPath as string}
          alt={job.company}
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
      </div>

      {/* Job Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-white">{job.title}</h3>
        <p className="text-sm text-gray-400">{job.company}</p>
        <p className="text-sm text-gray-400">{job.location}</p>
      </div>
    </button>
  );
}

export function JobDetails({ job }: { readonly job: JobWithQuestions }) {
  const router = useRouter();

  const handleApply = () => {
    router.push(`/application/${job.id}`);
  };

  return (
    <div className="bg-very-dark-gray rounded-lg border border-gray-700 p-6">
      {/* Header Section with Company Logo and External Link */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-600">
            <Image
              src={job.logoPath as string}
              alt={job.company}
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
          </div>
          <div>
            <p className="text-lg text-white">{job.company}</p>
            <p className="text-sm text-white">{job.location}</p>
          </div>
        </div>
        <ExternalLink className="hover:text-primary-green mt-2 h-6 w-6 cursor-pointer text-gray-400" />
      </div>

      {/* Job Title */}
      <h1 className="mb-4 text-2xl font-bold text-white">{job.title}</h1>

      {/* Tags and Posted Date */}
      <div className="mb-6 flex items-center gap-4">
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
        {job.postedDate && <span className="text-sm text-gray-400">{job.postedDate}</span>}
      </div>

      {/* Apply Button */}
      <Button
        onClick={handleApply}
        className="bg-primary-green mb-6 cursor-pointer rounded-full px-8 py-3 text-sm text-white hover:bg-green-600"
      >
        Apply
      </Button>

      {/* Job Description */}
      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-300">
        {job.description}
      </div>
    </div>
  );
}
