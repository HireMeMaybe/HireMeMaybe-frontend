import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// ASVS V3.7.2: Allowed redirect hostnames
const ALLOWED_REDIRECT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'accounts.google.com', // OAuth provider
  'canyouhireme.vercel.app', // Production domain
]);

// Small interface to represent the normalized backend user shape we store in the
// NextAuth user / JWT / session objects.
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
  raw?: unknown; // keep original backend payload for debugging / future migration
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

const isProd = process.env.NODE_ENV === 'production';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
  providers: [
    // Credentials provider allows creating a NextAuth session from a backend-issued token
    CredentialsProvider({
      name: 'Backend',
      credentials: {
        token: { label: 'Token', type: 'text' },
        user: { label: 'User', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        try {
          const backendUser = credentials.user
            ? JSON.parse(credentials.user)
            : (null as unknown as Record<string, unknown> | null);

          // Extract email from common backend shapes (defensive, typed)
          const extractEmail = (u: Record<string, unknown> | null): string | null => {
            if (!u) return null;
            const maybe =
              (u['email'] as string | undefined) ||
              ((u['User'] as Record<string, unknown> | undefined)?.['email'] as
                | string
                | undefined) ||
              ((u['user'] as Record<string, unknown> | undefined)?.['email'] as
                | string
                | undefined) ||
              (u['emailAddress'] as string | undefined) ||
              (u['email_address'] as string | undefined) ||
              null;
            return maybe ?? null;
          };

          const email = extractEmail(backendUser)?.toString() ?? null;

          return {
            backendToken: credentials.token,
            backendUser,
            id: backendUser?.id ?? undefined,
            email: email ?? undefined,
          };
        } catch (err) {
          console.error('Failed to parse backend user in credentials.authorize', err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth/error',
  },
  cookies: {
    sessionToken: {
      name: isProd ? '__Host-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
    callbackUrl: {
      name: isProd ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
    csrfToken: {
      name: isProd ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user, trigger, session: updatedSession }) {
      // On initial sign-in, store backend data
      if (user && typeof user === 'object') {
        const u = user as unknown as Record<string, unknown>;
        const backendUser = u['backendUser'] as BackendUser | undefined;

        token.accessToken = account?.access_token;
        token.backendToken = (u['backendToken'] as string | undefined) ?? undefined;
        token.backendUser = backendUser ?? undefined;
        token.isRegistered = (u['isRegistered'] as boolean | undefined) ?? undefined;
        token.role = backendUser?.role ?? undefined;
      }

      // Handle session updates (when updateSession is called)
      if (trigger === 'update' && updatedSession) {
        const updateData = updatedSession as Record<string, unknown>;
        // Merge updated backendUser data
        if (updateData['backendUser']) {
          const updatedBackendUser = updateData['backendUser'] as BackendUser;
          token.backendUser = {
            ...(token.backendUser as BackendUser | undefined),
            ...updatedBackendUser,
          };
          // Update role if present in backendUser
          if (updatedBackendUser.role) {
            token.role = updatedBackendUser.role;
          }
        }
        // Update isRegistered flag if explicitly set
        if (typeof updateData['isRegistered'] === 'boolean') {
          token.isRegistered = updateData['isRegistered'];
        }
        // Update role if explicitly set
        if (updateData['role']) {
          token.role = updateData['role'] as 'Company' | 'CPSK' | 'Visitor';
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      const s = session as unknown as Record<string, unknown>;
      const t = token as unknown as Record<string, unknown>;
      const backendUser = t['backendUser'] as BackendUser | undefined;
      s['accessToken'] = (t['accessToken'] as string | undefined) ?? undefined;
      s['backendToken'] = (t['backendToken'] as string | undefined) ?? undefined;
      s['backendUser'] = backendUser ?? undefined;

      // Set role at top level from token
      s['role'] =
        (t['role'] as 'Company' | 'CPSK' | 'Visitor' | undefined) ?? backendUser?.role ?? undefined;

      // Use explicit isRegistered from token if set, otherwise calculate from user data
      const explicitIsRegistered = t['isRegistered'] as boolean | undefined;
      if (typeof explicitIsRegistered === 'boolean') {
        s['isRegistered'] = explicitIsRegistered;
      } else {
        // Fallback: User is registered if they have program (CPSK) or name (Company) or role is Visitor
        s['isRegistered'] = Boolean(
          backendUser?.role === 'Visitor' || backendUser?.program || backendUser?.name
        );
      }

      return s as unknown as typeof session;
    },
    async redirect({ url, baseUrl }) {
      // ASVS V3.7.2: Validate redirect URL against allowlist
      const urlObj = new URL(url.startsWith('/') ? `${baseUrl}${url}` : url);

      // Check if hostname is in allowlist
      const isAllowedHost = ALLOWED_REDIRECT_HOSTS.has(urlObj.hostname);
      if (!isAllowedHost && urlObj.origin !== baseUrl) {
        console.warn('Redirect to untrusted host blocked:', urlObj.hostname);
        return baseUrl;
      }

      // Custom redirect logic based on registration status
      // If user is not registered, redirect to registration
      if (urlObj.searchParams.get('isRegistered') === 'false') {
        return `${baseUrl}/cpsk-register`;
      }

      // If user is registered, redirect to profile
      if (urlObj.searchParams.get('isRegistered') === 'true') {
        return `${baseUrl}/profile`;
      }

      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin or allowlisted hosts
      if (new URL(url).origin === baseUrl || isAllowedHost) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 60 * 60,
  },
};

export default authOptions;
