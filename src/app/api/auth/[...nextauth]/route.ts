import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

// Small interface to represent the normalized backend user shape we store in the
// NextAuth user / JWT / session objects.
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
  raw?: unknown; // keep original backend payload for debugging / future migration
}

const handler = NextAuth({
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

          // Enforce university domain
          if (!email || !email.toLowerCase().endsWith('@ku.th')) {
            console.warn(
              'Credentials.authorize rejected login due to invalid email domain:',
              email
            );
            return null; // Reject sign-in if domain is not allowed
          }

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
    async signIn({ account, user }) {
      if (account?.provider === 'google') {
        try {
          // Try to locate the raw authorization code in common places
          const getCodeFromAccount = (acct: unknown): string | null => {
            if (!acct || typeof acct !== 'object') return null;
            const a = acct as Record<string, unknown>;
            const tryParams = (obj: unknown) => {
              if (!obj || typeof obj !== 'object') return null;
              return (obj as Record<string, unknown>)['code'] as string | undefined | null;
            };
            return (
              (a['code'] as string | undefined) ||
              tryParams(a['params']) ||
              tryParams(
                (a['oauthTokenRequest'] as Record<string, unknown> | undefined)?.['params']
              ) ||
              null
            );
          };

          const code = getCodeFromAccount(account);

          if (!code) {
            console.error('No authorization code found on account object — failing signIn', {
              account,
            });
            return false; // Backend requires raw code for exchange
          }

          const res = await fetch(`${process.env.BACKEND_URL}/auth/google/cpsk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!res.ok) {
            console.error('Backend authentication failed:', res.status);
            return false; // This will prevent the sign-in
          }

          const data = await res.json();

          // Normalize backend user shape to a predictable object we can persist
          const normalized: BackendUser = {
            id: data.user?.id ?? data.user?.User?.id,
            email: data.user?.User?.email ?? data.user?.email ?? null,
            firstName: data.user?.first_name ?? null,
            lastName: data.user?.last_name ?? null,
            program: data.user?.program ?? null,
            year: data.user?.year ?? null,
            soft_skill: Array.isArray(data.user?.soft_skill) ? data.user.soft_skill : [],
            resume_id: data.user?.resume_id ?? null,
            profile_picture: data.user?.User?.profile_picture ?? null,
            raw: data.user,
          };

          // Store backend response data for use in jwt callback (guarded assignments)
          if (user && typeof user === 'object') {
            const u = user as unknown as Record<string, unknown>;
            u['backendToken'] = data.access_token || data.accessToken || data.token;
            u['backendUser'] = normalized;
            u['isRegistered'] = !!normalized.program;
          }

          return true;
        } catch (error) {
          console.error('Error communicating with backend:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      // On initial sign-in, store backend data
      if (user && typeof user === 'object') {
        const u = user as unknown as Record<string, unknown>;
        token.accessToken = account?.access_token;
        token.backendToken = (u['backendToken'] as string | undefined) ?? undefined;
        token.backendUser = (u['backendUser'] as BackendUser | undefined) ?? undefined;
        token.isRegistered = (u['isRegistered'] as boolean | undefined) ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      const s = session as unknown as Record<string, unknown>;
      const t = token as unknown as Record<string, unknown>;
      s['accessToken'] = (t['accessToken'] as string | undefined) ?? undefined;
      s['backendToken'] = (t['backendToken'] as string | undefined) ?? undefined;
      s['backendUser'] = (t['backendUser'] as BackendUser | undefined) ?? undefined;
      s['isRegistered'] = (t['isRegistered'] as boolean | undefined) ?? undefined;
      return s as unknown as typeof session;
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic based on registration status
      const urlObj = new URL(url.startsWith('/') ? `${baseUrl}${url}` : url);

      // If user is not registered, redirect to registration
      if (urlObj.searchParams.get('isRegistered') === 'false') {
        return `${baseUrl}/cpsk-register`;
      }

      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
