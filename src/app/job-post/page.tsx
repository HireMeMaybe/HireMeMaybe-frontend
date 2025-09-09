"use client";

import { JobPostForm } from "@/features/job-post";

export default function JobPostPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <JobPostForm />
        </div>
      </main>
    </div>
  );
}
