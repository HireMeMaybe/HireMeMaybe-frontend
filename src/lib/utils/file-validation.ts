// File validation utilities for API endpoints

export interface FileValidationConfig {
  allowedTypes: readonly string[];
  allowedExtensions: readonly string[];
  maxSize: number;
  fieldName?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
}

// Common file validation configurations
export const FILE_CONFIGS = {
  RESUME: {
    allowedTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    fieldName: 'resume',
  },
  IMAGE: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    fieldName: 'image',
  },
} as const;

/**
 * Validates a file against specified criteria
 */
export function validateFile(
  file: File | null,
  config: FileValidationConfig
): FileValidationResult {
  // Check if file exists
  if (!file || !file.name) {
    return {
      isValid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size must be ${maxSizeMB}MB or smaller`,
    };
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    const typesList = config.allowedTypes.join(', ');
    return {
      isValid: false,
      error: `File type must be one of: ${typesList}`,
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!config.allowedExtensions.includes(extension)) {
    const extList = config.allowedExtensions.join(', ');
    return {
      isValid: false,
      error: `File extension must be one of: ${extList}`,
    };
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File appears to be empty',
    };
  }

  return {
    isValid: true,
    file,
  };
}

/**
 * Extracts and validates a file from FormData
 */
export function extractFileFromFormData(
  formData: FormData,
  config: FileValidationConfig
): FileValidationResult {
  const fieldName = config.fieldName || 'file';
  const file = formData.get(fieldName) as File | null;

  if (!file) {
    return {
      isValid: false,
      error: `No file found in form data. Field name should be "${fieldName}"`,
    };
  }

  return validateFile(file, config);
}

/**
 * Gets human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Type guard to check if a value is a File
 */
export function isFile(value: unknown): value is File {
  return value instanceof File;
}
