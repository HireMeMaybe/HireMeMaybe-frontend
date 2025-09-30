'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  JobApplicationHistory,
  HistoryFilters,
  HistoryProfile,
  Application,
  JobPost,
} from '@/types/history';

interface UseJobHistoryReturn {
  history: JobApplicationHistory[];
  loading: boolean;
  error: string | null;
  filters: HistoryFilters;
  setFilters: (filters: HistoryFilters) => void;
  refetch: () => Promise<void>;
}

// Function to fetch job post details by ID
const fetchJobPost = async (
  postId: number,
  onSessionExpired?: () => void
): Promise<JobPost | null> => {
  try {
    // This should be the endpoint to get job posts
    const response = await fetch(`/api/jobs/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 && onSessionExpired) {
        onSessionExpired();
        return null;
      }
      throw new Error(`Failed to fetch job post ${postId}`);
    }

    const jobPost: JobPost = await response.json();
    return jobPost;
  } catch (error) {
    console.error(`Error fetching job post ${postId}:`, error);

    // Fallback to mock data if API is not available
    const mockJobPosts: { [key: number]: JobPost } = {
      2: {
        id: 2,
        company_id: 'e4ee0c76-c583-4f52-8c70-c0f9848671c5',
        title: 'Vibecodeeeeeeeeeeeeeeeeeeeeeee',
        desc: 'Vibcoding',
        req: 'Using cursor',
        location: 'Online',
        type: 'Full-time',
        salary: '',
        tags: ['AI', 'Vibecode'],
        post_time: '2025-09-10T14:47:16.413377Z',
      },
      3: {
        id: 3,
        company_id: 'e4ee0c76-c583-4f52-8c70-c0f9848671c5',
        title: 'Ahhhh',
        desc: 'Vibcoding',
        req: 'Using cursor',
        location: 'Online',
        type: 'Full-time',
        salary: '',
        tags: ['AI', 'Vibecode'],
        post_time: '2025-09-10T14:47:27.577512Z',
      },
    };

    return mockJobPosts[postId] || null;
  }
};

// Function to get company name by company_id (you might need a separate API for this)
const getCompanyName = async (
  companyId: string,
  onSessionExpired?: () => void
): Promise<string> => {
  try {
    // This should be the endpoint to get company details
    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 && onSessionExpired) {
        onSessionExpired();
        return 'Unknown Company';
      }
      throw new Error(`Failed to fetch company ${companyId}`);
    }

    const company = await response.json();
    return company.name || 'Unknown Company';
  } catch (error) {
    console.error(`Error fetching company ${companyId}:`, error);

    // Fallback to mock company names
    const mockCompanies: { [key: string]: string } = {
      'e4ee0c76-c583-4f52-8c70-c0f9848671c5': 'VibeCode Tech',
    };

    return mockCompanies[companyId] || 'Unknown Company';
  }
};

// Function to transform application data to display format with real job details
const transformApplicationToHistory = async (
  application: Application,
  onSessionExpired?: () => void
): Promise<JobApplicationHistory> => {
  // Fetch job post details
  const jobPost = await fetchJobPost(application.post_id, onSessionExpired);

  if (jobPost) {
    // Fetch company name
    const companyName = await getCompanyName(jobPost.company_id, onSessionExpired);

    return {
      id: application.id,
      jobTitle: jobPost.title,
      companyName: companyName,
      location: jobPost.location,
      status: application.status,
      appliedDate: application.applied_at,
      lastUpdated: application.applied_at,
      jobType: jobPost.type,
      companyLogo: undefined, // Add company logo logic if available
      answer: application.answer,
      postId: application.post_id,
    };
  } else {
    // Fallback to mock data if job post fetch fails
    return {
      id: application.id,
      jobTitle: `Job Position #${application.post_id}`,
      companyName: 'Company Name',
      location: 'Location TBD',
      status: application.status,
      appliedDate: application.applied_at,
      lastUpdated: application.applied_at,
      jobType: 'Full-time',
      companyLogo: undefined,
      answer: application.answer,
      postId: application.post_id,
    };
  }
};

