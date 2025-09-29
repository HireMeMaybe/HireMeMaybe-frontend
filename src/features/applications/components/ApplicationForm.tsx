'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Upload,
  ExternalLink,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  FileText,
  Heart,
} from 'lucide-react';
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
import { applicationFormSchema } from '@/lib/validations/application';
import { ApplicationFormData, EDUCATION_LEVELS, DEFAULT_QUESTIONS } from '@/types/application';

interface ApplicationFormProps {
  jobId: string;
}

export function ApplicationForm({ jobId }: ApplicationFormProps) {
  const router = useRouter();
  const { jobs } = useJobs();
  const job = jobs.find((j) => j.id.toString() === jobId);

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
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      major: undefined as any, // This will be properly typed now
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
      e.currentTarget.value = ''; // Clear the input field
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
    // Validate that resume is not null before submitting
    if (!data.resume) {
      console.error('Resume is required');
      return;
    }

    console.log('Application submitted:', data);
    router.push('/search');
  };

  if (!job) {
    return (
      <div className="bg-background min-h-screen">
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
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="bg-primary-green/20 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
              <FileText className="text-primary-green h-8 w-8" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">Application Form</h1>
            <p className="text-lg text-gray-300">Complete your application for this position</p>
            <div className="from-primary-green mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r to-green-400"></div>
          </div>

          {/* Form Container */}
          <div className="bg-background rounded-2xl border border-gray-700 p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="from-primary-green h-8 w-2 rounded-full bg-gradient-to-b to-green-400"></div>
                  <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
                </div>

                {/* Name and Surname in a Row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 text-lg font-medium text-white"
                    >
                      <User className="text-primary-green h-5 w-5" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      className="focus:ring-primary-green/30 focus:border-primary-green h-14 rounded-xl border-gray-600 bg-gray-700/50 px-4 text-base text-white backdrop-blur-sm transition-all duration-300 focus:ring-2"
                      placeholder="Enter your first name"
                    />
                    {errors.name && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
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

                  {/* Surname */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="surname"
                      className="flex items-center gap-2 text-lg font-medium text-white"
                    >
                      <User className="text-primary-green h-5 w-5" />
                      Surname
                    </Label>
                    <Input
                      id="surname"
                      {...register('surname')}
                      className="focus:ring-primary-green/30 focus:border-primary-green h-14 rounded-xl border-gray-600 bg-gray-700/50 px-4 text-base text-white backdrop-blur-sm transition-all duration-300 focus:ring-2"
                      placeholder="Enter your last name"
                    />
                    {errors.surname && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
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
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-lg font-medium text-white"
                  >
                    <Mail className="text-primary-green h-5 w-5" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="focus:ring-primary-green/30 focus:border-primary-green h-14 rounded-xl border-gray-600 bg-gray-700/50 px-4 text-base text-white backdrop-blur-sm transition-all duration-300 focus:ring-2"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="flex items-center gap-2 text-sm text-red-400">
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
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-lg font-medium text-white"
                  >
                    <Phone className="text-primary-green h-5 w-5" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className="focus:ring-primary-green/30 focus:border-primary-green h-14 rounded-xl border-gray-600 bg-gray-700/50 px-4 text-base text-white backdrop-blur-sm transition-all duration-300 focus:ring-2"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="flex items-center gap-2 text-sm text-red-400">
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

              {/* Academic Information Section */}
              <div className="space-y-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  <h2 className="text-2xl font-semibold text-white">Academic Information</h2>
                </div>

                {/* Major */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-lg font-medium text-white">
                    <GraduationCap className="h-5 w-5 text-blue-400" />
                    Major
                  </Label>
                  <div className="flex gap-6 rounded-xl border border-gray-600 bg-gray-700/30 p-4">
                    <label className="group flex cursor-pointer items-center gap-3 text-white">
                      <input
                        type="radio"
                        value="CPE"
                        {...register('major')}
                        className="text-primary-green focus:ring-primary-green h-4 w-4 border-gray-500 bg-gray-700 focus:ring-2"
                      />
                      <span className="group-hover:text-primary-green transition-colors">CPE</span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-3 text-white">
                      <input
                        type="radio"
                        value="SKE"
                        {...register('major')}
                        className="text-primary-green focus:ring-primary-green h-4 w-4 border-gray-500 bg-gray-700 focus:ring-2"
                      />
                      <span className="group-hover:text-primary-green transition-colors">SKE</span>
                    </label>
                  </div>
                  {errors.major && (
                    <p className="flex items-center gap-2 text-sm text-red-400">
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
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-lg font-medium text-white">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    Education Level
                  </Label>
                  <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-600 bg-gray-700/30 p-4 md:grid-cols-2">
                    {EDUCATION_LEVELS.map((level) => (
                      <label
                        key={level}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 text-white transition-colors hover:bg-gray-600/30"
                      >
                        <input
                          type="radio"
                          value={level}
                          {...register('educationLevel')}
                          className="text-primary-green focus:ring-primary-green h-4 w-4 border-gray-500 bg-gray-700 focus:ring-2"
                        />
                        <span className="group-hover:text-primary-green transition-colors">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.educationLevel && (
                    <p className="flex items-center gap-2 text-sm text-red-400">
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
              </div>

              {/* Documents Section */}
              <div className="space-y-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
                  <h2 className="text-2xl font-semibold text-white">Documents</h2>
                </div>

                {/* Resume Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-lg font-medium text-white">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Resume
                  </Label>
                  <Controller
                    name="resume"
                    control={control}
                    rules={{ required: 'Resume is required' }}
                    render={({ field }) => (
                      <div className="hover:border-primary-green/50 rounded-xl border-2 border-dashed border-gray-600 bg-gray-700/30 p-8 text-center transition-all duration-300 hover:bg-gray-700/50">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="block cursor-pointer">
                          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
                            <Upload className="h-8 w-8 text-purple-400" />
                          </div>
                          <p className="mb-2 text-lg text-gray-300">
                            {field.value ? (
                              <span className="text-primary-green font-medium">
                                {field.value.name}
                              </span>
                            ) : (
                              'Upload your resume'
                            )}
                          </p>
                          <p className="text-sm text-gray-500">PDF files supported</p>
                        </label>
                      </div>
                    )}
                  />
                  {errors.resume && (
                    <p className="flex items-center gap-2 text-sm text-red-400">
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
              </div>

              {/* Skills Section */}
              <div className="space-y-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-gradient-to-b from-pink-500 to-orange-500"></div>
                  <h2 className="text-2xl font-semibold text-white">Skills</h2>
                </div>

                {/* Soft Skills */}
                <div className="space-y-3">
                  <Label
                    htmlFor="soft-skills"
                    className="flex items-center gap-2 text-lg font-medium text-white"
                  >
                    <Heart className="h-5 w-5 text-pink-400" />
                    Soft Skills
                  </Label>
                  <div className="rounded-xl border border-gray-600 bg-gray-700/30 p-6">
                    <input
                      type="text"
                      placeholder="Type a skill and press Enter to add"
                      className="focus:ring-primary-green/30 focus:border-primary-green w-full rounded-lg border border-gray-600 bg-gray-700/50 p-4 text-base text-white transition-all duration-300 focus:ring-2"
                      onKeyDown={handleAddSoftSkill}
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      {softSkills.map((skill) => (
                        <span
                          key={skill}
                          className="from-primary-green flex items-center gap-2 rounded-full bg-gradient-to-r to-green-400 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSoftSkill(skill)}
                            className="ml-1 text-white transition-colors hover:text-red-300"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Questions */}
              {job.includeDefaultQuestions && formData.questions.length > 0 && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-8 w-2 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></div>
                    <h2 className="text-2xl font-semibold text-white">Questions</h2>
                  </div>
                  <div className="space-y-6">
                    {formData.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="rounded-xl border border-gray-600 bg-gray-700/30 p-6"
                      >
                        <Label className="mb-4 block text-lg font-medium text-white">
                          {index + 1}. {question.question}
                          {question.required && <span className="ml-1 text-red-400">*</span>}
                        </Label>

                        {(() => {
                          if (question.type === 'select') {
                            return (
                              <Select
                                value={question.answer}
                                onValueChange={(value) => handleQuestionChange(question.id, value)}
                              >
                                <SelectTrigger className="h-12 border-gray-600 bg-gray-700/50 text-base text-white">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-600 bg-gray-700">
                                  {question.options?.map((option) => (
                                    <SelectItem
                                      key={option}
                                      value={option}
                                      className="text-white hover:bg-gray-600"
                                    >
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          } else if (question.type === 'multiselect') {
                            return (
                              <div className="space-y-3">
                                {question.options?.map((option) => {
                                  const currentAnswers = question.answer
                                    ? question.answer.split(', ')
                                    : [];
                                  const isChecked = currentAnswers.includes(option);
                                  return (
                                    <label
                                      key={option}
                                      className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 text-white transition-colors hover:bg-gray-600/30"
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
                                        className="text-primary-green focus:ring-primary-green h-4 w-4 rounded border-gray-500 bg-gray-700 focus:ring-2"
                                      />
                                      <span className="group-hover:text-primary-green transition-colors">
                                        {option}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            );
                          } else {
                            return (
                              <Textarea
                                value={question.answer}
                                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                                className="focus:ring-primary-green/30 focus:border-primary-green border-gray-600 bg-gray-700/50 text-base text-white transition-all duration-300 focus:ring-2"
                                rows={4}
                                required={question.required}
                                placeholder="Type your answer here..."
                              />
                            );
                          }
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Questions Link */}
              {job.includeCustomQuestions && job.customQuestionsLink && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-8 w-2 rounded-full bg-gradient-to-b from-red-500 to-pink-500"></div>
                    <h2 className="text-2xl font-semibold text-white">Additional Questions</h2>
                  </div>
                  <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6">
                    <p className="mb-4 text-lg text-white">
                      Please complete the additional questions for this position:
                    </p>
                    <Button
                      type="button"
                      onClick={() => window.open(job.customQuestionsLink, '_blank')}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                    >
                      Complete Custom Questions
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-8">
                <Button
                  type="submit"
                  className="from-primary-green w-full rounded-xl bg-gradient-to-r to-green-400 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-green-600 hover:to-green-500 hover:shadow-xl"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
