import { useState } from 'react';

interface UseDownloadResumeReturn {
  downloadResume: (resumeId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useDownloadResume(): UseDownloadResumeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadResume = async (resumeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/file/resume/${resumeId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Resume file not found.');
        } else {
          throw new Error('Failed to download resume. Please try again.');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${resumeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while downloading the resume.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    downloadResume,
    loading,
    error,
  };
}
