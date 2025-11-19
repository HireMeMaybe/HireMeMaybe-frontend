"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/app/loading";
import CompanyApplicationViewer from "@/features/job-applications/components/CompanyApplicationViewer";

interface CompanyApplicationPageParams {
  readonly id: string;
  readonly applicationId: string;
}

export default function CompanyApplicationPage({
  params,
}: {
  readonly params: Promise<CompanyApplicationPageParams>;
}) {
  const { id, applicationId } = React.use(params);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <CompanyApplicationViewer companyId={id} applicationId={applicationId} />
    </div>
  );
}
