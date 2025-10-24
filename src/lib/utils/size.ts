/**
 * Size mapping utilities
 * Centralize mapping between frontend display values and backend enum values
 */

export const FRONTEND_TO_BACKEND_SIZE: Record<string, string> = {
  '1-10 employees': 'XS',
  '11-50 employees': 'S',
  '51-200 employees': 'M',
  '201-500 employees': 'L',
  '501-1000 employees': 'XL',
};

// Human-friendly display version for backend enum values (if needed)
export const BACKEND_TO_DISPLAY_SIZE: Record<string, string> = {
  XS: '1-10 employees',
  S: '11-50 employees',
  M: '51-200 employees',
  L: '201-500 employees',
  XL: '501-1000 employees',
};

export function mapFrontendToBackend(size?: string) {
  if (!size) return undefined;
  // Strict mapping: only exact frontend keys (e.g. '1-10 employees') are accepted
  return FRONTEND_TO_BACKEND_SIZE[size] ?? undefined;
}

export function mapBackendToDisplay(size?: string) {
  if (!size) return '';
  return BACKEND_TO_DISPLAY_SIZE[size] ?? size;
}
