'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail, Phone, Building, Edit } from 'lucide-react';
import EditProfileModal from '@/features/company-profile/components/EditProfileModal';
import { SuccessModal } from '@/components/modals';
import { companyRegisterSchema, type CompanyRegisterFormData } from '@/lib/validations/company';
import type { Company } from '@/types/company';
import { mapBackendToDisplay, mapFrontendToBackend } from '@/lib/utils/size';
import { capitalize } from '@/lib/utils/string';
import { isValidEmail, isValidPhone } from '@/lib/utils/user';
import { CompanyService } from '@/lib/services/company.service';

interface CompanyHeaderProps {
  readonly company: Company;
  readonly viewType: 'owner' | 'company' | 'cpsk';
  readonly onCompanyUpdate?: (updatedCompany: Company) => void;
}

export default function CompanyHeader({ company, viewType, onCompanyUpdate }: CompanyHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // reset error when logo url changes
    setLogoError(false);
  }, [company.logoUrl]);

  const { setError } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: company.name,
      email: company.email,
      phone: company.phone,
      overview: company.about,
      industry: company.industry,
      companySize: company.size,
    },
  });

  const { data: session } = useSession();
  const isOwner = !!session?.user?.email && session.user.email === company.email;

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
        console.log('Saving profile with data:', updatedData);
        console.log('Session:', session);

        // Update company profile data (don't send email - it's read-only)
        const profilePayload = {
          name: updatedData.name || undefined,
          industry: updatedData.industry || undefined,
          overview: updatedData.about || undefined,
          size: mapFrontendToBackend(updatedData.size) || undefined,
          tel: updatedData.phone || undefined,
        };

        // Remove undefined values to avoid sending empty fields
        const cleanedPayload = Object.fromEntries(
          Object.entries(profilePayload).filter(([, v]) => v !== undefined)
        );

        console.log('Sending payload to backend:', cleanedPayload);
        const updatedProfile = await CompanyService.patchCompanyProfile(cleanedPayload);
        console.log('Backend response:', updatedProfile);

        let logoId = updatedProfile?.logo_id;
        let bannerId = updatedProfile?.banner_id;

        // Upload logo if provided
        if (logoFile) {
          try {
            const logoResponse = await CompanyService.uploadProfileLogo(logoFile);
            console.log('Logo upload response:', logoResponse);
            // Backend should return updated profile with logo_id
            logoId =
              ((logoResponse as unknown as Record<string, unknown>)?.logo_id as
                | number
                | undefined) || logoId;
          } catch (e) {
            console.error('Logo upload failed:', e);
            throw new Error('Profile updated but logo upload failed.');
          }
        }

        // Upload banner if provided
        if (bannerFile) {
          try {
            const bannerResponse = await CompanyService.uploadProfileBanner(bannerFile);
            console.log('Banner upload response:', bannerResponse);
            // Backend should return updated profile with banner_id
            bannerId =
              ((bannerResponse as unknown as Record<string, unknown>)?.banner_id as
                | number
                | undefined) || bannerId;
          } catch (e) {
            console.error('Banner upload failed:', e);
            throw new Error('Profile updated but banner upload failed.');
          }
        }

        // Fetch fresh logo and banner URLs from backend using the IDs
        let newLogoUrl = company.logoUrl;
        let newBannerUrl = company.bannerUrl;

        if (logoFile && logoId) {
          try {
            const logoBlob = await CompanyService.fetchLogo(logoId);
            // Clean up old URL if it exists and is a blob URL
            if (company.logoUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(company.logoUrl);
            }
            newLogoUrl = URL.createObjectURL(logoBlob);
          } catch (err) {
            console.warn('Failed to fetch updated logo:', err);
          }
        }

        if (bannerFile && bannerId) {
          try {
            const bannerBlob = await CompanyService.fetchBanner(bannerId);
            // Clean up old URL if it exists and is a blob URL
            if (company.bannerUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(company.bannerUrl);
            }
            newBannerUrl = URL.createObjectURL(bannerBlob);
          } catch (err) {
            console.warn('Failed to fetch updated banner:', err);
          }
        }

        const updatedCompany: Company = {
          ...company,
          name: updatedData.name || company.name,
          email: updatedData.email || company.email,
          phone: updatedData.phone || company.phone,
          about: updatedData.about || company.about,
          industry: updatedData.industry || company.industry,
          size: updatedData.size || company.size,
          logoUrl: newLogoUrl,
          bannerUrl: newBannerUrl,
        };

        onCompanyUpdate?.(updatedCompany);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('companyName', {
          message:
            error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
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
          style={company.bannerUrl ? { backgroundImage: `url(${company.bannerUrl})` } : undefined}
        />

        {/* Company Info Card */}
        <div className="relative mx-auto -mt-24 max-w-6xl px-6">
          <div className="bg-very-dark-gray rounded-xl border border-zinc-700 p-8 shadow-xl">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <div className="bg-component flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-zinc-600">
                  {company.logoUrl && !logoError ? (
                    <Image
                      src={company.logoUrl as string}
                      alt={`${company.name} logo`}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      onError={() => setLogoError(true)}
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
                      {capitalize(company.industry)} | {mapBackendToDisplay(company.size)} |{' '}
                      {company.location}
                    </p>

                    {/* Contact Info */}
                    <div className="text-lighter-gray-text flex flex-col gap-4 text-sm sm:flex-row">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {company.email && company.email.length > 0 ? (
                          isValidEmail(company.email) ? (
                            <a className="underline" href={`mailto:${company.email}`}>
                              {company.email}
                            </a>
                          ) : (
                            <span>{company.email}</span>
                          )
                        ) : (
                          <span>Not provided</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {company.phone && company.phone.length > 0 ? (
                          isValidPhone(company.phone) ? (
                            // normalize tel to remove spaces for tel: link
                            <a
                              className="underline"
                              href={`tel:${company.phone.replace(/[^+0-9]/g, '')}`}
                            >
                              {company.phone}
                            </a>
                          ) : (
                            <span>{company.phone}</span>
                          )
                        ) : (
                          <span>Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {(viewType === 'owner' || isOwner) && (
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
