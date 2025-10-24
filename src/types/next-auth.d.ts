import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

interface BackendUser {
  id?: string | number;
  email?: string | null;
  // CPSK fields
  first_name?: string | null;
  last_name?: string | null;
  program?: string | null;
  year?: number | null;
  soft_skill?: string[];
  resume_id?: number | null;
  profile_picture?: string | null;
  // Company fields
  name?: string | null;
  overview?: string | null;
  industry?: string | null;
  size?: string | null;
  verified_status?: 'Unverified' | 'Pending' | 'Verified' | null;
  // Common fields
  role?: 'Company' | 'CPSK' | 'Visitor';
  raw?: unknown;
  company?:
    | {
        verified_status?: 'Unverified' | 'Pending' | 'Verified' | string | null;
        [key: string]: unknown;
      }
    | null;
  User?: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    tel?: string;
    email?: string;
    id?: string;
    username?: string;
    profile_picture?: string;
  };
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    backendToken?: string;
    backendUser?: BackendUser;
  }

  interface User extends DefaultUser {
    backendToken?: string;
    backendUser?: BackendUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    backendToken?: string;
    backendUser?: BackendUser;
    isRegistered?: boolean;
  }
}
