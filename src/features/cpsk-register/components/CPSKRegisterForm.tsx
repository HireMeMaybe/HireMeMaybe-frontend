'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import type { ProfileData } from '@/types/cpsk';
import {
  Input,
  Label,
  Button,
  FileUpload,
  RadioGroup,
  RadioGroupItem,
  ErrorMessage,
} from '@/components/ui';
import { SuccessModal, ConfirmModal } from '@/components/modals';
import { cpskSchema } from '@/lib/validations/cpsk';
import { useDownloadResume } from '@/features/profile/hooks/useDownloadResume';
import { useSoftSkills } from '../hooks/useSoftSkills';
import { useResumeUpload } from '../hooks/useResumeUpload';
import { useFormPopulation } from '../hooks/useFormPopulation';
import { useFormSubmission } from '../hooks/useFormSubmission';

export default function CPSKRegisterForm({
  session,
  profileData: initialProfile,
}: {
  session?: Session | null;
  profileData?: ProfileData | null;
}): React.JSX.Element {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const router = useRouter();
  const { downloadResume } = useDownloadResume();

  type FormInput = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    program: string;
    year: string;
    soft_skill?: string | string[] | undefined;
    resume?: File | undefined;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormInput>({
    resolver: zodResolver(cpskSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      program: '',
      year: '',
      soft_skill: undefined,
    },
  });

  // confirmation modal state (matches CompanyRegisterForm behavior)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const watchedResume = watch('resume');

  // Extracted hooks
  const { isPending, status, submitForm } = useFormSubmission({ session });

  const { skillInput, skills, setSkillInput, setSkills, addSkill, removeSkill, onSkillKeyDown } =
    useSoftSkills({
      setValue,
      initialSkills: initialProfile?.soft_skill || [],
    });

  const { handleResumeChange, getResumeDisplayText } = useResumeUpload({
    setValue,
    setError,
    clearErrors,
    watchedResume,
  });

  // Use form population hook
  useFormPopulation({
    setValue,
    session,
    initialProfile,
    setSkills,
  });
  const onSubmit = async (data: FormInput) => {
    await submitForm(data);
  };

  // Handle success modal and navigation when status changes
  useEffect(() => {
    if (status?.ok) {
      setIsSuccessOpen(true);

      // Reset form and clear skills after success
      reset();
      setSkills([]);

      // Redirect to profile page after successful submission
      // Reload the window to force NextAuth to fetch updated session data from backend
      setTimeout(() => {
        window.location.href = '/profile'; // Use window.location instead of router.push to force session refresh
      }, 2000);
    }
  }, [status, reset, setSkills, router]);

  const handleConfirm = () => {
    // close modal then submit form
    setIsConfirmModalOpen(false);
    handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label className="flex items-center text-sm">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 0116 0H2z" />
            </svg>
            <span>First name*</span>
          </Label>
          <Input
            {...register('first_name')}
            className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
          />
          <ErrorMessage message={errors.first_name?.message} />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center text-sm">
            <span>Last name*</span>
          </Label>
          <Input
            {...register('last_name')}
            className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
          />
          <ErrorMessage message={errors.last_name?.message} />
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="flex items-center text-sm">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.94 6.34L10 10.882l7.06-4.543A2 2 0 0016.882 4H3.118a2 2 0 00-.178 2.34z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>Email*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            readOnly
            aria-readonly="true"
            title="Email cannot be changed"
            className="bg-muted h-12 cursor-not-allowed rounded-lg px-4 text-base opacity-80 transition-all duration-200"
          />
          <ErrorMessage message={errors.email?.message} />
        </div>

        <div className="space-y-3">
          <Label htmlFor="phone" className="flex items-center text-sm">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>Phone*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
          />
          <ErrorMessage message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center text-sm">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2l3 6H7l3-6zM4 14l6 4 6-4V6H4v8z" />
                </svg>
                <span>Program*</span>
              </Label>
              <Controller
                control={control}
                name="program"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={(v: string) => field.onChange(v)}>
                    <div className="mt-2 flex items-center gap-8">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="program-cpe" value="CPE" />
                        <Label htmlFor="program-cpe">CPE</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="program-ske" value="SKE" />
                        <Label htmlFor="program-ske">SKE</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
              <ErrorMessage message={errors.program?.message} />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center text-sm">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zM7 9h6v2H7V9z" />
                </svg>
                <span>Year*</span>
              </Label>
              <Controller
                control={control}
                name="year"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={(v: string) => field.onChange(v)}>
                    <div className="flex flex-col gap-4">
                      {[
                        'Year 1',
                        'Year 2',
                        'Year 3',
                        'Year 4',
                        'Year 5 or above',
                        "Master's Degree",
                        'PhD',
                        'Graduate (Alumni)',
                      ].map((label) => (
                        <div key={label} className="flex items-center space-x-2">
                          <RadioGroupItem
                            id={`year-${label.replace(/\s+/g, '-').toLowerCase()}`}
                            value={label}
                          />
                          <Label htmlFor={`year-${label.replace(/\s+/g, '-').toLowerCase()}`}>
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              />
              <ErrorMessage message={errors.year?.message} />
            </div>
          </div>
        </div>

        <div aria-hidden className="" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-semibold">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
            <span>
              Resume{' '}
              {initialProfile?.resume_id ? '(Current resume will be replaced)' : '(Optional)'}
            </span>
          </Label>

          {/* Display existing resume if available */}
          {initialProfile?.resume_id && !watchedResume ? (
            <div className="mb-4 rounded-lg border border-gray-600 bg-gray-800/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-[var(--color-primary-green)] p-2">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">resume_{initialProfile.resume_id}.pdf</p>
                    <p className="text-sm text-gray-400">Current resume</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => downloadResume(initialProfile.resume_id!)}
                  variant="outline"
                  size="sm"
                  className="border-[var(--color-primary-green)] bg-transparent text-[var(--color-primary-green)] hover:bg-[var(--color-primary-green)] hover:text-white"
                >
                  <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download
                </Button>
              </div>
            </div>
          ) : null}

          <FileUpload
            className="w-full"
            file={watchedResume as File | undefined}
            accept=".pdf,application/pdf"
            description={
              initialProfile?.resume_id
                ? 'Upload new resume to replace current one'
                : 'PDF up to 10 MB'
            }
            onFileChange={(file) => handleResumeChange(file || undefined)}
          />
          <ErrorMessage message={errors.resume?.message} />
          {watchedResume && (watchedResume as File).name && (
            <p className="text-muted mt-2 text-sm">
              {initialProfile?.resume_id ? 'New resume: ' : 'Uploaded: '}
              {getResumeDisplayText()}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="mb-2 flex items-center text-sm">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2H2V5zm0 4h16v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
            </svg>
            <span>Soft Skills (Optional)</span>
          </Label>
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full bg-gray-500/60 px-2 pb-1 pl-3 text-sm"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="text-gray-text ml-1 rounded-full hover:text-gray-500"
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              id="soft-skill-input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
              onBlur={() => addSkill()}
              placeholder="Type a skill and press Enter"
              className="border-border bg-muted mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <ErrorMessage message={errors.soft_skill?.message as string} />
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="button"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={isPending}
          className="bg-primary-green hover:bg-darker-green active:bg-darker-green h-12 w-full cursor-pointer rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit
        </Button>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Submit?"
        message="Please confirm your choice"
        description={`Are you ready to submit your profile?${watchedResume ? (initialProfile?.resume_id ? ' This will replace your current resume.' : ' This will save your profile and upload your resume.') : ' This will save your profile.'}`}
        onConfirm={handleConfirm}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Submitted"
        message={status?.message || 'Submitted successfully'}
        buttonText="Close"
      />
    </form>
  );
}
