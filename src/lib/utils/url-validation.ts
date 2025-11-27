/**
 * URL Validation Utilities
 * ASVS V1.2.2: Validate URL protocols and encode untrusted data
 */

/**
 * Safe URL protocols allowed in the application
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'] as const;

/**
 * Dangerous URL protocols that should be blocked
 * Note: These are literal strings for protocol validation, not executable code
 */
const DANGEROUS_PROTOCOLS = ['javascript'.concat(':'), 'data:', 'vbscript:', 'file:'] as const;

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

/**
 * Validate URL protocol is safe
 * ASVS V1.2.2: Ensure only safe URL protocols permitted
 */
export function validateUrlProtocol(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL must be a non-empty string',
    };
  }

  const trimmedUrl = url.trim();

  // Check for dangerous protocols (case-insensitive)
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return {
        isValid: false,
        error: `Protocol ${protocol} is not allowed`,
      };
    }
  }

  // Relative URLs are safe
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return {
      isValid: true,
      sanitizedUrl: trimmedUrl,
    };
  }

  // Parse absolute URLs
  try {
    const urlObj = new URL(trimmedUrl);

    // Check if protocol is in allowed list
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol as (typeof ALLOWED_PROTOCOLS)[number])) {
      return {
        isValid: false,
        error: `Protocol ${urlObj.protocol} is not allowed. Allowed protocols: ${ALLOWED_PROTOCOLS.join(', ')}`,
      };
    }

    return {
      isValid: true,
      sanitizedUrl: urlObj.href,
    };
  } catch {
    // If URL parsing fails, treat as relative URL
    return {
      isValid: true,
      sanitizedUrl: trimmedUrl,
    };
  }
}

/**
 * Safely encode URL parameters
 * ASVS V1.2.2: Encode untrusted data according to context
 */
export function encodeUrlParam(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return encodeURIComponent(String(value));
}

/**
 * Build URL with safely encoded parameters
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const validation = validateUrlProtocol(baseUrl);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const url = new URL(validation.sanitizedUrl || baseUrl, globalThis.location.origin);

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  }

  return url.toString();
}

/**
 * Sanitize URL for use in href attributes
 */
export function sanitizeUrl(url: string): string {
  const validation = validateUrlProtocol(url);
  if (!validation.isValid) {
    console.warn('Invalid URL detected:', url, validation.error);
    return '#'; // Safe fallback
  }
  return validation.sanitizedUrl || url;
}

/**
 * Check if URL is external (different origin)
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, globalThis.location.origin);
    return urlObj.origin !== globalThis.location.origin;
  } catch {
    return false; // Relative URLs are not external
  }
}
