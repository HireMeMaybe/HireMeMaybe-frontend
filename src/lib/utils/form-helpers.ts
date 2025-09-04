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

export function handleApiErrors<T>(
  response: { ok: boolean; json: any },
  setError: (field: string, error: { message: string }) => void,
  setStatus: (status: { ok: boolean; message: string }) => void
): boolean {
  const { ok, json } = response;

  if (ok) {
    setStatus({ ok: true, message: json.message || 'Success' });
    return true;
  } else {
    setStatus({ ok: false, message: json.message || 'Operation failed' });

    if (json.errors && Array.isArray(json.errors)) {
      json.errors.forEach((err: { field: string; message: string }) => {
        if (err.field) {
          setError(err.field, { message: err.message });
        }
      });
    }

    return false;
  }
}
