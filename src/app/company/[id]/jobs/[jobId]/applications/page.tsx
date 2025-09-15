// src/app/company/[id]/jobs/[jobId]/applications/page.tsx
import { JobApplications } from "@/features/job-applications";

interface JobApplicationsPageProps {
  readonly params: Promise<{ 
    id: string; // company ID
    jobId: string; 
  }>;
}

export default async function JobApplicationsPage({ params }: JobApplicationsPageProps) {
  const { id, jobId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <JobApplications companyId={id} jobId={jobId} />
    </div>
  );
}