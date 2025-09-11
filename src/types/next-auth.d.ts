import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

interface BackendUser {
  id?: string | number;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  program?: string | null;
  year?: number | null;
  soft_skill?: string[];
  resume_id?: number | null;
  profile_picture?: string | null;
  raw?: unknown;
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
