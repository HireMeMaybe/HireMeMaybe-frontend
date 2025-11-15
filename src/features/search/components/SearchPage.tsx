// src/features/search/components/SearchPage.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowDownUp, Loader2, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobService, type JobPostSummary } from '@/lib/services/job.service';
import { CompanyService } from '@/lib/services/company.service';
import SearchFilters, { type SearchFilterKey } from './SearchFilters';
import JobCard, { JobDetails, type JobSearchResult } from './JobCard';
import Pagination from './Pagination';

const JOBS_PER_PAGE = 8;

type FiltersState = Partial<Record<SearchFilterKey, string>>;

function mapToJobResult(job: JobPostSummary): JobSearchResult | null {
  if (job.id == null) {
    return null;
  }

  const descriptionFromReq =
    typeof job.req === 'string' ? job.req : Array.isArray(job.req) ? job.req.join('\n') : undefined;

  return {
    id: job.id,
    companyId: job.company_id ? String(job.company_id) : undefined,
    title: job.title || 'Untitled Position',
    companyName: job.company?.name || 'Unknown Company',
    location: job.location || job.company?.location,
    industry: job.company?.industry,
    description: job.desc?.trim() ? job.desc : descriptionFromReq,
    tags: Array.isArray(job.tags) ? job.tags : undefined,
    postedDate: job.post_time,
    salary: job.salary,
    expLevel: job.exp_lvl,
    type: job.type,
    userApply: job.user_apply,
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FiltersState>({});
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [companyCache, setCompanyCache] = useState<
    Record<
      string,
      {
        name?: string;
        logoUrl?: string;
        industry?: string;
        location?: string;
      }
    >
  >({});
  const [selectedJobId, setSelectedJobId] = useState<JobSearchResult['id'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(true);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Initialize search query from URL params
  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setSearchQuery(queryParam);
      setDebouncedQuery(queryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const missingCompanyIds = Array.from(
      new Set(
        jobs
          .map((job) => job.companyId)
          .filter((id): id is string => id !== undefined && id !== null && !(id in companyCache))
      )
    );

    if (missingCompanyIds.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchCompanies = async () => {
      try {
        const responses = await Promise.all(
          missingCompanyIds.map(async (companyId) => {
            try {
              const company = await CompanyService.getCompany(companyId);
              let logoUrl: string | undefined;

              if (company.logo_id != null) {
                const blob = await CompanyService.fetchLogo(company.logo_id);
                logoUrl = URL.createObjectURL(blob);
                blobUrlsRef.current.add(logoUrl);
              }

              const industry = company.industry || undefined;
              const location = undefined;

              return {
                companyId,
                name: company.name || company.user?.username,
                logoUrl,
                industry,
                location,
              };
            } catch (err) {
              console.error(`Failed to fetch company ${companyId}:`, err);
              return {
                companyId,
                name: undefined,
                logoUrl: undefined,
                industry: undefined,
                location: undefined,
              };
            }
          })
        );

        if (cancelled) return;

        setCompanyCache((prev) => {
          const next = { ...prev };

          for (const { companyId, name, logoUrl, industry, location } of responses) {
            const existing = prev[companyId];
            if (existing?.logoUrl && existing.logoUrl !== logoUrl) {
              URL.revokeObjectURL(existing.logoUrl);
              blobUrlsRef.current.delete(existing.logoUrl);
            }

            next[companyId] = {
              name: name ?? existing?.name,
              logoUrl: logoUrl ?? existing?.logoUrl,
              industry: industry ?? existing?.industry,
              location: location ?? existing?.location,
            };
          }

          return next;
        });
      } catch (err) {
        console.error('Failed to load company details:', err);
      }
    };

    fetchCompanies();

    return () => {
      cancelled = true;
    };
  }, [jobs, companyCache]);

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await JobService.searchJobs({
          search: debouncedQuery || undefined,
          type: filters.type,
          tag: filters.tag,
          salary: filters.salary,
          exp: filters.exp,
          company: filters.company,
          industry: filters.industry,
          location: filters.location,
          desc: sortDesc,
        });

        if (cancelled) return;

        const mapped = response
          .map((job) => mapToJobResult(job))
          .filter((job): job is JobSearchResult => job !== null);

        setJobs(mapped);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch job posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch job posts');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filters, sortDesc]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filters, sortDesc]);

  useEffect(() => {
    if (jobs.length === 0) {
      setSelectedJobId(null);
      return;
    }

    setSelectedJobId((prev) => {
      if (prev == null) {
        return jobs[0].id;
      }
      return jobs.some((job) => job.id === prev) ? prev : jobs[0].id;
    });
  }, [jobs]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
    setCurrentPage((prev) => Math.min(prev, total));
  }, [jobs]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    return jobs.slice(start, start + JOBS_PER_PAGE);
  }, [jobs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));

  const resolveJob = useCallback(
    (job: JobSearchResult): JobSearchResult => {
      if (!job.companyId) return job;
      const companyData = companyCache[job.companyId];
      if (!companyData) return job;

      return {
        ...job,
        companyName: companyData.name ?? job.companyName,
        logoUrl: companyData.logoUrl ?? job.logoUrl,
        industry: companyData.industry ?? job.industry,
        location: companyData.location ?? job.location,
      };
    },
    [companyCache]
  );

  const resolvedPaginatedJobs = useMemo(
    () => paginatedJobs.map((job) => resolveJob(job)),
    [paginatedJobs, resolveJob]
  );

  const companyOptions = useMemo(() => {
    const names = new Set<string>();

    Object.values(companyCache).forEach(({ name }) => {
      if (name) {
        names.add(name);
      }
    });

    if (names.size === 0) {
      jobs.forEach((job) => {
        if (job.companyName) {
          names.add(job.companyName);
        }
      });
    }

    if (filters.company && !names.has(filters.company)) {
      names.add(filters.company);
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [companyCache, jobs, filters.company]);

  const industryOptions = useMemo(() => {
    const industries = new Set<string>();

    Object.values(companyCache).forEach(({ industry }) => {
      if (industry) {
        industries.add(industry);
      }
    });

    jobs.forEach((job) => {
      if (job.industry) {
        industries.add(job.industry);
      }
    });

    if (filters.industry && !industries.has(filters.industry)) {
      industries.add(filters.industry);
    }

    return Array.from(industries).sort((a, b) => a.localeCompare(b));
  }, [companyCache, jobs, filters.industry]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();

    jobs.forEach((job) => {
      job.tags?.forEach((tag) => {
        const normalized = tag.trim();
        if (normalized.length > 0) {
          tags.add(normalized);
        }
      });
    });

    if (filters.tag && !tags.has(filters.tag)) {
      tags.add(filters.tag);
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [jobs, filters.tag]);

  const locationOptions = useMemo(() => {
    const locations = new Set<string>();

    jobs.forEach((job) => {
      const jobLocation = job.location?.trim();
      if (jobLocation) {
        locations.add(jobLocation);
      }
    });

    Object.values(companyCache).forEach(({ location }) => {
      const normalized = location?.trim();
      if (normalized) {
        locations.add(normalized);
      }
    });

    if (filters.location && !locations.has(filters.location)) {
      locations.add(filters.location);
    }

    return Array.from(locations).sort((a, b) => a.localeCompare(b));
  }, [jobs, companyCache, filters.location]);

  const selectedJob = useMemo(() => {
    const job = jobs.find((item) => item.id === selectedJobId) ?? null;
    return job ? resolveJob(job) : null;
  }, [jobs, selectedJobId, resolveJob]);

  const handleFilterChange = (key: SearchFilterKey, value: string | undefined) => {
    setFilters((prev) => {
      if (value === undefined || value.length === 0) {
        if (!(key in prev)) {
          return prev;
        }
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }

      if (prev[key] === value) {
        return prev;
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  useEffect(
    () => () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    },
    []
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Top Search + Filters */}
      <div className="container mx-auto mt-12 mb-4 px-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative mx-auto w-full max-w-xl">
            <Input
              type="search"
              placeholder="Search for job titles"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-darker-gray placeholder-gray-text h-12 w-full rounded-full border-none pr-4 pl-12 text-base text-white"
            />
            <SearchIcon className="text-gray-text absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform" />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              disabled={isLoading}
              companyOptions={companyOptions}
              industryOptions={industryOptions}
              tagOptions={tagOptions}
              locationOptions={locationOptions}
            />
            <Button
              type="button"
              variant="outline"
              className="bg-darker-gray rounded-full border-gray-700 px-4 text-sm text-white hover:bg-gray-700"
              onClick={() => setSortDesc((prev) => !prev)}
            >
              <ArrowDownUp className="h-4 w-4" />
              {sortDesc ? 'Newest first' : 'Oldest first'}
            </Button>
          </div>
        </div>
      </div>

      {/* Job List + Details */}
      <div className="container mx-auto h-full px-4 py-8">
        <div className="grid h-full grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {/* Job List */}
          <div className="flex flex-col divide-y divide-gray-700 self-stretch border border-gray-700">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading jobs...</span>
              </div>
            )}
            {error && <div className="p-4 text-sm text-red-400">{error}</div>}
            {resolvedPaginatedJobs.length === 0 && !isLoading && !error && (
              <div className="p-4 text-sm text-gray-400">
                No job postings match your search just yet. Try adjusting your filters.
              </div>
            )}
            {resolvedPaginatedJobs.map((job, index) => (
              <div
                key={job.id}
                className={index === resolvedPaginatedJobs.length - 1 ? 'border-b-0' : ''}
              >
                <JobCard
                  job={job}
                  selected={selectedJobId === job.id}
                  onSelect={() => setSelectedJobId(job.id)}
                />
              </div>
            ))}
          </div>

          {/* Job Details */}
          <div className="self-stretch lg:col-span-2">
            {selectedJob ? (
              <JobDetails job={selectedJob} />
            ) : (
              <div className="bg-very-dark-gray flex h-full items-center justify-center rounded-lg border border-gray-700 p-8 text-gray-400">
                {isLoading
                  ? 'Loading job details...'
                  : 'Select a job to view the full description.'}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {jobs.length > JOBS_PER_PAGE && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
