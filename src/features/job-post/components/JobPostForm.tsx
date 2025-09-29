'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { refinedJobPostSchema } from '@/lib/validations/job-post';
import type { JobPostFormData } from '@/lib/validations/job-post';
import DefaultApplicationFormQuestions from '@/features/job-post/components/DefaultApplicationFormQuestions';
import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

const HIRING_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

export default function JobPostForm() {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobPostFormData>({
    resolver: zodResolver(refinedJobPostSchema),
    defaultValues: {
      openingPosition: '',
      description: '',
      requirements: '',
      workLocation: '',
      hiringType: '',
      salary: '',
      experienceLevel: '',
      tags: '',
      postTime: '',
      expiringTime: '',
      includeDefaultForm: false,
      includeCustomForm: false,
      customFormLink: '',
    },
  });

  const includeDefaultForm = watch('includeDefaultForm');
  const includeCustomForm = watch('includeCustomForm');

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const newTag = currentTag.trim();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue('tags', updatedTags.join(', '));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags.join(', '));
  };

  const onSubmit = (data: JobPostFormData) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="mb-8 text-3xl font-bold text-white">Job Posting</h1>

      {/* Job Details Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Job Details</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Opening Position */}
          <div className="lg:col-span-2">
            <Label htmlFor="openingPosition" className="text-white">
              Opening Position <span className="text-red-reject">*</span>
            </Label>
            <Input
              id="openingPosition"
              {...register('openingPosition')}
              className="bg-darker-gray mt-4 border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.openingPosition && (
              <p className="mt-2 text-sm text-red-reject">{errors.openingPosition.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <Label htmlFor="description" className="text-white">
              Description of Position <span className="text-red-reject">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="bg-darker-gray mt-4 min-h-[120px] border-gray-600 text-white placeholder-gray-400"
              placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-reject">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="lg:col-span-2">
            <Label htmlFor="requirements" className="text-white">
              Requirements <span className="text-red-reject">*</span>
            </Label>
            <Textarea
              id="requirements"
              {...register('requirements')}
              className="bg-darker-gray mt-4 min-h-[120px] border-gray-600 text-white placeholder-gray-400"
              placeholder="List the required qualifications, skills, experience, and education..."
            />
            {errors.requirements && (
              <p className="mt-2 text-sm text-red-reject">{errors.requirements.message}</p>
            )}
          </div>

          {/* Work Location */}
          <div>
            <Label htmlFor="workLocation" className="text-white">
              Work Location <span className="text-red-reject">*</span>
            </Label>
            <Input
              id="workLocation"
              {...register('workLocation')}
              className="bg-darker-gray mt-4 border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g. Bangkok, Thailand"
            />
            {errors.workLocation && (
              <p className="mt-2 text-sm text-red-reject">{errors.workLocation.message}</p>
            )}
          </div>

          {/* Hiring Type */}
          <div>
            <Label htmlFor="hiringType" className="text-white">
              Hiring Type <span className="text-red-reject">*</span>
            </Label>
            <Controller
              name="hiringType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-darker-gray mt-4 border-gray-600 text-white">
                    <SelectValue placeholder="Select Hiring Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-darker-gray border-gray-600">
                    {HIRING_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-gray-600">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.hiringType && (
              <p className="mt-2 text-sm text-red-reject">{errors.hiringType.message}</p>
            )}
          </div>

          {/* Salary */}
          <div>
            <Label htmlFor="salary" className="text-white">
              Salary (Optional)
            </Label>
            <Input
              id="salary"
              {...register('salary')}
              className="bg-darker-gray mt-4 border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g. 50000"
            />
            {errors.salary && <p className="mt-2 text-sm text-red-reject">{errors.salary.message}</p>}
          </div>

          {/* Experience Level */}
          <div>
            <Label htmlFor="experienceLevel" className="text-white">
              Experience Level <span className="text-red-reject">*</span>
            </Label>
            <Controller
              name="experienceLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-darker-gray mt-4 border-gray-600 text-white">
                    <SelectValue placeholder="Select Experience Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-darker-gray border-gray-600">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className="text-white hover:bg-gray-600"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experienceLevel && (
              <p className="mt-2 text-sm text-red-reject">{errors.experienceLevel.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="lg:col-span-2">
            <Label htmlFor="tags" className="text-white">
              Tags <span className="text-red-reject">*</span>
            </Label>
            <div className="mt-4">
              {/* Tag input */}
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="bg-darker-gray border-gray-600 text-white placeholder-gray-400"
                placeholder="Type a tag and press Enter to add (e.g. Frontend, Backend, DevOps...)"
              />

              {/* Display existing tags below the input */}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary-green inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-green-700"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Hidden input for form submission */}
              <input type="hidden" {...register('tags')} />
            </div>
            {errors.tags && <p className="mt-2 text-sm text-red-reject">{errors.tags.message}</p>}
          </div>
        </div>
      </Card>

      {/* Job Timing Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Job Timing</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Post time */}
          <div className="relative">
            <Label htmlFor="postTime" className="text-white">
              Post time
            </Label>
            <Input
              id="postTime"
              type="datetime-local"
              {...register('postTime')}
              className="bg-darker-gray mt-4 border-gray-600 text-white"
              placeholder="16 Aug 2025 07:00 AM"
            />
            {errors.postTime && (
              <p className="mt-2 text-sm text-red-reject">{errors.postTime.message}</p>
            )}
          </div>

          {/* Expiring Time */}
          <div className="relative">
            <Label htmlFor="expiringTime" className="text-white">
              Expiring Time (Optional)
            </Label>
            <Input
              id="expiringTime"
              type="datetime-local"
              {...register('expiringTime')}
              className="bg-darker-gray mt-4 border-gray-600 text-white"
              placeholder="dd/mm/yyyy HH:MM AM"
            />
            {errors.expiringTime && (
              <p className="mt-2 text-sm text-red-reject">{errors.expiringTime.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Application Questions Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Application Questions (Optional)</h2>

        <div className="space-y-4">
          {/* Include default application form */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeDefaultForm"
              {...register('includeDefaultForm')}
              className="text-primary-green bg-darker-gray focus:ring-primary-green h-4 w-4 rounded border-gray-600 focus:ring-2"
            />
            <Label htmlFor="includeDefaultForm" className="text-white">
              Include default application questions
            </Label>
          </div>

          {/* Render default questions if checkbox is checked */}
          {includeDefaultForm && <DefaultApplicationFormQuestions />}

          {/* Include custom application form */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeCustomForm"
                {...register('includeCustomForm')}
                className="text-primary-green bg-darker-gray focus:ring-primary-green h-4 w-4 rounded border-gray-600 focus:ring-2"
              />
              <Label htmlFor="includeCustomForm" className="text-white">
                Include custom application questions
              </Label>
            </div>

            {/* Custom form link input - only shows when checkbox is checked */}
            {includeCustomForm && (
              <div className="ml-7">
                <Input
                  id="customFormLink"
                  {...register('customFormLink')}
                  className="bg-darker-gray mt-4 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Add link to your custom application form"
                />
                {errors.customFormLink && (
                  <p className="mt-2 text-sm text-red-reject">{errors.customFormLink.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-green w-full rounded-lg px-12 py-3 text-lg font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Posting Job...' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
}
