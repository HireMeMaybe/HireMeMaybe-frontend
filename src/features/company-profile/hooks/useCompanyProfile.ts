// src/features/company-profile/hooks/useCompanyProfile.ts
"use client";

import { useState, useEffect } from 'react';
import type { Company, JobOpening } from '@/types/company';

// Mock data - replace with actual API calls
const mockCompany: Company = {
  id: 'tech-innovators',
  name: 'Tech Innovators Inc.',
  industry: 'Software Development',
  employeeCount: '500-1000 employees',
  location: 'New York, NY',
  email: 'contact@techinnovators.com',
  phone: '+1 (555) 123-4567',
  logoUrl: 'https://media.discordapp.net/attachments/1155455806628704307/1411997184089653262/image.png?ex=68b6b05a&is=68b55eda&hm=b5b122796ff94c0a188dbc8d687722da9f3409f34f77377152ae4a3eb0f0a0e0&=&format=webp&quality=lossless',
  bannerUrl: '/api/placeholder/company-banner',
  about: 'Tech Innovators Inc. is a leading software development company specializing in innovative solutions for businesses across various industries. Our mission is to empower organizations with cutting-edge technology that drives growth and efficiency. We foster a collaborative and inclusive work environment where creativity and innovation thrive. Our core values include integrity, excellence, and a commitment to continuous learning and development.',
  website: 'https://techinnovators.com'
};

const mockJobOpenings: JobOpening[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'Full-time',
    applicationCount: 12,
    imageUrl: '/api/placeholder/job-1',
    postedDate: '2025-08-25'
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY', 
    type: 'Full-time',
    applicationCount: 8,
    imageUrl: '/api/placeholder/job-2',
    postedDate: '2025-08-20'
  }
];

export function useCompanyProfile(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real implementation, replace with:
        // const response = await fetch(`/api/companies/${companyId}`);
        // const companyData = await response.json();
        
        setCompany(mockCompany);
        setJobOpenings(mockJobOpenings);
      } catch (err) {
        setError('Failed to load company profile');
        console.error('Error fetching company profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [companyId]);

  return {
    company,
    jobOpenings,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-trigger the effect
    }
  };
}