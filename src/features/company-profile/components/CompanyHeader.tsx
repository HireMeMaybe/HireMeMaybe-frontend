'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail, Phone, Building, Edit } from 'lucide-react';
import EditProfileModal from '@/features/company-profile/components/EditProfileModal';
import { SuccessModal } from '@/components/modals';
import { companyRegisterSchema, type CompanyRegisterFormData } from '@/lib/validations/company';
import type { Company } from '@/types/company';

interface CompanyHeaderProps {
  readonly company: Company;
  readonly viewType: 'student' | 'company';
  readonly onCompanyUpdate?: (updatedCompany: Company) => void;
}

export default function CompanyHeader({ company, viewType, onCompanyUpdate }: CompanyHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { setError } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: company.name,
      email: company.email,
      phone: company.phone,
      overview: company.about,
      industry: company.industry,
      companySize: company.employeeCount,
    },
  });

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (
    updatedData: Partial<Company>,
    logoFile?: File,
    bannerFile?: File
  ) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.append('companyName', updatedData.name || company.name);
        formData.append('email', updatedData.email || company.email);
        formData.append('phone', updatedData.phone || company.phone);
        formData.append('overview', updatedData.about || company.about);
        formData.append('industry', updatedData.industry || company.industry);
        formData.append('companySize', updatedData.employeeCount || company.employeeCount);

        // Append files if they exist
        if (logoFile) {
          formData.append('logo', logoFile);
        }
        if (bannerFile) {
          formData.append('banner', bannerFile);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Create updated company object
        let newLogoUrl = company.logoUrl;
        let newBannerUrl = company.bannerUrl;

        // Update image URLs only if new files are provided
        if (logoFile) {
          // Clean up old URL if it exists and is a blob URL
          if (company.logoUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(company.logoUrl);
          }
          newLogoUrl = URL.createObjectURL(logoFile);
        }

        if (bannerFile) {
          // Clean up old URL if it exists and is a blob URL
          if (company.bannerUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(company.bannerUrl);
          }
          newBannerUrl = URL.createObjectURL(bannerFile);
        }

        let formattedEmployeeCount = company.employeeCount;

        if (updatedData.employeeCount) {
          formattedEmployeeCount = updatedData.employeeCount.includes('employees')
            ? updatedData.employeeCount
            : `${updatedData.employeeCount} employees`;
        }

        const updatedCompany: Company = {
          ...company,
          name: updatedData.name || company.name,
          email: updatedData.email || company.email,
          phone: updatedData.phone || company.phone,
          about: updatedData.about || company.about,
          industry: updatedData.industry
            ? updatedData.industry.charAt(0).toUpperCase() +
              updatedData.industry.slice(1).toLowerCase()
            : company.industry,
          employeeCount: formattedEmployeeCount,
          logoUrl: newLogoUrl,
          bannerUrl: newBannerUrl,
        };

        onCompanyUpdate?.(updatedCompany);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('companyName', {
          message: 'Failed to update profile. Please try again.',
        });
        throw error;
      }
    });
  };

  return (
    <>
      <div className="relative">
        {/* Banner */}
        <div
          className="h-85 bg-gray-800 bg-cover bg-center"
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
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="h-full w-full object-cover"
                    />
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
                      <Button
                        onClick={handleEditProfile}
                        className="hover:bg-gray-cancel cursor-pointer rounded-md bg-[#595256] px-6 py-2 text-white"
                        disabled={isPending}
                      >
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        company={company}
        onSave={handleSaveProfile}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Profile Updated"
        message="Your profile has been successfully updated"
        buttonText="Continue"
      />
    </>
  );
}
