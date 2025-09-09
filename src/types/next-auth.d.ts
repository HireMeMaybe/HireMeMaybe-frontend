import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    backendToken?: string;
    backendUser?: unknown;
    isRegistered?: boolean;
  }

  interface User extends DefaultUser {
    backendToken?: string;
    backendUser?: unknown;
    isRegistered?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    backendToken?: string;
    backendUser?: unknown;
    isRegistered?: boolean;
  }
}
