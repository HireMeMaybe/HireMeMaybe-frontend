"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building, Edit } from 'lucide-react';
import EditProfileModal from '@/features/company-profile/components/EditProfileModal';
import { SuccessModal } from '@/components/modals';
import type { Company } from '@/types/company';

interface CompanyHeaderProps {
  readonly company: Company;
  readonly viewType: 'student' | 'company';
  readonly onCompanyUpdate?: (updatedCompany: Company) => void;
}

export default function CompanyHeader({ company, viewType, onCompanyUpdate }: CompanyHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (
    updatedData: Partial<Company>, 
    logoFile?: File, 
    bannerFile?: File
  ) => {
    try {
      setIsUpdating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would:
      // 1. Upload files to storage service
      // 2. Update company data via API
      // 3. Handle response and errors
      
      const updatedCompany: Company = {
        ...company,
        ...updatedData,
        // If files were uploaded, you'd set the URLs from the upload response
        logoUrl: logoFile ? URL.createObjectURL(logoFile) : company.logoUrl,
        bannerUrl: bannerFile ? URL.createObjectURL(bannerFile) : company.bannerUrl,
      };
      
      // Update parent component with new data
      onCompanyUpdate?.(updatedCompany);
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      // In a real app, you'd show an error message
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Banner */}
        <div 
          className="h-85 bg-cover bg-center bg-gray-800"
          style={{
            backgroundImage: company.bannerUrl ? `url(${company.bannerUrl})` : undefined
          }}
        />
        
        {/* Company Info Card */}
        <div className="relative -mt-24 mx-auto max-w-6xl px-6">
          <div className="bg-very-dark-gray border border-zinc-700 rounded-xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-component rounded-xl flex items-center justify-center border border-zinc-600 overflow-hidden">
                  {company.logoUrl ? (
                    <img 
                      src={company.logoUrl} 
                      alt={`${company.name} logo`}
                      className="w-full h-full object-cover"
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
                        onClick={handleEditProfile}
                        className="bg-[#595256] hover:bg-gray-cancel text-white px-6 py-2 rounded-md"
                        disabled={isUpdating}
                      >
                        <Edit className="w-4 h-4" />
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