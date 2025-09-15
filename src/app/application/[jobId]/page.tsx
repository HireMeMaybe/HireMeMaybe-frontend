"use client";

import { ApplicationForm } from "@/features/applications/components/ApplicationForm"; // Correct import path

interface ApplicationPageProps {
  params: { jobId: string };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const { jobId } = params;

  return (
    <div className="min-h-screen bg-background">
      <ApplicationForm jobId={jobId} />
    </div>
  );
}