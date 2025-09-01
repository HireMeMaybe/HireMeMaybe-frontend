// src/features/company-profile/components/CompanyAbout.tsx
"use client";

import type { Company } from '@/types/company';

interface CompanyAboutProps {
  readonly company: Company;
}

export default function CompanyAbout({ company }: CompanyAboutProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="bg-background">
        <h2 className="text-2xl font-bold text-white mb-6">About us</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-lighter-gray-text leading-relaxed text-base">
            {company.about}
          </p>
        </div>
      </div>
    </div>
  );
}