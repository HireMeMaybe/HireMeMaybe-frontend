'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/services/api-client';
import { CompanyService } from '@/lib/services/company.service';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { Company, JobOpening, BackendCompanyResponse } from '@/types/company';
import { normalizeUser } from '@/lib/utils/user';

type BackendJob = NonNullable<BackendCompanyResponse['job_post']>[number];

async function createObjectUrl(
  id: number | null | undefined,
  loader: (assetId: number) => Promise<Blob>
): Promise<string | undefined> {
  if (id == null) {
    console.log('createObjectUrl: No ID provided, returning undefined');
    return undefined;
  }
  console.log('createObjectUrl: Fetching asset with ID:', id);
  try {
    const blob = await loader(id);
    console.log('createObjectUrl: Successfully fetched blob, size:', blob.size, 'type:', blob.type);
    const url = URL.createObjectURL(blob);
    console.log('createObjectUrl: Created blob URL:', url);
    return url;
  } catch (err) {
    console.error('createObjectUrl: Failed to fetch company asset:', err);
    return undefined;
  }
}

function mapJobType(value?: string | null): JobOpening['type'] {
  const normalized = value?.toLowerCase();
  switch (normalized) {
    case 'part-time':
    case 'part time':
      return 'Part-time';
    case 'internship':
      return 'Internship';
    case 'contract':
      return 'Contract';
    case 'full-time':
    case 'full time':
    default:
      return 'Full-time';
  }
}

function parseJobRequirements(req: BackendJob['req']): string[] {
  if (typeof req === 'string' && req.length > 0) {
    return req
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return Array.isArray(req) ? req : [];
}

function mapJob(job: BackendJob): JobOpening {
  return {
    id: job.id ?? 0,
    title: job.title || '',
    department: '',
    location: job.location || '',
    type: mapJobType(job.type),
    applicationCount: job.applications?.length,
    imageUrl: undefined,
    description: job.desc,
    requirements: parseJobRequirements(job.req),
    salary: job.salary || undefined,
    tags: Array.isArray(job.tags) ? job.tags : [],
    expLevel: job.exp_lvl || undefined,
    expiring: job.expiring || undefined,
    companyId: job.company_id || undefined,
    rawApplications: Array.isArray(job.applications) ? job.applications : [],
    postedDate: job.post_time || '',
  };
}

function mapJobOpenings(jobPost: BackendCompanyResponse['job_post']): JobOpening[] {
  if (!Array.isArray(jobPost)) return [];
  return jobPost.map((job) => mapJob(job));
}

async function hydrateCompany(data: BackendCompanyResponse): Promise<Company> {
  console.log('hydrateCompany: Received data:', {
    id: data.id,
    name: data.name,
    logo_id: data.logo_id,
    banner_id: data.banner_id,
  });

  // Backend may return user data as 'user' or 'User' (Pascal case)
  const userData = data.User || data.user;
  const contactInfo = normalizeUser(userData ?? null);

  const baseCompany: Company = {
    id: String(data.id),
    name: data.name || '',
    industry: data.industry || '',
    size: data.size || '',
    location: data.location || '',
    // Prioritize top-level fields over nested user fields (top-level is fresher)
    email: data.email || data.contact || contactInfo.email || '',
    phone: data.tel || data.phone || contactInfo.tel || '',
    logoUrl: undefined,
    bannerUrl: undefined,
    about: data.overview || '',
    website: data.website || '',
  };

  console.log(
    'hydrateCompany: Fetching assets - logo_id:',
    data.logo_id,
    'banner_id:',
    data.banner_id
  );

  const [logoUrl, bannerUrl] = await Promise.all([
    createObjectUrl(data.logo_id, CompanyService.fetchLogo),
    createObjectUrl(data.banner_id, CompanyService.fetchBanner),
  ]);

  return {
    ...baseCompany,
    ...(logoUrl ? { logoUrl } : {}),
    ...(bannerUrl ? { bannerUrl } : {}),
  };
}

export function useCompanyProfile(companyId: string, isOwner: boolean = false) {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { update } = useSession();

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sessionUpdater =
          typeof update === 'function'
            ? async (partial: Partial<Session>) => {
                await update(partial);
              }
            : undefined;

        // For owner: fetch and sync session with fresh User data
        // For non-owner: just fetch public profile, no session sync
        const data = isOwner
          ? await CompanyService.getMyProfileAndSync(sessionUpdater)
          : await CompanyService.getCompany(companyId);

        const hydratedCompany = await hydrateCompany(data);
        const jobs = mapJobOpenings(data.job_post);

        if (!('job_post' in data)) {
          console.warn('company.myprofile did not include job_post field; no jobs will be shown');
        }

        if (mounted) {
          setCompany(hydratedCompany);
          setJobOpenings(jobs);
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
      // Cleanup blob URLs on unmount
      if (company?.logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(company.logoUrl);
      }
      if (company?.bannerUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(company.bannerUrl);
      }
    };
    // Only re-fetch when companyId or isOwner changes, not when URLs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, isOwner]);

  return {
    company,
    jobOpenings,
    isLoading,
    error,
    refetch: () => {
      // Trigger a refetch by setting loading true and re-calling effect
      setIsLoading(true);
      setError(null);
      // A simple way to re-run: set company to null (effect depends on companyId only)
      setCompany(null);
    },
  };
}
