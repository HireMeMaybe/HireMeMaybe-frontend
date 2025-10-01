'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ExternalLink } from 'lucide-react';
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
import { useState } from 'react';
import { ConfirmModal, SuccessModal } from '@/components/modals';
import { useSession } from 'next-auth/react';
import { useSoftSkills } from '@/features/cpsk-register/hooks/useSoftSkills';
import { useResumeUpload } from '@/features/cpsk-register/hooks/useResumeUpload';
import { useProfileData, useApplicationSubmit } from '@/features/applications/hooks';

interface ApplicationFormProps {
  readonly jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id.toString() === jobId);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

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
      resume: null,
      softSkills: [],
      questions: getInitialQuestions(),
    },
  });

  const watchedResume = watch('resume');

  // Use soft skills hook
  const { skillInput, skills, setSkillInput, setSkills, addSkill, removeSkill, onSkillKeyDown } =
    useSoftSkills({
      setValue,
      initialSkills: [],
    });

  // Use resume upload hook
  const { handleResumeChange, getResumeDisplayText } = useResumeUpload({
    setValue,
    setError,
    clearErrors,
    watchedResume: watchedResume as File | undefined,
  });

  // Fetch profile data and populate form
  const { isLoading, error: profileError } = useProfileData({
    session,
    setValue,
    setSkills,
  });

  // Application submission hook
  const { isSubmitting, submitError, submitApplication } = useApplicationSubmit();

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
            className="bg-primary-green hover:bg-green-600 cursor-pointer"
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
        <div className="text-center text-white">
          <p>Loading your profile...</p>
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
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 0116 0H2z" />
                </svg>
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
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.94 6.34L10 10.882l7.06-4.543A2 2 0 0016.882 4H3.118a2 2 0 00-.178 2.34z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>Email*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
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
                {...register('phone', { required: 'Phone number is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              <ErrorMessage message={errors.phone?.message} />
            </div>
          </div>

          {/* Major */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2l3 6H7l3-6zM4 14l6 4 6-4V6H4v8z" />
              </svg>
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
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zM7 9h6v2H7V9z" />
              </svg>
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
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
              <span>Resume*</span>
            </Label>
            <Controller
              name="resume"
              control={control}
              rules={{ required: 'Resume is required' }}
              render={({ field }) => (
                <FileUpload
                  className="w-full"
                  file={field.value as File | undefined}
                  accept=".pdf,application/pdf"
                  description="PDF up to 10 MB"
                  onFileChange={(file) => handleResumeChange(file || undefined)}
                />
              )}
            />
            <ErrorMessage message={errors.resume?.message} />
            {watchedResume && (watchedResume as File).name && (
              <p className="text-muted mt-2 text-sm">Uploaded: {getResumeDisplayText()}</p>
            )}
          </div>

          {/* Soft Skills */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm">
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
                          <SelectContent className="bg-muted border-border">
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
                        {questionError && (
                          <ErrorMessage message="This question is required" />
                        )}
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
                        {questionError && (
                          <ErrorMessage message="This question is required" />
                        )}
                      </>
                    ) : (
                      <>
                        <Textarea
                          value={question.answer}
                          onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                          className="bg-muted border-border min-h-[100px] rounded-lg"
                          rows={3}
                        />
                        {questionError && (
                          <ErrorMessage message="This question is required" />
                        )}
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
                  className="inline-flex cursor-pointer items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
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
    </div>
  );
}