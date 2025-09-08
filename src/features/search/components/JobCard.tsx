"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Job = {
  readonly id: number;
  readonly title: string;
  readonly company: string;
  readonly location: string;
  readonly logoPath: string;
  readonly tags?: string[];
  readonly description?: string;
};

type JobCardProps = {
  readonly job: Job;
  readonly selected: boolean;
  readonly onSelect: () => void;
};

export default function JobCard({ job, selected, onSelect }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-4 p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors ${
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

export function JobDetails({ job }: { readonly job: Job }) {
  return (
    <div className="border border-gray-700 p-6">
      <div className="flex items-center gap-4 mb-4">
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

        <ExternalLink className="w-5 h-5 text-gray-text hover:text-primary-green" />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        {job.tags?.map((tag) => (
          <span
            key={tag}
            className={`px-3 py-1 text-xs rounded-full ${
              job.tags?.[0] === tag ? "bg-primary-green text-white" : "text-gray-text"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <Button className="bg-primary-green hover:bg-green-600 text-white text-sm px-6 py-2 mb-6">
        Apply
      </Button>

      <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
        {job.description}
      </p>
    </div>
  );
}
