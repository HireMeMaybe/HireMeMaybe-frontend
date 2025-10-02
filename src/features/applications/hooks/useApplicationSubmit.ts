import { useState } from 'react';
import { ApplicationService } from '@/lib/services';
import type { ApplicationFormData } from '@/types/application';

interface UseApplicationSubmitReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitApplication: (jobId: string, data: ApplicationFormData) => Promise<boolean>;
}

export function useApplicationSubmit(): UseApplicationSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitApplication = async (jobId: string, data: ApplicationFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await ApplicationService.submitApplication(jobId, data);
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
