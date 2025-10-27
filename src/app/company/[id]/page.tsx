// src/app/company/[id]/page.tsx
import { CompanyProfile } from '@/features/company-profile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

type ViewType = 'owner' | 'company' | 'cpsk';

type ViewSearchParams = { view?: string };

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
  searchParams?: CompanyProfilePageProps['searchParams']
): Promise<ViewType | undefined> => {
  if (!searchParams) return undefined;
  const { view } = await searchParams;
  return isViewType(view) ? view : undefined;
};

export default async function CompanyProfilePage({
  params,
  searchParams,
}: CompanyProfilePageProps) {
  const { id } = await params;
  const view = await resolveView(searchParams);
  const session = await getServerSession(authOptions);

  // Determine viewType based on session and query param
  let viewType: ViewType = view || 'cpsk';

  // If no explicit view param, determine from session
  if (!view && session) {
    // Check if user is the owner of this company
    const isOwner = session.backendUser?.id === id;
    const userRole = session.backendUser?.role;

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
