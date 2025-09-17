"use client";

import { ApplicationForm } from "@/features/applications/components/ApplicationForm";
import * as React from "react";

export default function ApplicationPage({ params }: { readonly params: Promise<{ jobId: string }> }) {
  const { jobId } = React.use(params);

  return (
    <div className="min-h-screen bg-background">
      <ApplicationForm jobId={jobId} />
    </div>
  );
}
