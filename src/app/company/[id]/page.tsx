// src/app/company/[id]/page.tsx
import { CompanyProfile } from '@/features/company-profile';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

type ViewType = 'owner' | 'company' | 'cpsk';

type ViewSearchParams = { view?: string | string[] };

interface CompanyProfilePageProps {
  readonly params: Promise<{ id: string }>;
  readonly searchParams?: Promise<ViewSearchParams>;
}

const VIEW_TYPES = {
  owner: true,
  company: true,
  cpsk: true,
} as const;

const isViewType = (value: unknown): value is ViewType =>
  typeof value === 'string' && value in VIEW_TYPES;

const resolveView = async (
  searchParams?: Promise<ViewSearchParams>
): Promise<ViewType | undefined> => {
  if (!searchParams) return undefined;
  const { view } = await searchParams;
  const viewValue = Array.isArray(view) ? view[0] : view;
  return isViewType(viewValue) ? viewValue : undefined;
};

type SessionWithRole = Session & { role?: 'Company' | 'CPSK' | 'Visitor' };

export default async function CompanyProfilePage({
  params,
  searchParams,
}: CompanyProfilePageProps) {
  const { id } = await params;
  const view = await resolveView(searchParams);
  const session = await getServerSession(authOptions);
  const sessionWithRole = session as SessionWithRole | null;
  const userRole = sessionWithRole?.role ?? sessionWithRole?.backendUser?.role;

  // Determine viewType based on session only (no URL override)
  let viewType: ViewType = view || 'cpsk';

  if (sessionWithRole) {
    const backendUser = sessionWithRole.backendUser;

    // For Company users, the id in backendUser is their company ID
    const sessionCompanyId = backendUser?.id;
    const sessionUserId = backendUser?.User?.id;

    // Convert all to strings for comparison
    const urlIdStr = String(id);
    const isOwner = String(sessionCompanyId) === urlIdStr || String(sessionUserId) === urlIdStr;

    if (isOwner && userRole === 'Company') {
      viewType = 'owner';
    } else if (userRole === 'Company') {
      viewType = 'company';
    } else {
      viewType = 'cpsk';
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <CompanyProfile companyId={id} viewType={viewType} />
    </div>
  );
}
