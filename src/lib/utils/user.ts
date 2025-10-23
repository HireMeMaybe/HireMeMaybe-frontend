import type { BackendUser, BackendUserPascal } from '../../types/user';

export interface NormalizedUser {
  id?: string;
  email?: string;
  tel?: string;
  profile_picture?: string | null;
}

export function normalizeUser(user?: BackendUser | BackendUserPascal | null): NormalizedUser {
  if (!user) return {};

  const toRecord = (value: unknown): Record<string, unknown> | null =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

  const getValue = (value: unknown, path: string[]): unknown => {
    let current: unknown = value;
    for (const segment of path) {
      const asRecord = toRecord(current);
      if (!asRecord) return undefined;
      current = asRecord[segment];
    }
    return current;
  };

  const getFirstDefined = (...values: unknown[]): unknown =>
    values.find((val) => val !== undefined && val !== null);

  const id = getFirstDefined(
    getValue(user, ['id']),
    getValue(user, ['ID']),
    getValue(user, ['User', 'id']),
    getValue(user, ['User', 'ID']),
    getValue(user, ['user', 'id']),
    getValue(user, ['user', 'ID']),
    getValue(user, ['data', 'User', 'id']),
    getValue(user, ['data', 'user', 'id']),
    getValue(user, ['user', 'user', 'id']),
    getValue(user, ['user', 'user', 'ID'])
  ) as string | undefined;

  const email = getFirstDefined(
    getValue(user, ['email']),
    getValue(user, ['Email']),
    getValue(user, ['User', 'email']),
    getValue(user, ['user', 'email']),
    getValue(user, ['data', 'User', 'email']),
    getValue(user, ['data', 'user', 'email']),
    getValue(user, ['user', 'user', 'email']),
    getValue(user, ['contact'])
  ) as string | undefined;

  const tel = getFirstDefined(
    getValue(user, ['tel']),
    getValue(user, ['Tel']),
    getValue(user, ['phone']),
    getValue(user, ['User', 'tel']),
    getValue(user, ['user', 'tel']),
    getValue(user, ['data', 'User', 'tel']),
    getValue(user, ['data', 'user', 'tel']),
    getValue(user, ['user', 'user', 'tel'])
  ) as string | undefined;

  const profile_picture = getFirstDefined(
    getValue(user, ['profile_picture']),
    getValue(user, ['profilePicture']),
    getValue(user, ['profile_photo']),
    getValue(user, ['User', 'profile_picture']),
    getValue(user, ['user', 'profile_picture'])
  ) as string | null | undefined;

  return {
    id,
    email,
    tel,
    profile_picture: profile_picture ?? null,
  };
}

export default normalizeUser;

// Lightweight email validation — good enough for UI links
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// Lightweight phone validation: allow digits, spaces, dashes, parentheses and leading +
export function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  // Consider valid if at least 7 digits present
  return digits.length >= 7;
}
