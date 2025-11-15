import { useState } from 'react';
import { ApplicationService } from '@/lib/services';

interface ApplicationData {
  expectedSalary: string;
  programmingLanguages: string[];
  rightToWork: string;
  yearOfExperience: number;
  status?: string;
}

interface UseApplicationSubmitReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitApplication: (
    jobId: number,
    cpskId: string,
    resumeId: number,
    data: ApplicationData
  ) => Promise<boolean>;
}

export function useApplicationSubmit(): UseApplicationSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitApplication = async (
    jobId: number,
    cpskId: string,
    resumeId: number,
    data: ApplicationData
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await ApplicationService.submitApplication(jobId, cpskId, resumeId, data);
      return true;
    } catch (err) {
      console.error('Error submitting application:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitError, submitApplication };
}
