import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthOptions } from 'next-auth';

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
  callbacks: {
    async jwt({ token, account, user, trigger, session: updatedSession }) {
      // On initial sign-in, store backend data
      if (user && typeof user === 'object') {
        const u = user as unknown as Record<string, unknown>;
        token.accessToken = account?.access_token;
        token.backendToken = (u['backendToken'] as string | undefined) ?? undefined;
        token.backendUser = (u['backendUser'] as BackendUser | undefined) ?? undefined;
        token.isRegistered = (u['isRegistered'] as boolean | undefined) ?? undefined;
      }

      // Handle session updates (when updateSession is called)
      if (trigger === 'update' && updatedSession) {
        const updateData = updatedSession as Record<string, unknown>;
        // Merge updated backendUser data
        if (updateData['backendUser']) {
          token.backendUser = {
            ...(token.backendUser as BackendUser | undefined),
            ...(updateData['backendUser'] as BackendUser),
          };
        }
        // Update isRegistered flag if explicitly set
        if (typeof updateData['isRegistered'] === 'boolean') {
          token.isRegistered = updateData['isRegistered'];
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

      // Use explicit isRegistered from token if set, otherwise calculate from user data
      const explicitIsRegistered = t['isRegistered'] as boolean | undefined;
      if (typeof explicitIsRegistered === 'boolean') {
        s['isRegistered'] = explicitIsRegistered;
      } else {
        // Fallback: User is registered if they have program (CPSK) or name (Company) or role is Visitor
        s['isRegistered'] =
          backendUser?.role === 'Visitor' || backendUser?.program || backendUser?.name
            ? true
            : false;
      }

      return s as unknown as typeof session;
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic based on registration status
      const urlObj = new URL(url.startsWith('/') ? `${baseUrl}${url}` : url);

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
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 60 * 60,
  },
};

export default authOptions;
