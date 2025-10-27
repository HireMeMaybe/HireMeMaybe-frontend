// src/app/company/[id]/page.tsx
import { CompanyProfile } from '@/features/company-profile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

interface CompanyProfilePageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Determine viewType based on session only (no URL override)
  let viewType: 'owner' | 'company' | 'cpsk' = 'cpsk';

  if (session) {
    const userRole = (session as any).role; // Role is now at top level
    const backendUser = session.backendUser;

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
