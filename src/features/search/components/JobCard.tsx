// src/features/search/components/JobCard.tsx
"use client";

import { ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { JobWithQuestions } from "@/types/application";

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
      className={`w-full text-left flex items-center cursor-pointer gap-4 p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors ${
        selected ? "border-l-4 border-primary-green bg-gray-900" : ""
      }`}
    >
      {/* Company Logo */}
      <div className="w-14 h-14 bg-gray-600 rounded flex items-center justify-center">
        <img
          src={job.logoPath}
          alt={job.company}
          className="w-12 h-12 object-contain"
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
    <div className="border border-gray-700 p-6 bg-very-dark-gray rounded-lg">
      {/* Header Section with Company Logo and External Link */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center">
            <img
              src={job.logoPath}
              alt={job.company}
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <p className="text-lg text-white">{job.company}</p>
            <p className="text-sm text-white">{job.location}</p>
          </div>
        </div>
        <ExternalLink className="w-6 h-6 text-gray-400 hover:text-primary-green cursor-pointer mt-2" />
      </div>

      {/* Job Title */}
      <h1 className="text-2xl font-bold text-white mb-4">{job.title}</h1>

      {/* Tags and Posted Date */}
      <div className="flex items-center gap-4 mb-6">
        {job.tags?.map((tag) => (
          <span
            key={tag}
            className={`px-3 py-1 text-xs rounded-full flex items-center gap-2 ${
              job.tags?.[0] === tag ? "bg-primary-green text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            <Calendar className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {job.postedDate && (
          <span className="text-sm text-gray-400">
            {job.postedDate}
          </span>
        )}
      </div>

      {/* Apply Button */}
      <Button 
        onClick={handleApply}
        className="bg-primary-green hover:bg-green-600 text-white text-sm px-8 py-3 mb-6 rounded-full cursor-pointer"
      >
        Apply
      </Button>

      {/* Job Description */}
      <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
        {job.description}
      </div>
    </div>
  );
}