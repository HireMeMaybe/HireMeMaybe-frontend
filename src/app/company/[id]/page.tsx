// src/app/company/[id]/page.tsx
import { CompanyProfile } from '@/features/company-profile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

type ViewType = 'owner' | 'company' | 'cpsk';

interface CompanyProfilePageProps {
  readonly params: { id: string };
  readonly searchParams?: { view?: ViewType | string };
}

const VIEW_TYPES = {
  owner: true,
  company: true,
  cpsk: true,
} as const;

const isViewType = (value: unknown): value is ViewType =>
  typeof value === 'string' && value in VIEW_TYPES;

export default async function CompanyProfilePage({
  params,
  searchParams,
}: CompanyProfilePageProps) {
  const { id } = params;
  const rawView = searchParams?.view;
  const view = isViewType(rawView) ? rawView : undefined;
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
