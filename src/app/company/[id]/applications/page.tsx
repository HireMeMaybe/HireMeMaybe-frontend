// src/app/company/[id]/applications/page.tsx
import { AllApplications } from '@/features/job-applications';

interface AllApplicationsPageProps {
  readonly params: Promise<{
    id: string; // company ID
  }>;
}

export default async function AllApplicationsPage({ params }: AllApplicationsPageProps) {
  const { id } = await params;

  return (
    <div className="bg-background min-h-screen">
      <AllApplications companyId={id} />
    </div>
  );
}
