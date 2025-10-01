'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ExternalLink, Eye } from 'lucide-react';
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
import { useJobs } from '@/features/search/hooks/useJobs';
import { ApplicationFormData, EDUCATION_LEVELS, DEFAULT_QUESTIONS } from '@/types/application';
import { useState, useEffect } from 'react';
import { ConfirmModal, SuccessModal } from '@/components/modals';
import { useSoftSkills } from '@/features/cpsk-register/hooks/useSoftSkills';
import { useResumeUpload } from '@/features/cpsk-register/hooks/useResumeUpload';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useApplicationSubmit } from '@/features/applications/hooks';

interface ApplicationFormProps {
  readonly jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id.toString() === jobId);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [hasExistingResume, setHasExistingResume] = useState(false);

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
      if (profileData.User?.email) setValue('email', profileData.User.email);
      if (profileData.User?.tel) setValue('phone', profileData.User.tel);
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

    // Otherwise fetch existing resume from server
    if (!profileData?.resume_id) return;
    setResumePreviewLoading(true);
    setResumePreviewError(null);

    try {
      if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);

      const response = await fetch(`/api/file/resume/${profileData.resume_id}?preview=1`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        setResumePreviewError('Failed to load resume preview.');
        return;
      }

      const arrayBuffer = await response.arrayBuffer();

      // Force PDF MIME so iframe can render even if server sends octet-stream
      let blobType = 'application/pdf';
      const ct = response.headers.get('content-type');
      if (ct?.includes('image/')) {
        blobType = ct; // allow image if backend actually returns one
      }

      const blob = new Blob([arrayBuffer], { type: blobType });

      if (blob.size === 0) {
        setResumePreviewError('Empty file received.');
        return;
      }

      const url = URL.createObjectURL(blob);
      setResumePreviewUrl(url);
      setIsResumePreviewOpen(true);
    } catch (e) {
      console.error('Error previewing resume:', e);
      setResumePreviewError('Error while loading resume preview.');
    } finally {
      setResumePreviewLoading(false);
    }
  };

  // Local preview (modal) state
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const [resumePreviewError, setResumePreviewError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitted(true);

    // Validate required questions
    if (job?.includeDefaultQuestions) {
      const unansweredRequired = data.questions.filter(
        (q) => q.required && (!q.answer || q.answer.trim() === '')
      );

      if (unansweredRequired.length > 0) {
        alert('Please answer all required questions');
        return;
      }
    }

    // Submit the application
    const success = await submitApplication(data);

    if (success) {
      setIsSuccessOpen(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/search');
      }, 2000);
    } else {
      // Handle submission error
      alert(submitError || 'Failed to submit application. Please try again.');
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center text-white">
            <div className="border-primary-green mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-lg">Loading your profile...</p>
            <p className="text-muted mt-2 text-sm">Please wait while we fetch your information</p>
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
                      <RadioGroupItem id="major-cpe" value="CPE" />
                      <Label htmlFor="major-cpe">CPE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="major-ske" value="SKE" />
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
                      className="flex items-center gap-2 bg-primary-green/70 px-3 py-2 text-sm text-white hover:bg-primary-green/60 cursor-pointer"
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
                  <div key={question.id} className="space-y-3">
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
                  className="inline-flex cursor-pointer items-center gap-2 bg-primary-green/70 text-white hover:bg-primary-green/60"
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
      {isResumePreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-700 bg-[#1f1f23] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-lg font-semibold text-white">Resume Preview</h2>
              <button
                onClick={() => {
                  if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
                  setResumePreviewUrl(null);
                  setIsResumePreviewOpen(false);
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-neutral-900">
              {resumePreviewError && (
                <div className="flex h-full items-center justify-center p-6">
                  <p className="text-sm text-red-400">{resumePreviewError}</p>
                </div>
              )}

              {!resumePreviewError && !resumePreviewUrl && (
                <div className="flex h-full items-center justify-center p-6">
                  <p className="text-sm text-gray-300">Loading...</p>
                </div>
              )}

              {resumePreviewUrl && (
                <div className="h-full w-full">
                  <iframe
                    title="Resume Preview"
                    src={resumePreviewUrl}
                    className="h-full w-full"
                    style={{ border: 'none' }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-700 bg-[#18181b] px-4 py-3">
              <Button
                type="button"
                onClick={() => {
                  if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
                  setResumePreviewUrl(null);
                  setIsResumePreviewOpen(false);
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
