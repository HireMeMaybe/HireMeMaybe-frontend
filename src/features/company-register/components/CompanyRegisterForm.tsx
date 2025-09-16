'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  FileUpload,
} from '@/components/ui/';
import { companyRegisterSchema, type CompanyRegisterFormData } from '@/lib/validations/company';
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from '@/types/company';
import { registerCompany } from '@/features/company-register/server/actions.server';
import ConfirmationModal from '@/components/modals/ConfirmModal'; // Import ConfirmModal
import SuccessModal from '@/components/modals/SuccessModal';

export function CompanyRegisterForm(): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // State to control ConfirmModal visibility
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      overview: '',
      industry: '',
      companySize: '',
    },
  });

  const watchedLogo = watch('logo');
  const watchedBanner = watch('banner');

  const onSubmit = async (data: CompanyRegisterFormData) => {
    startTransition(async () => {
      try {
        // Create FormData for server action
        const formData = new FormData();

        // Helper to conditionally append non-empty values
        const appendIfPresent = (key: string, value: string | File | undefined) => {
          if (value && value !== '') {
            formData.append(key, value as string | File);
          }
        };

        // Append all fields
        appendIfPresent('companyName', data.companyName);
        appendIfPresent('email', data.email);
        appendIfPresent('phone', data.phone);
        appendIfPresent('overview', data.overview);
        appendIfPresent('industry', data.industry);
        appendIfPresent('companySize', data.companySize);
        appendIfPresent('logo', data.logo);
        appendIfPresent('banner', data.banner);

        const result = await registerCompany(formData);

        if (result.success) {
          setSubmitMessage({
            type: 'success',
            text: result.message,
          });
          setIsSuccessOpen(true);
          // Reset form after success
          reset();
        } else {
          setSubmitMessage({
            type: 'error',
            text: result.message,
          });

          // Set field-specific errors if they exist
          if (result.errors) {
            result.errors.forEach((error) => {
              setError(error.field as keyof CompanyRegisterFormData, {
                message: error.message,
              });
            });
          }
        }
      } catch (error) {
        console.error('Error during company registration:', error); // Log the error for debugging
        setSubmitMessage({
          type: 'error',
          text: 'An unexpected error occurred. Please try again.',
        });
      }
    });
  };

  const handleConfirm = () => {
    setIsConfirmModalOpen(false);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-8">
      {/* Success message will be shown via SuccessModal; inline banner removed */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Logo Upload */}
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-semibold">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Company Logo</span>
          </Label>

          <FileUpload
            file={watchedLogo}
            accept=".jpg,.jpeg,.png,.pdf"
            description="JPG, JPEG, PNG, PDF files up to 10MB"
            onFileChange={(file) => {
              setValue('logo', file || undefined);
              if (file) {
                clearErrors('logo');
              }
            }}
          />

          {errors.logo && (
            <p className="mt-2 flex items-center space-x-1 text-sm text-red-600">
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

        {/* Company Banner Upload */}
        <div className="space-y-3">
          <Label className="text-foreground flex items-center text-sm font-semibold">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Company Banner</span>
          </Label>

          <FileUpload
            file={watchedBanner}
            accept=".jpg,.jpeg,.png,.pdf"
            description="JPG, JPEG, PNG, PDF files up to 10MB"
            onFileChange={(file) => {
              setValue('banner', file || undefined);
              if (file) {
                clearErrors('banner');
              }
            }}
          />

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
        <div className="space-y-3">
          <Label
            htmlFor="companyName"
            className="text-foreground flex items-center text-sm font-semibold"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2H5v-2h10z"
                clipRule="evenodd"
              />
            </svg>
            <span>Company Name</span>
          </Label>
          <Input
            id="companyName"
            {...register('companyName')}
            className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
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

        {/* Email and Phone */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label
              htmlFor="email"
              className="text-foreground flex items-center text-sm font-semibold"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Email</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
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
          <div className="space-y-3">
            <Label
              htmlFor="phone"
              className="text-foreground flex items-center text-sm font-semibold"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>Phone</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
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
        </div>

        {/* Overview */}
        <div className="space-y-3">
          <Label
            htmlFor="overview"
            className="text-foreground flex items-center text-sm font-semibold"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Overview</span>
          </Label>
          <Textarea
            id="overview"
            {...register('overview')}
            className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green min-h-[140px] resize-none rounded-lg p-4 text-base transition-all duration-200 focus:ring-2"
            placeholder="Tell us about your company, its mission, and what makes it unique..."
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

        {/* Industry and Company Size */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label className="text-foreground flex items-center text-sm font-semibold">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <span>Industry</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue('industry', value);
                clearErrors('industry');
              }}
            >
              <SelectTrigger className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 w-full rounded-lg transition-all duration-200 focus:ring-2">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-gray-cancel border-border rounded-lg shadow-lg">
                {INDUSTRY_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-primary-green/10 focus:bg-primary-green/10 data-[highlighted]:bg-dark-gray cursor-pointer px-3 py-2 transition-colors duration-150"
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
          <div className="space-y-3">
            <Label className="text-foreground flex items-center text-sm font-semibold">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Company Size</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue('companySize', value);
                clearErrors('companySize');
              }}
            >
              <SelectTrigger className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 w-full rounded-lg transition-all duration-200 focus:ring-2">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-cancel border-border rounded-lg shadow-lg">
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-primary-green/10 focus:bg-primary-green/10 data-[highlighted]:bg-dark-gray cursor-pointer px-3 py-2 transition-colors duration-150"
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
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="button"
            className="bg-primary-green h-12 w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setIsConfirmModalOpen(true)}
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
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>

      {/* Confirm Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Submit Register?"
        message="Please confirm your choice"
        description="Are you ready to submit your register?"
        onConfirm={handleConfirm}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Registration submitted"
        message={submitMessage?.text || 'Submitted successfully'}
        buttonText="Close"
      />
    </div>
  );
}
