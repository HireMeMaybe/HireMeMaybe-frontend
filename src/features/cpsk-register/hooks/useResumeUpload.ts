import {
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
  Path,
  PathValue,
} from 'react-hook-form';
import { MAX_RESUME_SIZE } from '@/lib/validations/cpsk';

// Minimal required shape for the hook
interface FormValuesBase {
  resume?: File | undefined;
  soft_skill?: string | string[] | undefined;
}

interface UseResumeUploadProps<T extends FormValuesBase> {
  setValue: UseFormSetValue<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  watchedResume: File | undefined;
}

interface UseResumeUploadReturn {
  handleResumeChange: (file?: File | null) => void;
  getResumeDisplayText: () => string;
}

export function useResumeUpload<T extends FormValuesBase>({
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

    clearErrors('resume' as Path<T>);
    setValue('resume' as Path<T>, file as unknown as PathValue<T, Path<T>>);
  };

  const getResumeDisplayText = (): string => {
    if (watchedResume?.name) return watchedResume.name;
    return '';
  };

  return {
    handleResumeChange,
    getResumeDisplayText,
  };
}
