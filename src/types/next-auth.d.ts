import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    backendToken?: string;
    backendUser?: any;
    isRegistered?: boolean;
  }

  interface User extends DefaultUser {
    backendToken?: string;
    backendUser?: any;
    isRegistered?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    backendToken?: string;
    backendUser?: any;
    isRegistered?: boolean;
  }
}
