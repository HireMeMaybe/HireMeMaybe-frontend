import {
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
  Path,
  PathValue,
} from 'react-hook-form';
import { MAX_RESUME_SIZE } from '@/lib/validations/cpsk';

// Use a generic for form values to avoid explicit any
// Define form values with an optional `resume` key so literal 'resume' is accepted
interface FormValues {
  resume?: File | undefined;
  soft_skill?: string | string[] | undefined;
  [key: string]: unknown;
}

interface UseResumeUploadProps<T extends FormValues = FormValues> {
  setValue: UseFormSetValue<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  watchedResume: File | undefined;
}

interface UseResumeUploadReturn {
  handleResumeChange: (file?: File | null) => void;
  getResumeDisplayText: () => string;
}

export function useResumeUpload<T extends FormValues = FormValues>({
  setValue,
  setError,
  clearErrors,
  watchedResume,
}: UseResumeUploadProps<T>): UseResumeUploadReturn {
  const handleResumeChange = (file?: File | null) => {
    if (!file) {
      setValue('resume' as Path<T>, undefined as unknown as PathValue<T, Path<T>>);
      clearErrors('resume' as Path<T>);
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setValue('resume' as Path<T>, undefined as unknown as PathValue<T, Path<T>>);
      setError('resume' as Path<T>, { type: 'manual', message: 'Resume must be 10 MB or smaller' });
      return;
    }

    // valid
    clearErrors('resume' as Path<T>);
    setValue('resume' as Path<T>, file as unknown as PathValue<T, Path<T>>);
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
