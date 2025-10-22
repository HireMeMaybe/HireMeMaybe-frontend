import type { BackendUser, BackendUserPascal } from '../../types/user';

export interface NormalizedUser {
  id?: string;
  email?: string;
  tel?: string;
  profile_picture?: string | null;
}

export function normalizeUser(user?: BackendUser | BackendUserPascal | null): NormalizedUser {
  if (!user) return {};

  // Handle both camelCase and PascalCase shapes, and also containers like { User: {...} } or { user: {...} }
  let maybeAny: any = user as any;

  // Unwrap common wrappers
  if (
    maybeAny.User &&
    (maybeAny.User.email || maybeAny.User.tel || maybeAny.User.ID || maybeAny.User.id)
  ) {
    maybeAny = maybeAny.User;
  } else if (
    maybeAny.user &&
    (maybeAny.user.email || maybeAny.user.tel || maybeAny.user.ID || maybeAny.user.id)
  ) {
    maybeAny = maybeAny.user;
  } else if (maybeAny.data && (maybeAny.data.User || maybeAny.data.user)) {
    maybeAny = maybeAny.data.User || maybeAny.data.user;
  }

  // Also if the passed object contains an inner 'user' again (some endpoints nest twice)
  if (maybeAny.user && (maybeAny.user.email || maybeAny.user.tel)) {
    maybeAny = maybeAny.user;
  }

  // Extract common fields with fallbacks
  const id =
    maybeAny.id ||
    maybeAny.ID ||
    (maybeAny.user && (maybeAny.user.id || maybeAny.user.ID)) ||
    undefined;
  const email =
    maybeAny.email ||
    maybeAny.Email ||
    maybeAny.user?.email ||
    maybeAny.User?.email ||
    maybeAny.contact ||
    undefined;
  const tel =
    maybeAny.tel ||
    maybeAny.Tel ||
    maybeAny.phone ||
    maybeAny.user?.tel ||
    maybeAny.User?.tel ||
    undefined;
  const profile_picture =
    maybeAny.profile_picture ?? maybeAny.profilePicture ?? maybeAny.profile_photo ?? null;

  return {
    id,
    email,
    tel,
    profile_picture,
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
