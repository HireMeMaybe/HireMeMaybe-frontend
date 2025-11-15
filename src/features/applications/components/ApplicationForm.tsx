'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ExternalLink, Eye, AlertTriangle } from 'lucide-react';
import {
  Input,
  Label,
  Button,
  FileUpload,
  RadioGroup,
  RadioGroupItem,
  ErrorMessage,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApplicationFormData, EDUCATION_LEVELS, DEFAULT_QUESTIONS } from '@/types/application';
import type { JobWithQuestions } from '@/types/application';
import { useState, useEffect } from 'react';
import { ConfirmModal, SuccessModal, ResumePreviewModal, LoadingModal } from '@/components/modals';
import { CpskService } from '@/lib/services/cpsk.service';
import { JobService } from '@/lib/services/job.service';
import { useSoftSkills } from '@/features/cpsk-register/hooks/useSoftSkills';
import { useResumeUpload } from '@/features/cpsk-register/hooks/useResumeUpload';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { normalizeUser } from '@/lib/utils/user';
import { useApplicationSubmit } from '@/features/applications/hooks';
import { useSession } from 'next-auth/react';

interface ApplicationFormProps {
  readonly jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<JobWithQuestions | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [hasExistingResume, setHasExistingResume] = useState(false);

  // Fetch job post by ID
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoadingJob(true);
        const jobData = await JobService.getJobPostById(jobId);

        // Map JobPostDetail to JobWithQuestions
        const mappedJob: JobWithQuestions = {
          id: jobData.id,
          title: jobData.title,
          company: jobData.company_user?.name || 'Unknown Company',
          location: jobData.location,
          logoPath: '', // Will be handled separately if needed
          tags: jobData.tags,
          description: jobData.desc,
          postedDate: jobData.post_time,
          includeDefaultQuestions: true, // Assume default questions for now
          includeCustomQuestions: false,
          customQuestionsLink: undefined,
        };

