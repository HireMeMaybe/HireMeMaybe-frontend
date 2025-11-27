/**
 * File Quota Tracking
 * ASVS V5.2.4: File size quota and max files per user enforced
 */

export interface FileQuota {
  maxFiles: number;
  maxTotalSize: number; // in bytes
  currentFiles: number;
  currentTotalSize: number;
}

export interface QuotaValidationResult {
  isValid: boolean;
  error?: string;
  quota?: FileQuota;
}

/**
 * Default quota configurations per user role
 */
export const DEFAULT_QUOTAS = {
  CPSK: {
    maxFiles: 10, // Max 10 files (resume + portfolio items)
    maxTotalSize: 50 * 1024 * 1024, // 50MB total
  },
  Company: {
    maxFiles: 20, // Max 20 files (company images, documents)
    maxTotalSize: 100 * 1024 * 1024, // 100MB total
  },
  Visitor: {
    maxFiles: 0,
    maxTotalSize: 0,
  },
} as const;

/**
 * Get user's current file quota from backend
 * This should be called from an API route that queries the backend
 */
export async function getUserFileQuota(
  userId: string,
  role: 'CPSK' | 'Company' | 'Visitor'
): Promise<FileQuota> {
  // In production, this should query the backend API
  // For now, return default values
  const defaults = DEFAULT_QUOTAS[role];

  return {
    maxFiles: defaults.maxFiles,
    maxTotalSize: defaults.maxTotalSize,
    currentFiles: 0, // Should be fetched from backend
    currentTotalSize: 0, // Should be fetched from backend
  };
}

/**
 * Validate if user can upload a new file based on quota
 */
export function validateFileQuota(file: File, quota: FileQuota): QuotaValidationResult {
  // Check file count limit
  if (quota.currentFiles >= quota.maxFiles) {
    return {
      isValid: false,
      error: `Maximum number of files (${quota.maxFiles}) reached`,
      quota,
    };
  }

  // Check total size limit
  const newTotalSize = quota.currentTotalSize + file.size;
  if (newTotalSize > quota.maxTotalSize) {
    const maxSizeMB = quota.maxTotalSize / (1024 * 1024);
    const currentSizeMB = quota.currentTotalSize / (1024 * 1024);
    return {
      isValid: false,
      error: `Total file storage limit exceeded. Current: ${currentSizeMB.toFixed(2)}MB, Maximum: ${maxSizeMB}MB`,
      quota,
    };
  }

  return {
    isValid: true,
    quota: {
      ...quota,
      currentFiles: quota.currentFiles + 1,
      currentTotalSize: newTotalSize,
    },
  };
}

/**
 * Validate multiple files against quota
 */
export function validateMultipleFilesQuota(files: File[], quota: FileQuota): QuotaValidationResult {
  const totalNewSize = files.reduce((sum, file) => sum + file.size, 0);
  const newFileCount = quota.currentFiles + files.length;
  const newTotalSize = quota.currentTotalSize + totalNewSize;

  // Check file count limit
  if (newFileCount > quota.maxFiles) {
    return {
      isValid: false,
      error: `Cannot upload ${files.length} files. Maximum allowed: ${quota.maxFiles}, Current: ${quota.currentFiles}`,
      quota,
    };
  }

  // Check total size limit
  if (newTotalSize > quota.maxTotalSize) {
    const maxSizeMB = quota.maxTotalSize / (1024 * 1024);
    const currentSizeMB = quota.currentTotalSize / (1024 * 1024);
    return {
      isValid: false,
      error: `Total file storage limit exceeded. Current: ${currentSizeMB.toFixed(2)}MB, Maximum: ${maxSizeMB}MB`,
      quota,
    };
  }

  return {
    isValid: true,
    quota: {
      ...quota,
      currentFiles: newFileCount,
      currentTotalSize: newTotalSize,
    },
  };
}

/**
 * Format quota information for display
 */
export function formatQuotaInfo(quota: FileQuota): string {
  const currentSizeMB = (quota.currentTotalSize / (1024 * 1024)).toFixed(2);
  const maxSizeMB = (quota.maxTotalSize / (1024 * 1024)).toFixed(2);

  return `Files: ${quota.currentFiles}/${quota.maxFiles} | Storage: ${currentSizeMB}MB/${maxSizeMB}MB`;
}
