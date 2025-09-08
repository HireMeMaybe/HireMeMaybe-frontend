"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  job: any;
  selected: boolean;
  onSelect: () => void;
}

export default function JobCard({ job, selected, onSelect }: JobCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
        selected ? "border-l-4 border-primary-green bg-gray-900" : ""
      }`}
    >
      <h3 className="font-semibold text-white">{job.title}</h3>
      <p className="text-sm text-gray-text">{job.company}</p>
      <p className="text-xs text-gray-text">{job.location}</p>
    </div>
  );
}

export function JobDetails({ job }: { job: any }) {
  return (
    <div className="border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{job.title}</h2>
          <p className="text-sm text-gray-text">{job.company}</p>
          <p className="text-sm text-gray-text">{job.location}</p>
        </div>
        <ExternalLink className="w-5 h-5 text-gray-text hover:text-primary-green" />
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <span className="px-3 py-1 bg-primary-green text-white text-xs rounded-full">
          {job.tags[0]}
        </span>
        <span className="text-xs text-gray-text">{job.tags[1]}</span>
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
