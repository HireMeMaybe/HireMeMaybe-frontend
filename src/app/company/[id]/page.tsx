// src/app/company/[id]/page.tsx
import { CompanyProfile } from "@/features/company-profile";

interface CompanyProfilePageProps {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{ view?: "student" | "company" }>;
}

export default async function CompanyProfilePage({ params, searchParams }: CompanyProfilePageProps) {
  const { id } = await params;
  const { view } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <CompanyProfile companyId={id} viewType={view || "student"} />
    </div>
  );
}
