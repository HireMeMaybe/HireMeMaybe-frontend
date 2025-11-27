import {
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
  Path,
  PathValue,
} from 'react-hook-form';
import { MAX_RESUME_SIZE } from '@/lib/validations/cpsk';
import { validateFile, FILE_CONFIGS } from '@/lib/utils/file-validation';

// Minimal required shape for the hook
interface FormValuesBase {
  resume?: File;
  soft_skill?: string | string[];
}

interface UseResumeUploadProps<T extends FormValuesBase> {
  setValue: UseFormSetValue<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  watchedResume: File | undefined;
}

interface UseResumeUploadReturn {
  handleResumeChange: (file?: File | null) => Promise<void>;
  getResumeDisplayText: () => string;
}

export function useResumeUpload<T extends FormValuesBase>({
  setValue,
  setError,
  clearErrors,
  watchedResume,
}: UseResumeUploadProps<T>): UseResumeUploadReturn {
  const handleResumeChange = async (file?: File | null) => {
    if (!file) {
      setValue('resume' as Path<T>, undefined as unknown as PathValue<T, Path<T>>);
      clearErrors('resume' as Path<T>);
      return;
    }

    // ASVS V5.2.2 & V5.2.4: Validate file with magic bytes check
    const validation = await validateFile(file, FILE_CONFIGS.RESUME);
    if (!validation.isValid) {
      setValue('resume' as Path<T>, undefined as unknown as PathValue<T, Path<T>>);
      setError('resume' as Path<T>, {
        type: 'manual',
        message: validation.error || 'Invalid file',
      });
      return;
    }

    // Legacy size check (belt and suspenders with validation)
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