        setJob(mappedJob);
      } catch (error) {
        console.error('Failed to fetch job post:', error);
        setJob(null);
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const getInitialQuestions = () => {
    if (!job) return [];
    const questions = [];
    if (job.includeDefaultQuestions) {
      questions.push(...DEFAULT_QUESTIONS);
    }
    return questions;
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      major: '',
      educationLevel: '',
      resume: undefined,
      soft_skill: [],
      questions: getInitialQuestions(),
    },
  });

  const watchedResume = watch('resume');

  const { skillInput, skills, setSkillInput, setSkills, addSkill, removeSkill, onSkillKeyDown } =
    useSoftSkills<ApplicationFormData>({
      setValue,
      initialSkills: [],
    });

  const { handleResumeChange, getResumeDisplayText } = useResumeUpload<ApplicationFormData>({
    setValue,
    setError,
    clearErrors,
    watchedResume: watchedResume || undefined,
  });

  // Fetch profile data and populate form
  const { profileData, loading: isLoading, error: profileError } = useProfile();

  // Application submission hook
  const { isSubmitting, submitError, submitApplication } = useApplicationSubmit();

  // Populate form with profile data when it loads
  useEffect(() => {
    if (profileData && !isLoading) {
      // Populate basic info
      if (profileData.first_name) setValue('name', profileData.first_name);
      if (profileData.last_name) setValue('surname', profileData.last_name);
      const n = normalizeUser(profileData.User);
      if (n.email) setValue('email', n.email);
      if (n.tel) setValue('phone', n.tel);
      if (profileData.program) {
        const majorValue =
          profileData.program === 'CPE' ? 'CPE' : profileData.program === 'SKE' ? 'SKE' : '';
        setValue('major', majorValue);
      }
      if (profileData.year) setValue('educationLevel', String(profileData.year));

      // Populate soft skills
      if (profileData.soft_skill && Array.isArray(profileData.soft_skill)) {
        setSkills(profileData.soft_skill);
        setValue('soft_skill', profileData.soft_skill);
      }

      // Handle resume if it exists in profile
      if (profileData.resume_id) {
        setHasExistingResume(true);
        console.log('Profile has resume data:', profileData.resume_id);
      } else {
        setHasExistingResume(false);
      }
    }
  }, [profileData, isLoading, setValue, setSkills]);

  const formData = watch();

  const handleQuestionChange = (id: string, value: string) => {
    const updatedQuestions = formData.questions.map((q) =>
      q.id === id ? { ...q, answer: value } : q
    );
    setValue('questions', updatedQuestions);
  };

  const handleMultiselectChange = (id: string, option: string, checked: boolean) => {
    const updatedQuestions = formData.questions.map((q) => {
      if (q.id === id) {
        const currentAnswers = q.answer ? q.answer.split(', ') : [];
        const updatedAnswers = checked
          ? [...currentAnswers, option]
          : currentAnswers.filter((ans) => ans !== option);
        return { ...q, answer: updatedAnswers.join(', ') };
      }
      return q;
    });
    setValue('questions', updatedQuestions);
  };

  const openResumePreview = async () => {
    // If user has just selected a new file (not yet uploaded), preview it locally
    if (watchedResume instanceof File) {
      if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
      const localUrl = URL.createObjectURL(watchedResume);
      setResumePreviewUrl(localUrl);
      setResumePreviewError(null);
      setIsResumePreviewOpen(true);
      return;
    }

    // Otherwise fetch existing resume from server using CpskService
    if (!profileData?.resume_id) return;
    setResumePreviewLoading(true);
    setResumePreviewError(null);

    try {
      if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);

      // Use CpskService to preview resume directly from backend
      const blob = await CpskService.previewResume(profileData.resume_id);

      if (blob.size === 0) {
        setResumePreviewError('Empty file received.');
        setIsResumePreviewOpen(true);
        setResumePreviewLoading(false);
        return;
      }

      // Force PDF MIME type for iframe rendering
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      setResumePreviewUrl(url);
      setIsResumePreviewOpen(true);
    } catch (e) {
      console.error('Error previewing resume:', e);
      const errorMessage = e instanceof Error ? e.message : 'Error while loading resume preview.';
      setResumePreviewError(errorMessage);
      setIsResumePreviewOpen(true);
    } finally {
      setResumePreviewLoading(false);
    }
  };

  // Local preview (modal) state
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const [resumePreviewError, setResumePreviewError] = useState<string | null>(null);
  // ADD: validation modal state
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  // ADD: track missing required question texts
  const [missingRequiredQuestions, setMissingRequiredQuestions] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitted(true);

    if (job?.includeDefaultQuestions) {
      const unansweredRequired = data.questions.filter(
        (q) => q.required && (!q.answer || q.answer.trim() === '')
      );
      if (unansweredRequired.length > 0) {
        setMissingRequiredQuestions(unansweredRequired.map((q) => q.question));
        setValidationMessage('Please answer all required questions.');
        setIsValidationOpen(true);
        return;
      }
    }

    try {
      // Get CPSK user ID from session
      const cpskId = session?.backendUser?.id;
      if (!cpskId) {
        setValidationMessage('User ID not found. Please log in again.');
        setIsValidationOpen(true);
        return;
      }

      // Upload resume if a new one is provided, otherwise use existing resume_id
      let resumeId = profileData?.resume_id;
      if (data.resume instanceof File) {
        await CpskService.uploadResume(data.resume);
        // After upload, fetch the updated profile to get the new resume_id
        const updatedProfile = await CpskService.getProfile();
        resumeId = updatedProfile.resume_id;
      }

      if (!resumeId) {
        setValidationMessage('Resume is required. Please upload your resume.');
        setIsValidationOpen(true);
        return;
      }

      // Extract answers from questions
      const rightToWork =
        data.questions.find((q) => q.id === 'default_q1')?.answer || 'Not specified';
      const expectedSalary =
        data.questions.find((q) => q.id === 'default_q2')?.answer || 'Not specified';
      const experienceAnswer = data.questions.find((q) => q.id === 'default_q3')?.answer || '';

      // Map experience text to years
      const experienceMap: Record<string, number> = {
        'No experience': 0,
        'Less than 1 year': 0,
        '1-2 years': 1,
        '3-5 years': 3,
        '5+ years': 5,
      };
      const yearOfExperience = experienceMap[experienceAnswer] ?? 0;

      // Get programming languages from multiselect question
      const programmingLanguagesAnswer =
        data.questions.find((q) => q.id === 'default_q4')?.answer || '';
      const programmingLanguages = programmingLanguagesAnswer
        ? programmingLanguagesAnswer.split(', ').filter((lang) => lang.trim())
        : [];

      const success = await submitApplication(Number(jobId), String(cpskId), resumeId, {
        expectedSalary,
        programmingLanguages,
        rightToWork,
        yearOfExperience,
        status: 'pending',
      });

      if (success) {
        setMissingRequiredQuestions([]);
        setIsSuccessOpen(true);
        setTimeout(() => {
          router.push('/search');
        }, 2000);
      } else {
        setMissingRequiredQuestions([]);
        setValidationMessage(submitError || 'Failed to submit application. Please try again.');
        setIsValidationOpen(true);
      }
    } catch (error) {
      console.error('Error during application submission:', error);
      setMissingRequiredQuestions([]);
      setValidationMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      );
      setIsValidationOpen(true);
    }
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    handleSubmit(onSubmit)();
  };

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">Job not found</h1>
          <Button
            onClick={() => router.push('/search')}
            className="bg-primary-green cursor-pointer hover:bg-green-600"
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingJob || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center text-white">
            <div className="border-primary-green mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-lg">Loading...</p>
            <p className="text-muted mt-2 text-sm">Please wait while we fetch the information</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    console.warn('Profile fetch error:', profileError);
    // Continue to show form even if profile fetch fails
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-white">Application form</h1>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Name and Surname */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="flex items-center text-sm">
                <span>Name*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              <ErrorMessage message={errors.name?.message} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="surname" className="flex items-center text-sm">
                <span>Surname*</span>
              </Label>
              <Input
                id="surname"
                {...register('surname', { required: 'Surname is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              <ErrorMessage message={errors.surname?.message} />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center text-sm">
                <span>Email*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                disabled
                readOnly
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              <ErrorMessage message={errors.email?.message} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="flex items-center text-sm">
                <span>Phone*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              <ErrorMessage message={errors.phone?.message} />
            </div>
          </div>

          {/* Major */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm">
              <span>Major*</span>
            </Label>
            <Controller
              control={control}
              name="major"
              rules={{ required: 'Major is required' }}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="major-cpe" value="CPE" className="cursor-pointer" />
                      <Label htmlFor="major-cpe">CPE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="major-ske" value="SKE" className="cursor-pointer" />
                      <Label htmlFor="major-ske">SKE</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
            <ErrorMessage message={errors.major?.message} />
          </div>

          {/* Education Level */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm">
              <span>Education Level*</span>
            </Label>
            <Controller
              control={control}
              name="educationLevel"
              rules={{ required: 'Education level is required' }}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex flex-col gap-4">
                    {EDUCATION_LEVELS.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem
                          id={`education-${level.replace(/\s+/g, '-').toLowerCase()}`}
                          value={level}
                          className="cursor-pointer"
                        />
                        <Label htmlFor={`education-${level.replace(/\s+/g, '-').toLowerCase()}`}>
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            />
            <ErrorMessage message={errors.educationLevel?.message} />
          </div>

          {/* Resume Upload */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-semibold">
              <span>Resume*</span>
            </Label>

            {/* Show existing resume if available */}
            {hasExistingResume && profileData?.resume_id && (
              <div className="bg-muted mb-4 rounded-lg border border-gray-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-green/20 text-primary-green rounded-lg p-2">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">Existing Resume</p>
                      <p className="text-muted text-sm">Resume from your profile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={openResumePreview}
                      disabled={resumePreviewLoading}
                      className="bg-primary-green/70 hover:bg-primary-green/60 flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white"
                    >
                      <Eye className="h-4 w-4" />
                      {resumePreviewLoading ? 'Loading...' : 'Preview'}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-600 pt-3">
                  <p className="text-muted text-xs">
                    You can upload a new resume below to replace your existing one for this
                    application.
                  </p>
                </div>
              </div>
            )}

            <Controller
              name="resume"
              control={control}
              rules={{ required: !hasExistingResume ? 'Resume is required' : false }}
              render={({ field }) => (
                <FileUpload
                  className="w-full"
                  file={field.value}
                  accept=".pdf,application/pdf"
                  description="PDF up to 10 MB"
                  onFileChange={(file) => handleResumeChange(file || undefined)}
                />
              )}
            />
            <ErrorMessage message={errors.resume?.message} />
            {watchedResume && (watchedResume as File).name && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-muted text-sm">New upload: {getResumeDisplayText()}</p>
                <span className="text-xs text-blue-400">(Will replace existing resume)</span>
              </div>
            )}
            {hasExistingResume && !watchedResume && (
              <div className="mt-2">
                <p className="text-primary-green text-sm">
                  ✓ Using existing resume from your profile
                </p>
              </div>
            )}
          </div>

          {/* Soft Skills */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm">
              <span>Soft Skills</span>
              {isLoading && (
                <span className="text-primary-green ml-2 text-xs">(Loading from profile...)</span>
              )}
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
                      className="text-gray-text ml-1 cursor-pointer rounded-full hover:text-gray-500"
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
                placeholder={isLoading ? 'Loading skills...' : 'Type a skill and press Enter'}
                disabled={isLoading}
                className="border-border bg-muted mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Default Questions */}
          {job.includeDefaultQuestions && formData.questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Questions</h3>
              {formData.questions.map((question) => {
                const questionError =
                  isSubmitted &&
                  question.required &&
                  (!question.answer || question.answer.trim() === '');

                return (
                  <div
                    key={question.id}
                    // Removed red highlight classes
                    className="space-y-3"
                  >
                    <Label className="text-sm">
                      {question.question}
                      {question.required && <span className="text-red-reject ml-1">*</span>}
                    </Label>

                    {question.type === 'select' ? (
                      <>
                        <Select
                          value={question.answer}
                          onValueChange={(value) => handleQuestionChange(question.id, value)}
                        >
                          <SelectTrigger className="bg-muted border-border h-12 cursor-pointer rounded-lg">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border">
                            {question.options?.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="cursor-pointer hover:bg-gray-700"
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {questionError && <ErrorMessage message="This question is required" />}
                      </>
                    ) : question.type === 'multiselect' ? (
                      <>
                        <div className="space-y-2">
                          {question.options?.map((option) => {
                            const currentAnswers = question.answer
                              ? question.answer.split(', ')
                              : [];
                            const isChecked = currentAnswers.includes(option);
                            return (
                              <label
                                key={option}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handleMultiselectChange(question.id, option, e.target.checked)
                                  }
                                  className="text-primary-green"
                                />
                                {option}
                              </label>
                            );
                          })}
                        </div>
                        {questionError && <ErrorMessage message="This question is required" />}
                      </>
                    ) : (
                      <>
                        <Textarea
                          value={question.answer}
                          onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                          className="bg-muted border-border min-h-[100px] rounded-lg"
                          rows={3}
                        />
                        {questionError && <ErrorMessage message="This question is required" />}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Questions Link */}
          {job.includeCustomQuestions && job.customQuestionsLink && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Additional Questions</h3>
              <div className="bg-muted rounded-lg border border-gray-600 p-4">
                <p className="mb-3 text-white">
                  Please complete the additional questions for this position:
                </p>
                <Button
                  type="button"
                  onClick={() => window.open(job.customQuestionsLink, '_blank')}
                  className="bg-primary-green/70 hover:bg-primary-green/60 inline-flex cursor-pointer items-center gap-2 text-white"
                >
                  Complete Custom Questions
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isSubmitting}
              className="bg-primary-green hover:bg-darker-green active:bg-darker-green h-12 w-full cursor-pointer rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title="Submit Application?"
        message="Please confirm your choice"
        description="Are you ready to submit your application?"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Submitted"
        message="Application submitted successfully!"
        buttonText="Close"
      />

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={isResumePreviewOpen}
        onClose={() => {
          if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
          setResumePreviewUrl(null);
          setIsResumePreviewOpen(false);
          setResumePreviewError(null);
        }}
        resumeUrl={resumePreviewUrl}
        error={resumePreviewError}
        isLoading={resumePreviewLoading}
      />

      {/* Validation / Error Modal */}
      {isValidationOpen && (
        <div
          className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-background w-full max-w-md overflow-hidden rounded-xl border border-gray-700 shadow-2xl">
            <div className="bg-background flex items-center gap-3 border-b border-gray-700 px-5 py-4">
              <div className="rounded-md bg-red-600/15 p-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Submission Needs Attention</h2>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-gray-300">{validationMessage}</p>
              {missingRequiredQuestions.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
                    Unanswered Required Questions
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-gray-300">
                    {missingRequiredQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-gray-400">
                    Please scroll back and fill them in before submitting again.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-background flex justify-end gap-3 border-t border-gray-700 px-5 py-3">
              <Button
                type="button"
                onClick={() => {
                  setIsValidationOpen(false);
                  setMissingRequiredQuestions([]);
                }}
                className="cursor-pointer bg-gray-600 text-white hover:bg-gray-500"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      <LoadingModal
        isOpen={isSubmitting}
        title="Submitting Application"
        message="Please wait while we upload your application..."
      />
    </div>
  );
}
