/**
 * Utility functions for handling form data in a normalized way
 */

/**
 * Safely appends non-empty values to FormData
 */
export function appendIfPresent(
  formData: FormData,
  key: string,
  value: string | File | string[] | undefined | null
): void {
  if (value == null || value === '') return;

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item && item.trim() !== '') {
        formData.append(key, item.trim());
      }
    });
  } else {
    formData.append(key, value);
  }
}

/**
 * Creates FormData from an object with safe value handling
 */
export function createFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    appendIfPresent(formData, key, value as string | File | string[]);
  });

  return formData;
}

/**
 * Handles API response and updates form errors
 */
export interface ApiErrorResponse {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export function handleApiErrors(
  response: { ok: boolean; json: unknown },
  setError: (field: string, error: { message: string }) => void,
  setStatus: (status: { ok: boolean; message: string }) => void
): boolean {
  const { ok, json } = response;

  const safeMessage = (obj: unknown, fallback = 'Operation failed') => {
    if (!obj || typeof obj !== 'object') return fallback;
    return ((obj as Record<string, unknown>)['message'] as string | undefined) ?? fallback;
  };

  if (ok) {
    setStatus({ ok: true, message: safeMessage(json, 'Success') });
    return true;
  } else {
    setStatus({ ok: false, message: safeMessage(json, 'Operation failed') });

    if (json && typeof json === 'object') {
      const errorsField = (json as Record<string, unknown>)['errors'];
      if (Array.isArray(errorsField)) {
        const errs = errorsField as unknown[];
        errs.forEach((err) => {
          if (err && typeof err === 'object' && 'field' in (err as Record<string, unknown>)) {
            const r = err as { field?: string; message?: string };
            if (r.field) setError(r.field, { message: r.message ?? 'Error' });
          }
        });
      }
    }

    return false;
  }
}
