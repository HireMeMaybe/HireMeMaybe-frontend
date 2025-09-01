"use client";

import { Button } from '@/components/ui/button';
import { Mail, Phone, Building } from 'lucide-react';
import type { Company } from '@/types/company';

interface CompanyHeaderProps {
  company: Company;
  viewType: 'student' | 'company';
}

export default function CompanyHeader({ company, viewType }: CompanyHeaderProps) {
  return (
    <div className="relative">
      {/* Banner */}
      <div 
        className="h-85 bg-contain bg-center"
        style={{
          backgroundImage: company.bannerUrl ? `url(${company.bannerUrl})` : undefined
        }}
      />
      
      {/* Company Info Card */}
      <div className="relative -mt-24 mx-auto max-w-6xl px-6">
        <div className="bg-[#1A1A1A] border border-zinc-700 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-component rounded-xl flex items-center justify-center border border-zinc-600 overflow-hidden">
                {company.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover" // Ensures the image fills the container
                  />
                ) : (
                  <Building className="w-12 h-12 text-primary-green" />
                )}
              </div>
            </div>
            
            {/* Company Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {company.name}
                  </h1>
                  <p className="text-lighter-gray-text mb-4">
                    {company.industry} | {company.employeeCount} | {company.location}
                  </p>
                  
                  {/* Contact Info */}
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-lighter-gray-text">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{company.phone}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex-shrink-0">
                  {viewType === 'company' && (
                    <Button 
                      className="bg-primary-green hover:bg-green-700 text-white px-6 py-2 rounded-md"
                    >
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