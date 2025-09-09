'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import { cpskSchema, MAX_RESUME_SIZE } from '@/lib/validations/cpsk';
import { appendIfPresent } from '@/lib/utils/form-helpers';

export default function CPSKRegisterForm(): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const { data: session } = useSession();

  type FormInput = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    program: string;
    year: string;
    soft_skill?: string | string[];
    resume?: File;
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

  // Soft skills tag input state
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(() => {
    const v = watch('soft_skill');
    if (!v) return [];
    return Array.isArray(v)
      ? v
      : String(v)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  });

  useEffect(() => {
    // keep react-hook-form value in sync
    setValue('soft_skill', skills.length > 0 ? skills : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills]);

  // Helper functions to reduce cognitive complexity
  const populateFromBackendUser = (authData: any) => {
    if (authData.first_name) setValue('first_name', authData.first_name);
    if (authData.last_name) setValue('last_name', authData.last_name);
    if (authData.User?.email || session?.user?.email) {
      setValue('email', authData.User?.email || session?.user?.email || '');
    }
    if (authData.User?.tel) setValue('phone', authData.User.tel);
    if (authData.program) setValue('program', authData.program);
    if (authData.year) setValue('year', authData.year.toString());
    if (authData.soft_skill && Array.isArray(authData.soft_skill)) {
      setSkills(authData.soft_skill as string[]);
    }
  };

  const populateFromBasicUser = (user: any) => {
    if (user.name) {
      const nameParts = user.name.split(' ');
      setValue('first_name', nameParts[0] || '');
      setValue('last_name', nameParts.slice(1).join(' ') || '');
    }
    if (user.email) setValue('email', user.email);
  };

  // Check for NextAuth session data and pre-populate form
  useEffect(() => {
    if (session?.backendUser) {
      try {
        console.log('Pre-populating form with NextAuth session data:', session.backendUser);
        populateFromBackendUser(session.backendUser);
      } catch (error) {
        console.error('Error processing NextAuth session data:', error);
      }
    } else if (session?.user) {
      console.log('Pre-populating form with basic NextAuth user data:', session.user);
      populateFromBasicUser(session.user);
    }
  }, [setValue, session]);

  const handleResumeChange = (file?: File | null) => {
    if (!file) {
      setValue('resume', undefined);
      clearErrors('resume');
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setValue('resume', undefined);
      setError('resume', { type: 'manual', message: 'Resume must be 10 MB or smaller' });
      return;
    }

    // valid
    clearErrors('resume');
    setValue('resume', file);
  };

  const addSkill = (value?: string) => {
    const raw = (value ?? skillInput).trim();
    if (!raw) return;
    if (skills.includes(raw)) {
      setSkillInput('');
      return;
    }
    setSkills((s) => [...s, raw]);
    setSkillInput('');
  };

  const removeSkill = (value: string) => {
    setSkills((s) => s.filter((x) => x !== value));
  };

  const onSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && skillInput === '' && skills.length) {
      // remove last and place it into input for quick edit
      const last = skills[skills.length - 1];
      setSkills((s) => s.slice(0, -1));
      setSkillInput(last);
    }
  };
  const onSubmit = (data: FormInput) => {
    startTransition(async () => {
      setStatus(null);
      try {
        const formData = new FormData();

        // Use the normalized helper to append fields
        appendIfPresent(formData, 'first_name', data.first_name);
        appendIfPresent(formData, 'last_name', data.last_name);
        appendIfPresent(formData, 'email', data.email);
        appendIfPresent(formData, 'phone', data.phone);
        appendIfPresent(formData, 'program', data.program);
        appendIfPresent(formData, 'year', data.year);
        appendIfPresent(formData, 'soft_skill', data.soft_skill);
        appendIfPresent(formData, 'resume', data.resume);

        const res = await fetch('/api/cpsk-register', { method: 'POST', body: formData });
        const json = await res.json();

        if (res.ok) {
          setStatus({ ok: true, message: json.message || 'Submitted' });
          setIsSuccessOpen(true);
          // Reset form and clear skills after success
          reset();
          setSkills([]);
          setSkillInput('');
        } else {
          setStatus({ ok: false, message: json.message || 'Submission failed' });
          if (json.errors && Array.isArray(json.errors)) {
            json.errors.forEach((err: { field: string; message: string }) => {
              if (err.field) {
                setError(err.field as keyof FormInput, { message: err.message });
              }
            });
          }
        }
      } catch (error) {
        setStatus({ ok: false, message: 'Network error' });
      }
    });
  };

  const handleConfirm = () => {
    // close modal then submit form
    setIsConfirmModalOpen(false);
    handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-8">
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
            className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
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
            <span>Resume (Optional)</span>
          </Label>
          <FileUpload
            className="w-full"
            file={watchedResume as File | undefined}
            accept=".pdf,application/pdf"
            description="PDF up to 10 MB"
            onFileChange={(file) => handleResumeChange(file || undefined)}
          />
          <ErrorMessage message={errors.resume?.message} />
          {watchedResume && (watchedResume as File).name && (
            <p className="text-muted mt-2 text-sm">Uploaded: {(watchedResume as File).name}</p>
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
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>

      <ConfirmModal
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
        message={status?.message || 'Submitted successfully'}
        buttonText="Close"
      />
    </form>
  );
}
