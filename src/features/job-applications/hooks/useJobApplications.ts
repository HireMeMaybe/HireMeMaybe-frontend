"use client";

import { useState, useEffect } from 'react';
import type { Application, JobApplicationsProps, ApplicationFilters } from '@/types/application';

// Mock data
// Mock data
const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1', // Matches job ID in useJobs
    candidateName: 'James Brucker',
    university: 'Kasetsart University',
    program: 'CPE',
    skills: ['Python', 'JavaScript', 'React'],
    appliedDate: '2025-09-10',
    status: 'pending',
    profilePicture: undefined,
    year: '3rd year',
    gpa: 3.75
  },
  {
    id: '2',
    jobId: '1', // Matches job ID in useJobs
    candidateName: 'Anna Smith',
    university: 'Kasetsart University',
    program: 'CPE',
    skills: ['Java', 'Spring Boot', 'SQL'],
    appliedDate: '2025-09-12',
    status: 'pending',
    profilePicture: undefined,
    year: '4th year',
    gpa: 3.9
  },
  {
    id: '3',
    jobId: '2', // Matches job ID in useJobs
    candidateName: 'Michael Tan',
    university: 'Kasetsart University',
    program: 'SKE',
    skills: ['C++', 'Python', 'Machine Learning'],
    appliedDate: '2025-09-14',
    status: 'pending',
    profilePicture: undefined,
    year: '2nd year',
    gpa: 3.6
  },
];

export function useJobApplications({ jobId }: Pick<JobApplicationsProps, 'jobId'>) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter applications by jobId
        const jobApplications = mockApplications.filter(app => app.jobId === jobId);
        setApplications(jobApplications);
        setFilteredApplications(jobApplications);
      } catch (err) {
        setError('Failed to load applications');
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...applications];

    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.program) {
      filtered = filtered.filter(app => app.program === filters.program);
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(app => 
        filters.skills!.some(skill => app.skills.includes(skill))
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.appliedDate);
            bValue = new Date(b.appliedDate);
            break;
          case 'name':
            aValue = a.candidateName.toLowerCase();
            bValue = b.candidateName.toLowerCase();
            break;
          case 'gpa':
            aValue = a.gpa || 0;
            bValue = b.gpa || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredApplications(filtered);
  }, [applications, filters]);

  const updateFilters = (newFilters: Partial<ApplicationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    applications: filteredApplications,
    totalApplications: applications.length,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-trigger the effect
    }
  };
}