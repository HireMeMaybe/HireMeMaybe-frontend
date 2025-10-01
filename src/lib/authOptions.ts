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

// Helper: Extract authorization code from account object
function getCodeFromAccount(acct: unknown): string | null {
  if (!acct || typeof acct !== 'object') return null;
  const a = acct as Record<string, unknown>;
  const tryParams = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return null;
    return (obj as Record<string, unknown>)['code'] as string | undefined | null;
  };
  return (
    (a['code'] as string | undefined) ||
    tryParams(a['params']) ||
    tryParams((a['oauthTokenRequest'] as Record<string, unknown> | undefined)?.['params']) ||
    null
  );
}

// Helper: Normalize backend user data structure
function normalizeBackendUser(dataUser: unknown): BackendUser {
  const user =
    dataUser && typeof dataUser === 'object' ? (dataUser as Record<string, unknown>) : null;
  const userObj = user as Record<string, unknown> | null;
  const UserField = userObj?.['User'] as Record<string, unknown> | undefined;

  return {
    id:
      (userObj?.['id'] as string | number | undefined) ??
      (UserField?.['id'] as string | number | undefined) ??
      undefined,
    email:
      (UserField?.['email'] as string | undefined) ??
      (userObj?.['email'] as string | undefined) ??
      null,
    // CPSK fields
    first_name: (userObj?.['first_name'] as string | undefined) ?? null,
    last_name: (userObj?.['last_name'] as string | undefined) ?? null,
    program: (userObj?.['program'] as string | undefined) ?? null,
    year: (userObj?.['year'] as number | undefined) ?? null,
    soft_skill: Array.isArray(userObj?.['soft_skill']) ? (userObj['soft_skill'] as string[]) : [],
    resume_id: (userObj?.['resume_id'] as number | undefined) ?? null,
    profile_picture: (UserField?.['profile_picture'] as string | undefined) ?? null,
    // Company fields
    name: (userObj?.['name'] as string | undefined) ?? null,
    overview: (userObj?.['overview'] as string | undefined) ?? null,
    industry: (userObj?.['industry'] as string | undefined) ?? null,
    size: (userObj?.['size'] as string | undefined) ?? null,
    verified_status:
      (userObj?.['verified_status'] as 'Unverified' | 'Pending' | 'Verified' | undefined) ?? null,
    // Determine role based on data structure or explicit role
    role:
      (userObj?.['role'] as 'Company' | 'CPSK' | 'Visitor' | undefined) ??
      (userObj?.['name'] !== undefined ? 'Company' : userObj?.['program'] ? 'CPSK' : 'Visitor'),
    raw: dataUser,
    User: UserField
      ? {
          ID: UserField['ID'] as number | undefined,
          CreatedAt: UserField['CreatedAt'] as string | undefined,
          UpdatedAt: UserField['UpdatedAt'] as string | undefined,
          DeletedAt: UserField['DeletedAt'] as string | null | undefined,
          tel: UserField['tel'] as string | undefined,
          email: UserField['email'] as string | undefined,
          id: UserField['id'] as string | undefined,
          username: UserField['username'] as string | undefined,
          profile_picture: UserField['profile_picture'] as string | undefined,
        }
      : undefined,
  };
}

// Helper: Store backend data in user session object
function storeUserDataInSession(user: unknown, data: unknown, normalized: BackendUser): void {
  if (user && typeof user === 'object') {
    const u = user as Record<string, unknown>;
    const d = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    u['backendToken'] = d['access_token'] || d['accessToken'] || d['token'];
    u['backendUser'] = normalized;
    u['isRegistered'] = !!(normalized.program || normalized.size);
  }
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
    async signIn({ account, user }) {
      if (account?.provider !== 'google') return true;

      try {
        const code = getCodeFromAccount(account);
        if (!code) {
          console.error('No authorization code found on account object — failing signIn', {
            account,
          });
          return false;
        }

        const backendEndpoint = `${process.env.BACKEND_URL}/auth/google/cpsk`;
        const res = await fetch(backendEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          console.error('Backend authentication failed:', res.status);
          return false;
        }

        const data = await res.json();
        const normalized = normalizeBackendUser(data.user);
        storeUserDataInSession(user, data, normalized);

        return true;
      } catch (error) {
        console.error('Error communicating with backend:', error);
        return false;
      }
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
      const backendUser = t['backendUser'] as BackendUser | undefined;
      s['accessToken'] = (t['accessToken'] as string | undefined) ?? undefined;
      s['backendToken'] = (t['backendToken'] as string | undefined) ?? undefined;
      s['backendUser'] = backendUser ?? undefined;
      // User is registered if they have program (CPSK) or name (Company)
      s['isRegistered'] = backendUser?.program || backendUser?.name ? true : false;
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
