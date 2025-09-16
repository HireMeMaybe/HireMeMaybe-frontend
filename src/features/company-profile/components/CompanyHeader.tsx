'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail, Phone, Building, Edit } from 'lucide-react';
import type { Company } from '@/types/company';

interface CompanyHeaderProps {
  readonly company: Company;
  readonly viewType: 'student' | 'company';
}

export default function CompanyHeader({ company, viewType }: CompanyHeaderProps) {
  return (
    <div className="relative">
      {/* Banner */}
      <div
        className="h-85 bg-contain bg-center"
        style={{
          backgroundImage: company.bannerUrl ? `url(${company.bannerUrl})` : undefined,
        }}
      />

      {/* Company Info Card */}
      <div className="relative mx-auto -mt-24 max-w-6xl px-6">
        <div className="bg-very-dark-gray rounded-xl border border-zinc-700 p-8 shadow-xl">
          <div className="flex flex-col items-start gap-6 md:flex-row">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="bg-component flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-zinc-600">
                {company.logoUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <Building className="text-primary-green h-12 w-12" />
                )}
              </div>
            </div>

            {/* Company Details */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-white">{company.name}</h1>
                  <p className="text-lighter-gray-text mb-4">
                    {company.industry} | {company.employeeCount} | {company.location}
                  </p>

                  {/* Contact Info */}
                  <div className="text-lighter-gray-text flex flex-col gap-4 text-sm sm:flex-row">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{company.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {viewType === 'company' && (
                    <Button className="hover:bg-gray-cancel rounded-md bg-[#595256] px-6 py-2 text-white">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
