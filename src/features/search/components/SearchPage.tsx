"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useJobs } from "../hooks/useJobs";
import SearchFilters from "./SearchFilters";
import JobCard, { JobDetails } from "./JobCard";
import Pagination from "./Pagination";

const JOBS_PER_PAGE = 8;

export default function SearchPage() {
  const { jobs } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Search + Filters */}
        <div className="container mx-auto px-4 mt-12 mb-4">
            <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto w-full">
                <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 text-base bg-component border-none rounded-full text-white placeholder-gray-text"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-text" />
            </div>

            {/* Filter Row */}
            <SearchFilters />
            </div>
        </div>
      

      {/* Job List + Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="lg:col-span-1 border border-gray-700">
            {paginatedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={() => setSelectedJob(job)}
              />
            ))}
          </div>

          {/* Job Details */}
          <div className="lg:col-span-2">
            {selectedJob ? <JobDetails job={selectedJob} /> : null}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
            <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            />
        </div>
      </div>
    </div>
  );
}
