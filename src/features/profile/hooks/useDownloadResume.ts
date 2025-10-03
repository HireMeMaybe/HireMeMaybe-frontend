import { useState, useCallback } from 'react';
import { CpskService } from '@/lib/services/cpsk.service';

interface UsePreviewResumeReturn {
  previewResume: () => Promise<void>;
  isDownloading: boolean;
  downloadError: string | null;
}

export function useDownloadResume(): UsePreviewResumeReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const previewResume = useCallback(async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Preview uses previewResume which will try to fetch the resume file id from profile if needed
      const blob = await CpskService.previewResume();

      // Force PDF MIME type so browsers render inline instead of forcing download
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Open preview in new tab using object URL
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      // Do not revoke immediately - let browser load it. Revoke after a short timeout.
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while previewing the resume.';
      setDownloadError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    previewResume,
    isDownloading,
    downloadError,
  };
}
