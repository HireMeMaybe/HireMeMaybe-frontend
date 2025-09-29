'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Upload, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import ConfirmationModal from '@/components/modals/ConfirmModal'; // Import the modal

interface ApplicationFormProps {
  readonly jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id.toString() === jobId);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

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

  const softSkills = watch('softSkills');
  const formData = watch();

  const handleAddSoftSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const newSkill = e.currentTarget.value.trim();
      if (!softSkills.includes(newSkill)) {
        setValue('softSkills', [...softSkills, newSkill]);
      }
      e.currentTarget.value = '';
    }
  };

  const handleRemoveSoftSkill = (skill: string) => {
    setValue(
      'softSkills',
      softSkills.filter((s) => s !== skill)
    );
  };

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

  const onSubmit = (data: ApplicationFormData) => {
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

    console.log('Application submitted:', data);
    router.push('/search');
  };

  const handleModalConfirm = () => {
    handleSubmit(onSubmit)(); // Trigger form submission
    setIsModalOpen(false); // Close the modal
  };

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">Job not found</h1>
          <Button
            onClick={() => router.push('/search')}
            className="bg-primary-green hover:bg-green-600"
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-white">Application form</h1>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Name and Surname */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-white">
                Name <span className="text-red-reject">*</span>{' '}
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              {errors.name && (
                <p className="text-red-reject flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="surname" className="text-white">
                Surname <span className="text-red-reject">*</span>{' '}
              </Label>
              <Input
                id="surname"
                {...register('surname', { required: 'Surname is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              {errors.surname && (
                <p className="text-red-reject flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.surname.message}
                </p>
              )}
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white">
                Email <span className="text-red-reject">*</span>{' '}
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              {errors.email && (
                <p className="text-red-reject flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-white">
                Phone <span className="text-red-reject">*</span>{' '}
              </Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Phone number is required' })}
                className="bg-muted border-border focus:ring-primary-green/20 focus:border-primary-green h-12 rounded-lg px-4 text-base transition-all duration-200 focus:ring-2"
              />
              {errors.phone && (
                <p className="text-red-reject flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Major */}
          <div className="space-y-2">
            <Label className="text-white">
              Major <span className="text-red-reject">*</span>{' '}
            </Label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-white">
                <input
                  type="radio"
                  value="CPE"
                  {...register('major', { required: 'Major is required' })}
                />CPE
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-white">
                <input
                  type="radio"
                  value="SKE"
                  {...register('major', { required: 'Major is required' })}
                />SKE
              </label>
            </div>
            {errors.major && (
              <p className="text-red-reject flex items-center gap-2 text-sm">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.major.message}
              </p>
            )}
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <Label className="text-white">
              Education Level <span className="text-red-reject">*</span>{' '}
            </Label>
            <div className="flex flex-col gap-4">
              {EDUCATION_LEVELS.map((level) => (
                <label key={level} className="flex cursor-pointer items-center gap-2 text-white">
                  <input
                    type="radio"
                    value={level}
                    {...register('educationLevel', { required: 'Education level is required' })}
                  />
                  {level}
                </label>
              ))}
            </div>
            {errors.educationLevel && (
              <p className="text-red-reject flex items-center gap-2 text-sm">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.educationLevel.message}
              </p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label className="text-white">
              Resume <span className="text-red-reject">*</span>
            </Label>
            <Controller
              name="resume"
              control={control}
              rules={{ required: 'Resume is required' }}
              render={({ field }) => (
                <div className="bg-darker-gray rounded-lg border-2 border-dashed border-gray-600 p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="text-lighter-gray-text mx-auto mb-2 h-8 w-8" />
                    <p className="text-lighter-gray-text">
                      {field.value ? field.value.name : 'Upload File (PDF)'}
                    </p>
                    <p className="text-muted-foreground text-lighter-gray-text mt-1 text-sm">
                      PDF files up to 10MB
                    </p>
                  </label>
                </div>
              )}
            />
            {errors.resume && (
              <p className="text-red-reject flex items-center gap-2 text-sm">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.resume.message}
              </p>
            )}
          </div>

          {/* Soft Skills */}
          <div className="space-y-2">
            <Label htmlFor="soft-skills" className="text-white">
              Soft Skills
            </Label>
            <div className="bg-darker-gray rounded-lg border border-gray-600 p-4">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                className="bg-darker-gray w-full rounded border-gray-600 p-2 text-white"
                onKeyDown={handleAddSoftSkill}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {softSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary-green flex items-center gap-2 rounded-full px-3 py-1 text-white"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSoftSkill(skill)}
                      className="text-white hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
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
                  <div key={question.id} className="space-y-2">
                    <Label className="text-white">
                      {question.question}
                      {question.required && <span className="text-red-reject ml-1">*</span>}
                    </Label>

                    {(() => {
                      if (question.type === 'select') {
                        return (
                          <>
                            <Select
                              value={question.answer}
                              onValueChange={(value) => handleQuestionChange(question.id, value)}
                            >
                              <SelectTrigger className="bg-darker-gray cursor-pointer border-gray-600 text-white">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent className="bg-darker-gray border-gray-600">
                                {question.options?.map((option) => (
                                  <SelectItem
                                    key={option}
                                    value={option}
                                    className="cursor-pointer text-white hover:bg-gray-700"
                                  >
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {questionError && (
                              <p className="text-red-reject flex items-center gap-2 text-sm">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                This question is required
                              </p>
                            )}
                          </>
                        );
                      } else if (question.type === 'multiselect') {
                        return (
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
                                    className="flex cursor-pointer items-center gap-2 text-white"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleMultiselectChange(
                                          question.id,
                                          option,
                                          e.target.checked
                                        )
                                      }
                                      className="text-primary-green"
                                    />
                                    {option}
                                  </label>
                                );
                              })}
                            </div>
                            {questionError && (
                              <p className="text-red-reject flex items-center gap-2 text-sm">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                This question is required
                              </p>
                            )}
                          </>
                        );
                      } else {
                        return (
                          <>
                            <Textarea
                              value={question.answer}
                              onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                              className="bg-darker-gray border-gray-600 text-white"
                              rows={3}
                            />
                            {questionError && (
                              <p className="text-red-reject flex items-center gap-2 text-sm">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                This question is required
                              </p>
                            )}
                          </>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Questions Link */}
          {job.includeCustomQuestions && job.customQuestionsLink && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Additional Questions</h3>
              <div className="bg-darker-gray rounded-lg border border-gray-600 p-4">
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
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)} // Open the modal on click
            className="bg-primary-green w-full cursor-pointer rounded-lg py-3 font-semibold text-white hover:bg-green-600"
          >
            Submit
          </Button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title="Submit Application?"
        message="Please confirm your choice"
        description="Are you ready to submit your application?"
      />
    </div>
  );
}
