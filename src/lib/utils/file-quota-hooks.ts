/**
 * File Quota Hook
 * ASVS V5.2.4: Client-side file quota management
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FileQuota, validateFileQuota, validateMultipleFilesQuota } from './file-quota';

export function useFileQuota() {
  const { data: session } = useSession();
  const [quota, setQuota] = useState<FileQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchQuota();
    }
  }, [session]);

  const fetchQuota = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/file-quota');
      if (response.ok) {
        const data = await response.json();
        setQuota(data.quota);
      }
    } catch (error) {
      console.error('Failed to fetch file quota:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if a single file can be uploaded
   */
  const canUploadFile = (file: File) => {
    if (!quota) return { isValid: false, error: 'Quota not loaded' };
    return validateFileQuota(file, quota);
  };

  /**
   * Check if multiple files can be uploaded
   */
  const canUploadFiles = (files: File[]) => {
    if (!quota) return { isValid: false, error: 'Quota not loaded' };
    return validateMultipleFilesQuota(files, quota);
  };

  /**
   * Update quota after successful upload
   */
  const updateQuotaAfterUpload = (uploadedSize: number) => {
    if (!quota) return;
    setQuota({
      ...quota,
      currentFiles: quota.currentFiles + 1,
      currentTotalSize: quota.currentTotalSize + uploadedSize,
    });
  };

  return {
    quota,
    isLoading,
    canUploadFile,
    canUploadFiles,
    updateQuotaAfterUpload,
    refreshQuota: fetchQuota,
  };
}
