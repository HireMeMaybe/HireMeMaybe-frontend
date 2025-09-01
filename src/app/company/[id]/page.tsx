// src/app/company/[id]/page.tsx
import { CompanyProfile } from "@/features/company-profile";

interface CompanyProfilePageProps {
  readonly params: {
    id: string;
  };
  readonly searchParams: {
    view?: 'student' | 'company';
  };
}

export default function CompanyProfilePage({ 
  params, 
  searchParams 
}: CompanyProfilePageProps) {
  const { id } = params;
  const view = searchParams.view || 'student';

  return (
    <div className="min-h-screen bg-background">
      <CompanyProfile companyId={id} viewType={view} />
    </div>
  );
}