// Mock data for demonstration
const mockHistoryData: JobApplicationHistory[] = [
  {
    id: 1,
    jobTitle: 'Full Stack Developer',
    companyName: 'TechCorp Solutions',
    location: 'Bangkok, Thailand',
    status: 'pending',
    appliedDate: '2024-09-15T08:30:00Z',
    lastUpdated: '2024-09-15T08:30:00Z',
    jobType: 'Hybrid',
    answer: {
      id: 1,
      expected_salary: '50,000 - 70,000 THB',
      experience_level: 'Mid-level',
      tags: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    },
    postId: 1,
  },
  {
    id: 2,
    jobTitle: 'Frontend Developer',
    companyName: 'Digital Agency',
    location: 'Bangkok, Thailand',
    status: 'in consideration',
    appliedDate: '2024-09-12T14:20:00Z',
    lastUpdated: '2024-09-14T09:15:00Z',
    jobType: 'Remote',
    answer: {
      id: 2,
      expected_salary: '45,000 - 60,000 THB',
      experience_level: 'Junior',
      tags: ['React', 'Vue.js', 'CSS', 'HTML'],
    },
    postId: 2,
  },
  {
    id: 3,
    jobTitle: 'Backend Developer',
    companyName: 'StartupTech',
    location: 'Chiang Mai, Thailand',
    status: 'rejected',
    appliedDate: '2024-09-10T11:45:00Z',
    lastUpdated: '2024-09-13T16:30:00Z',
    jobType: 'Onsite',
    answer: {
      id: 3,
      expected_salary: '40,000 - 55,000 THB',
      experience_level: 'Junior',
      tags: ['Python', 'Django', 'PostgreSQL'],
    },
    postId: 3,
  },
  {
    id: 4,
    jobTitle: 'UI/UX Designer',
    companyName: 'Creative Studio',
    location: 'Bangkok, Thailand',
    status: 'pending',
    appliedDate: '2024-09-08T16:00:00Z',
    lastUpdated: '2024-09-08T16:00:00Z',
    jobType: 'Onsite',
    answer: {
      id: 4,
      expected_salary: '30,000 - 40,000 THB',
      experience_level: 'Junior',
      tags: ['Figma', 'Adobe XD', 'Sketch', 'UI Design'],
    },
    postId: 4,
  },
  {
    id: 5,
    jobTitle: 'DevOps Engineer',
    companyName: 'CloudTech',
    location: 'Bangkok, Thailand',
    status: 'in consideration',
    appliedDate: '2024-09-05T10:30:00Z',
    lastUpdated: '2024-09-11T14:20:00Z',
    jobType: 'Hybrid',
    answer: {
      id: 5,
      expected_salary: '60,000 - 80,000 THB',
      experience_level: 'Mid-level',
      tags: ['Docker', 'Kubernetes', 'AWS', 'Python'],
    },
    postId: 5,
  },
  {
    id: 6,
    jobTitle: 'Mobile Developer',
    companyName: 'AppWorks',
    location: 'Bangkok, Thailand',
    status: 'pending',
    appliedDate: '2024-09-03T13:15:00Z',
    lastUpdated: '2024-09-03T13:15:00Z',
    jobType: 'Remote',
    answer: {
      id: 6,
      expected_salary: '50,000 - 65,000 THB',
      experience_level: 'Mid-level',
      tags: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    },
    postId: 6,
  },
  {
    id: 7,
    jobTitle: 'Data Scientist',
    companyName: 'DataCorp',
    location: 'Bangkok, Thailand',
    status: 'rejected',
    appliedDate: '2024-09-01T09:00:00Z',
    lastUpdated: '2024-09-07T11:45:00Z',
    jobType: 'Onsite',
    answer: {
      id: 7,
      expected_salary: '70,000 - 90,000 THB',
      experience_level: 'Senior',
      tags: ['Python', 'R', 'SQL', 'TensorFlow'],
    },
    postId: 7,
  },
  {
    id: 8,
    jobTitle: 'Product Manager',
    companyName: 'InnovateTech',
    location: 'Bangkok, Thailand',
    status: 'in consideration',
    appliedDate: '2024-08-28T15:30:00Z',
    lastUpdated: '2024-09-09T10:20:00Z',
    jobType: 'Hybrid',
    answer: {
      id: 8,
      experience_level: 'Senior',
      tags: ['Product Strategy', 'Agile', 'Scrum', 'Analytics'],
    },
    postId: 8,
  },
];

export function useJobHistory(): UseJobHistoryReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<HistoryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    sortBy: 'appliedDate',
    sortOrder: 'desc',
  });

  // Handle session expiration
  const handleSessionExpiration = useCallback(async () => {
    console.log('Session expired, logging out...');
    await signOut({
      redirect: false,
      callbackUrl: '/',
    });
    router.push('/');
  }, [router]);

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for testing
      console.log('Using mock data for testing...');

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set mock history data directly
      setTransformedHistory(mockHistoryData);
    } catch (err) {
      console.error('Error with mock data:', err);
      setError('Failed to load mock application history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always fetch mock data regardless of authentication status for testing
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Transform and filter applications - using mock data directly
  const [transformedHistory, setTransformedHistory] = useState<JobApplicationHistory[]>([]);

  // Remove the transformation logic since we're using mock data directly
  // useEffect(() => {
  //   const transformApplications = async () => {
  //     if (profileData?.applications) {
  //       try {
  //         const transformed = await Promise.all(
  //           profileData.applications.map((app) =>
  //             transformApplicationToHistory(app, handleSessionExpiration)
  //           )
  //         );
  //         setTransformedHistory(transformed);
  //       } catch (error) {
  //         console.error('Error transforming applications:', error);
  //         setError('Failed to load job details');
  //       }
  //     }
  //   };

  //   transformApplications();
  // }, [profileData]);

  const filteredAndSortedHistory = transformedHistory
    .filter((item) => {
      if (filters.status && filters.status.length > 0) {
        return filters.status.includes(item.status);
      }
      return true;
    })
    .sort((a, b) => {
      const sortBy = filters.sortBy || 'appliedDate';
      const sortOrder = filters.sortOrder || 'desc';

      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortBy === 'appliedDate' || sortBy === 'lastUpdated') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

  return {
    history: filteredAndSortedHistory,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchHistoryData,
  };
}
