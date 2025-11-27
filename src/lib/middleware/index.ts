/**
 * Security Utilities Index
 * Export all ASVS-compliant security utilities
 */

// CSRF Protection (V3.5.1)
export {
  generateCsrfToken,
  validateCsrfToken,
  csrfMiddleware,
  getCsrfTokenFromRequest,
} from './csrf';

// File Validation (V5.2.2)
export {
  validateFile,
  extractFileFromFormData,
  formatFileSize,
  isFile,
  FILE_CONFIGS,
  type FileValidationConfig,
  type FileValidationResult,
} from '../utils/file-validation';

// URL Validation (V1.2.2)
export {
  validateUrlProtocol,
  encodeUrlParam,
  buildUrlWithParams,
  sanitizeUrl,
  isExternalUrl,
  type UrlValidationResult,
} from '../utils/url-validation';

// Regex Validation (V1.2.9)
export {
  escapeRegExp,
  createSafeRegExp,
  safeRegExpTest,
  validateRegexPattern,
  safeSearch,
  safeReplace,
} from '../utils/regex-validation';
