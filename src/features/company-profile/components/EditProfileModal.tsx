'use client';

import { useRef, useTransition, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Camera, User } from 'lucide-react';
import { WarningModal } from '@/components/modals';
import { companyRegisterSchema, type CompanyRegisterFormData } from '@/lib/validations/company';
import type { Company, BackendCompanyResponse } from '@/types/company';
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from '@/types/company';
import { mapBackendToDisplay, mapFrontendToBackend } from '@/lib/utils/size';
import { normalizeUser } from '@/lib/utils/user';
import { useSession } from 'next-auth/react';

interface EditProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly company: Company;
  readonly onSave?: (
    updatedCompany: Partial<Company>,
    logoFile?: File,
    bannerFile?: File
  ) => Promise<void>;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  company,
  onSave,
}: EditProfileModalProps) {
  const [isPending, startTransition] = useTransition();
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [logoPreview, setLogoPreview] = useState<string>(company.logoUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(company.bannerUrl || '');

  // Get session to access backendUser for email/phone
  const { data: session } = useSession();
  const backendUser = (session?.backendUser as any) ?? null;

  // Backend returns either 'User' or 'user' field - try both
  const userField = backendUser?.User ?? backendUser?.user ?? null;
  const userInfo = normalizeUser(userField);

  // Use email/phone from session's User field, fallback to company object
  const emailValue = userInfo.email || company.email || '';
  const phoneValue = userInfo.tel || company.phone || '';

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    setError,
    clearErrors,
    reset,
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: company.name,
      email: emailValue,
      phone: phoneValue,
      overview: company.about,
      industry: company.industry,
      companySize: mapBackendToDisplay(company.size),
    },
  });

  // Check if there are any changes
  const hasChanges = isDirty || logoFile !== null || bannerFile !== null;
  const selectedIndustry = watch('industry');
  const selectedCompanySize = watch('companySize');

  const industryOptions = useMemo(() => {
    if (!company.industry) {
      return [...INDUSTRY_OPTIONS];
    }

    const hasExisting = INDUSTRY_OPTIONS.some((option) => option.value === company.industry);
    return hasExisting
      ? [...INDUSTRY_OPTIONS]
      : [{ value: company.industry, label: company.industry }, ...INDUSTRY_OPTIONS];
  }, [company.industry]);

  const companySizeDisplayValue = useMemo(() => mapBackendToDisplay(company.size), [company.size]);

  const companySizeOptions = useMemo(() => {
    if (!companySizeDisplayValue) {
      return [...COMPANY_SIZE_OPTIONS];
    }

    const hasExisting = COMPANY_SIZE_OPTIONS.some(
      (option) => option.value === companySizeDisplayValue
    );
    return hasExisting
      ? [...COMPANY_SIZE_OPTIONS]
      : [
          { value: companySizeDisplayValue, label: companySizeDisplayValue },
          ...COMPANY_SIZE_OPTIONS,
        ];
  }, [companySizeDisplayValue]);

  useEffect(() => {
    if (!isOpen) return; // Only run when modal is actually open

    // Recalculate email/phone from session when modal opens
    // Backend returns either 'User' or 'user' field - try both
    const freshUserField = backendUser?.User ?? backendUser?.user ?? null;
    const freshUserInfo = normalizeUser(freshUserField);
    const freshEmail = freshUserInfo.email || company.email || '';
    const freshPhone = freshUserInfo.tel || company.phone || '';

    console.log('EditProfileModal - backendUser:', backendUser);
    console.log('EditProfileModal - freshUserField:', freshUserField);
    console.log('EditProfileModal - freshUserInfo:', freshUserInfo);
    console.log('EditProfileModal - freshEmail:', freshEmail);
    console.log('EditProfileModal - freshPhone:', freshPhone);
    console.log('EditProfileModal - company.email:', company.email);
    console.log('EditProfileModal - company.phone:', company.phone);

    // Use setValue to explicitly set each field value
    setValue('companyName', company.name);
    setValue('email', freshEmail);
    setValue('phone', freshPhone);
    setValue('overview', company.about);
    setValue('industry', company.industry);
    setValue('companySize', mapBackendToDisplay(company.size));

    setLogoPreview(company.logoUrl || '');
    setBannerPreview(company.bannerUrl || '');
    setLogoFile(null);
    setBannerFile(null);

    // Clear file inputs
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (bannerInputRef.current) bannerInputRef.current.value = '';

    // Clear errors and messages
    clearErrors();
    setSubmitMessage(null);
  }, [isOpen, company, setValue, clearErrors, backendUser]);

  // Handle file uploads
  const handleFileChange = (type: 'logo' | 'banner', file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(type === 'logo' ? 'logo' : 'banner', {
        message: 'File size must be less than 10MB',
      });
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError(type === 'logo' ? 'logo' : 'banner', {
        message: 'Only JPG, JPEG, and PNG files are allowed',
      });
      return;
    }

    // Clear previous error
    clearErrors(type === 'logo' ? 'logo' : 'banner');

    // Set file and create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(result);
      } else {
        setBannerFile(file);
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded file
  const removeFile = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoFile(null);
      setLogoPreview(company.logoUrl || '');
      if (logoInputRef.current) logoInputRef.current.value = '';
      clearErrors('logo');
    } else {
      setBannerFile(null);
      setBannerPreview(company.bannerUrl || '');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      clearErrors('banner');
    }
  };

  const onSubmit = async (data: CompanyRegisterFormData) => {
    startTransition(async () => {
      try {
        const updatedCompany: Partial<Company> = {
          name: data.companyName,
          about: data.overview,
          email: data.email,
          phone: data.phone,
          industry: data.industry,
          size: mapFrontendToBackend(data.companySize) ?? data.companySize,
        };

        // Pass the files to the save handler
        await onSave?.(updatedCompany, logoFile || undefined, bannerFile || undefined);

        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Error updating profile:', error);
        setSubmitMessage({
          type: 'error',
          text: 'Failed to update profile. Please try again.',
        });
      }
    });
  };

  // Handle close with warning check
  const handleClose = () => {
    if (hasChanges && !isPending) {
      setShowWarning(true);
    } else {
      onClose();
    }
  };

  // Handle warning modal actions
  const handleLeaveWithoutSaving = () => {
    setShowWarning(false);
    onClose();
  };

  const handleSaveAndStay = () => {
    setShowWarning(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent
          className="bg-background max-h-[90vh] overflow-y-auto border-zinc-700 text-white sm:max-w-2xl"
          showCloseButton={false}
        >
          {/* Hidden accessibility components */}
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>
          <DialogDescription className="sr-only">
            Edit your company profile information
          </DialogDescription>

          <div className="space-y-6 p-6">
            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`rounded-xl p-4 shadow-sm transition-all duration-300 ${
                  submitMessage.type === 'success'
                    ? 'bg-primary-green text-white'
                    : 'bg-red-reject text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {submitMessage.type === 'success' ? (
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="font-medium">{submitMessage.text}</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Edit your profile</h2>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="h-auto p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="bg-component flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-600">
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt="Company logo"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={() => removeFile('logo')}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-primary-green px-4 py-2 text-white hover:bg-green-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload photo
                    </Button>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange('logo', file);
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">At least 512 x 512 px PNG or JPG file</p>
                {errors.logo && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.logo.message}</span>
                  </p>
                )}
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Banner</Label>
                <div className="space-y-3">
                  <div className="bg-component relative h-32 w-full overflow-hidden rounded-lg border-2 border-dashed border-zinc-600">
                    {bannerPreview ? (
                      <>
                        <Image
                          src={bannerPreview}
                          alt="Company banner"
                          fill
                          className="object-cover"
                        />
                        {bannerFile && (
                          <button
                            type="button"
                            onClick={() => removeFile('banner')}
                            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                        <Camera className="mb-2 h-8 w-8" />
                        <p className="text-sm">No banner uploaded</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="bg-primary-green px-4 py-2 text-white hover:bg-green-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload banner
                    </Button>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange('banner', file);
                    }}
                  />
                </div>
                {errors.banner && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.banner.message}</span>
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-white">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  className="bg-very-dark-gray border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.companyName.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="bg-very-dark-gray border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Enter email address"
                  disabled
                  readOnly
                  title="Email cannot be changed"
                />
                {errors.email && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-white">
                  Phone
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="bg-very-dark-gray border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.phone.message}</span>
                  </p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Industry</Label>
                <Select
                  value={selectedIndustry || undefined}
                  onValueChange={(value) => {
                    setValue('industry', value, { shouldDirty: true });
                    clearErrors('industry');
                  }}
                >
                  <SelectTrigger className="bg-very-dark-gray border-zinc-600 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-very-dark-gray border-zinc-600">
                    {industryOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-zinc-700"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.industry.message}</span>
                  </p>
                )}
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Company Size</Label>
                <Select
                  value={selectedCompanySize || undefined}
                  onValueChange={(value) => {
                    setValue('companySize', value, { shouldDirty: true });
                    clearErrors('companySize');
                  }}
                >
                  <SelectTrigger className="bg-very-dark-gray border-zinc-600 text-white">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-very-dark-gray border-zinc-600">
                    {companySizeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-zinc-700"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.companySize.message}</span>
                  </p>
                )}
              </div>

              {/* About Us */}
              <div className="space-y-2">
                <Label htmlFor="overview" className="text-sm font-medium text-white">
                  About us
                </Label>
                <Textarea
                  id="overview"
                  {...register('overview')}
                  className="bg-very-dark-gray min-h-24 resize-none border-zinc-600 text-white placeholder-gray-400"
                  placeholder="Tell us about your company..."
                  rows={4}
                />
                {errors.overview && (
                  <p className="text-red-reject mt-2 flex items-center space-x-1 text-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.overview.message}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-zinc-700 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="border-zinc-600 px-6 text-zinc-300 hover:bg-zinc-700"
                  disabled={isPending}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-green px-6 text-white hover:bg-green-700"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title="Unsaved Changes"
        message="Proceed with caution"
        description="You have unsaved changes that will be lost if you continue. Are you sure you want to leave this page without saving your progress?"
        onSave={handleSaveAndStay}
        onLeave={handleLeaveWithoutSaving}
      />
    </>
  );
}
