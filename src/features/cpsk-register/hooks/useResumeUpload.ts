import { useState } from 'react';
import { UseFormSetValue, UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import { MAX_RESUME_SIZE } from '@/lib/validations/cpsk';

interface UseResumeUploadProps {
  setValue: UseFormSetValue<any>;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  watchedResume: File | undefined;
}

interface UseResumeUploadReturn {
  handleResumeChange: (file?: File | null) => void;
  getResumeDisplayText: () => string;
}

export function useResumeUpload({
  setValue,
  setError,
  clearErrors,
  watchedResume,
}: UseResumeUploadProps): UseResumeUploadReturn {
  const handleResumeChange = (file?: File | null) => {
    if (!file) {
      setValue('resume', undefined);
      clearErrors('resume');
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setValue('resume', undefined);
      setError('resume', { type: 'manual', message: 'Resume must be 10 MB or smaller' });
      return;
    }

    // valid
    clearErrors('resume');
    setValue('resume', file);
  };

  const getResumeDisplayText = (): string => {
    if (watchedResume && watchedResume.name) {
      return watchedResume.name;
    }
    return '';
  };

  return {
    handleResumeChange,
    getResumeDisplayText,
  };
}
