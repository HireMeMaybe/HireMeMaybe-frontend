// File validation utilities for API endpoints

export interface FileValidationConfig {
  allowedTypes: readonly string[];
  allowedExtensions: readonly string[];
  maxSize: number;
  fieldName?: string;
  validateMagicBytes?: boolean; // Enable magic bytes validation
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
    validateMagicBytes: true,
  },
  IMAGE: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    fieldName: 'image',
    validateMagicBytes: true,
  },
} as const;

/**
 * Magic bytes (file signatures) for common file types
 * ASVS V5.2.2: Validate file content matches declared type
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [
    [0xff, 0xd8, 0xff, 0xe0], // JFIF
    [0xff, 0xd8, 0xff, 0xe1], // Exif
    [0xff, 0xd8, 0xff, 0xe2], // Canon
    [0xff, 0xd8, 0xff, 0xe3], // Samsung
  ],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (first 4 bytes)
};

/**
 * Read file header bytes for magic bytes validation
 */
async function readFileHeader(file: File, numBytes: number = 12): Promise<number[]> {
  try {
    const blob = file.slice(0, numBytes);
    const buffer = await blob.arrayBuffer();
    const arr = new Uint8Array(buffer);
    return Array.from(arr);
  } catch {
    throw new Error('Failed to read file');
  }
}

/**
 * Validate file magic bytes match declared type
 */
async function validateMagicBytes(file: File): Promise<boolean> {
  const signatures = FILE_SIGNATURES[file.type];
  if (!signatures) {
    // No signature defined for this type, skip validation
    return true;
  }

  try {
    const header = await readFileHeader(file);

    // Check if header matches any of the valid signatures
    return signatures.some((signature) => {
      return signature.every((byte, index) => header[index] === byte);
    });
  } catch {
    return false;
  }
}

/**
 * Validates a file against specified criteria
 * ASVS V5.2.2: Includes magic bytes validation
 */
export async function validateFile(
  file: File | null,
  config: FileValidationConfig
): Promise<FileValidationResult> {
  // Check if file exists
  if (!file?.name) {
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

  // ASVS V5.2.2: Validate magic bytes if enabled
  if (config.validateMagicBytes) {
    const magicBytesValid = await validateMagicBytes(file);
    if (!magicBytesValid) {
      return {
        isValid: false,
        error: 'File content does not match declared type',
      };
    }
  }

  return {
    isValid: true,
    file,
  };
}

/**
 * Extracts and validates a file from FormData
 */
export async function extractFileFromFormData(
  formData: FormData,
  config: FileValidationConfig
): Promise<FileValidationResult> {
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

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Type guard to check if a value is a File
 */
export function isFile(value: unknown): value is File {
  return value instanceof File;
}
