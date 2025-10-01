import { useState } from 'react';
import type { ApplicationFormData } from '@/types/application';

interface UseApplicationSubmitReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitApplication: (data: ApplicationFormData) => Promise<boolean>;
}

export function useApplicationSubmit(): UseApplicationSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitApplication = async (data: ApplicationFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('surname', data.surname);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('major', data.major);
      formData.append('educationLevel', data.educationLevel);
      
      if (data.resume) {
        formData.append('resume', data.resume);
      }
      
      if (data.softSkills && data.softSkills.length > 0) {
        data.softSkills.forEach((skill) => {
          formData.append('softSkills', skill);
        });
      }
      
      if (data.questions && data.questions.length > 0) {
        formData.append('questions', JSON.stringify(data.questions));
      }

      // Replace with actual API endpoint when backend is ready
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

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