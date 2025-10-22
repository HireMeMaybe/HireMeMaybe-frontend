'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompanyProfile } from '../hooks/useCompanyProfile';
import CompanyHeader from './CompanyHeader';
import CompanyAbout from './CompanyAbout';
import JobOpenings from './JobOpenings';
import { Button } from '@/components/ui/button';
import { companyRegisterSchema, type CompanyRegisterFormData } from '@/lib/validations/company';
import type { CompanyProfileProps, Company } from '@/types/company';

export default function CompanyProfile({ companyId, viewType }: Readonly<CompanyProfileProps>) {
  const isOwner = viewType === 'owner';
  const {
    company: initialCompany,
    jobOpenings,
    isLoading,
    error,
  } = useCompanyProfile(companyId, isOwner);
  const [isPending, startTransition] = useTransition();

  const {
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      overview: '',
      industry: '',
      companySize: '',
    },
  });

  // Watch current form values to get the current company state
  const currentCompany = watch();

  // Create company object from form data
  const company: Company | null = initialCompany
    ? {
        ...initialCompany,
        name: currentCompany.companyName || initialCompany.name,
        email: currentCompany.email || initialCompany.email,
        phone: currentCompany.phone || initialCompany.phone,
        about: currentCompany.overview || initialCompany.about,
        industry: currentCompany.industry || initialCompany.industry,
        size: currentCompany.companySize || initialCompany.size,
      }
    : null;

  // Update form when initial company data loads
  useEffect(() => {
    if (initialCompany) {
      reset({
        companyName: initialCompany.name,
        email: initialCompany.email,
        phone: initialCompany.phone,
        overview: initialCompany.about,
        industry: initialCompany.industry,
        companySize: initialCompany.size,
      });
    }
  }, [initialCompany, reset]);

  const handleCompanyUpdate = (updatedCompany: Company) => {
    startTransition(async () => {
      try {
        // Update form values with new company data
        setValue('companyName', updatedCompany.name);
        setValue('email', updatedCompany.email);
        setValue('phone', updatedCompany.phone);
        setValue('overview', updatedCompany.about);
        setValue('industry', updatedCompany.industry);
        setValue('companySize', updatedCompany.size);

        // Clear any existing errors
        clearErrors();

        // Force a re-render by updating the initial company data
        // This ensures the header component reflects the new images
        Object.assign(initialCompany!, updatedCompany);
      } catch (error) {
        console.error('Error updating company:', error);
        setError('companyName', {
          message: 'Failed to update company data.',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary-green h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-text">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Company Not Found</h2>
          <p className="text-gray-text mb-4">
            {error || 'The company profile you are looking for does not exist.'}
          </p>
          {errors.companyName && (
            <p className="text-red-reject mb-4 flex items-center justify-center space-x-1 text-sm">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errors.companyName.message}</span>
            </p>
          )}
          <Button
            onClick={() => window.history.back()}
            className="bg-primary-green text-white hover:bg-green-700"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </div>
            ) : (
              'Go Back'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <CompanyHeader company={company} viewType={viewType} onCompanyUpdate={handleCompanyUpdate} />
      <CompanyAbout company={company} />
      <JobOpenings jobOpenings={jobOpenings} viewType={viewType} />
    </div>
  );
}
