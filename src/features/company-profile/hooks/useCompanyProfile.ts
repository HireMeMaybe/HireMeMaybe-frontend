'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/services/api-client';
import { CompanyService } from '@/lib/services/company.service';
import { useSession } from 'next-auth/react';
import type { Company, JobOpening, BackendCompanyResponse } from '@/types/company';
import { normalizeUser } from '@/lib/utils/user';

export function useCompanyProfile(companyId: string, isOwner: boolean = false) {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, update } = useSession();

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use /company/myprofile for owner, /company/{id} for public view
        const data: BackendCompanyResponse = isOwner
          ? await apiClient.get('/company/myprofile', { requireAuth: true })
          : await CompanyService.getCompanyAndSync(
              companyId,
              typeof update === 'function'
                ? // adapt NextAuth's UpdateSession signature (returns Promise<Session|null>) to our expected (void|Promise<void>)
                  (partial: Record<string, any>) =>
                    Promise.resolve(update(partial) as unknown as void)
                : undefined
            );

        // Map backend response to frontend Company shape
        const mapped: Company = {
          id: String(data.id),
          name: data.name || '',
          industry: data.industry || '',
          size: data.size || '',
          location: data.location || '',
          // Normalize user/contact info using helper
          ...(() => {
            const n = normalizeUser(data as any);
            return {
              email: n.email || (data as any).email || (data as any).contact || '',
              phone: n.tel || (data as any).tel || (data as any).phone || '',
            };
          })(),
          logoUrl: undefined, // Will be set after fetching blob
          bannerUrl: undefined, // Will be set after fetching blob
          about: data.overview || '',
          website: data.website || '',
        };

        // Fetch logo and banner as blobs and create object URLs
        if (data.logo_id != null) {
          try {
            const logoBlob = await CompanyService.fetchLogo(data.logo_id);
            const logoUrl = URL.createObjectURL(logoBlob);
            mapped.logoUrl = logoUrl;
          } catch (err) {
            console.warn('Failed to fetch company logo:', err);
          }
        }

        if (data.banner_id != null) {
          try {
            const bannerBlob = await CompanyService.fetchBanner(data.banner_id);
            const bannerUrl = URL.createObjectURL(bannerBlob);
            mapped.bannerUrl = bannerUrl;
          } catch (err) {
            console.warn('Failed to fetch company banner:', err);
          }
        }

        if (mounted) {
          setCompany(mapped);
        }

        // Use job_post from profile response (backend provides job_post on profile)
        try {
          const jobsArray = data.job_post;

          // Warn only if job_post field is missing entirely (not just empty)
          if (!('job_post' in data)) {
            console.warn('company.myprofile did not include job_post field; no jobs will be shown');
          }

          const jobs: JobOpening[] = (Array.isArray(jobsArray) ? jobsArray : []).map((j: any) => ({
            id: j.id,
            title: j.title || '',
            department: '',
            location: j.location || '',
            type: j.type || 'Full-time',
            applicationCount: j.applications?.length,
            imageUrl: undefined,
            description: j.desc,
            // convert req field (string) into an array of requirements
            requirements:
              typeof j.req === 'string' && j.req.length > 0
                ? j.req
                    .split(/\r?\n|,/)
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                : Array.isArray(j.req)
                  ? j.req
                  : [],
            salary: j.salary || undefined,
            tags: Array.isArray(j.tags) ? j.tags : [],
            expLevel: j.exp_lvl || undefined,
            expiring: j.expiring || undefined,
            companyId: j.company_id || undefined,
            rawApplications: Array.isArray(j.applications) ? j.applications : [],
            postedDate: j.post_time || '',
          }));

          if (mounted) setJobOpenings(jobs);
        } catch (jobsErr) {
          console.warn('Failed to map company job_post', jobsErr);
          if (mounted) setJobOpenings([]);
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
