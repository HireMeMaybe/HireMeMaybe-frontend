"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { refinedJobPostSchema } from '@/lib/validations/job-post';
import type { JobPostFormData } from '@/lib/validations/job-post';

const HIRING_TYPES = [
  "Full-time",
  "Part-time", 
  "Contract",
  "Internship",
  "Freelance"
];

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Executive"
];

export default function JobPostForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
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
      customFormLink: ''
    }
  });

  // Watch the includeCustomForm checkbox to show/hide the custom form link field
  const includeCustomForm = watch('includeCustomForm');

  const onSubmit = (data: JobPostFormData) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Job Posting</h1>

      {/* Job Details Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Job Details</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opening Position */}
          <div className="lg:col-span-2">
            <Label htmlFor="openingPosition" className="text-white">
              Opening Position <span className="text-red-500">*</span>
            </Label>
            <Input
              id="openingPosition"
              {...register('openingPosition')}
              className="mt-4 bg-darker-gray border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.openingPosition && (
              <p className="text-red-500 text-sm mt-2">{errors.openingPosition.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <Label htmlFor="description" className="text-white">
              Description of Position <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="mt-4 bg-darker-gray border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
              placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="lg:col-span-2">
            <Label htmlFor="requirements" className="text-white">
              Requirements <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              {...register('requirements')}
              className="mt-4 bg-darker-gray border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
              placeholder="List the required qualifications, skills, experience, and education..."
            />
            {errors.requirements && (
              <p className="text-red-500 text-sm mt-2">{errors.requirements.message}</p>
            )}
          </div>

          {/* Work Location */}
          <div>
            <Label htmlFor="workLocation" className="text-white">
              Work Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="workLocation"
              {...register('workLocation')}
              className="mt-4 bg-darker-gray border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g. Bangkok, Thailand"
            />
            {errors.workLocation && (
              <p className="text-red-500 text-sm mt-2">{errors.workLocation.message}</p>
            )}
          </div>

          {/* Hiring Type */}
          <div>
            <Label htmlFor="hiringType" className="text-white">
              Hiring Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="hiringType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-4 bg-darker-gray border-gray-600 text-white">
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
              <p className="text-red-500 text-sm mt-2">{errors.hiringType.message}</p>
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
              className="mt-4 bg-darker-gray border-gray-600 text-white placeholder-gray-400"
              placeholder="e.g. 50,000 - 70,000 THB/month"
            />
            {errors.salary && (
              <p className="text-red-500 text-sm mt-2">{errors.salary.message}</p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <Label htmlFor="experienceLevel" className="text-white">
              Experience Level <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="experienceLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-4 bg-darker-gray border-gray-600 text-white">
                    <SelectValue placeholder="Select Experience Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-darker-gray border-gray-600">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level} className="text-white hover:bg-gray-600">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experienceLevel && (
              <p className="text-red-500 text-sm mt-2">{errors.experienceLevel.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="lg:col-span-2">
            <Label htmlFor="tags" className="text-white">
              Tags
            </Label>
            <Input
              id="tags"
              {...register('tags')}
              className="mt-4 bg-darker-gray border-gray-600 text-white placeholder-gray-400"
              placeholder="Add tags like Frontend, Backend, DevOps..."
            />
            {errors.tags && (
              <p className="text-red-500 text-sm mt-2">{errors.tags.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Job Timing Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Job Timing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post time */}
          <div className="relative">
            <Label htmlFor="postTime" className="text-white">
              Post time
            </Label>
            <Input
              id="postTime"
              type="datetime-local"
              {...register('postTime')}
              className="mt-4 bg-darker-gray border-gray-600 text-white"
              placeholder="16 Aug 2025 07:00 AM"
            />
            {errors.postTime && (
              <p className="text-red-500 text-sm mt-2">{errors.postTime.message}</p>
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
              className="mt-4 bg-darker-gray border-gray-600 text-white"
              placeholder="dd/mm/yyyy HH:MM AM"
            />
            {errors.expiringTime && (
              <p className="text-red-500 text-sm mt-2">{errors.expiringTime.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Application Form Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Application Form (Optional)</h2>
        
        <div className="space-y-4">
          {/* Include default application form */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeDefaultForm"
              {...register('includeDefaultForm')}
              className="w-4 h-4 text-primary-green bg-darker-gray border-gray-600 rounded focus:ring-primary-green focus:ring-2"
            />
            <Label htmlFor="includeDefaultForm" className="text-white">
              Include default application form
            </Label>
          </div>

          {/* Include custom application form */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeCustomForm"
                {...register('includeCustomForm')}
                className="w-4 h-4 text-primary-green bg-darker-gray border-gray-600 rounded focus:ring-primary-green focus:ring-2"
              />
              <Label htmlFor="includeCustomForm" className="text-white ">
                Include custom application form
              </Label>
            </div>
            
            {/* Custom form link input - only shows when checkbox is checked */}
            {includeCustomForm && (
              <div className="ml-7">
                <Input
                  id="customFormLink"
                  {...register('customFormLink')}
                  className="bg-darker-gray border-gray-600 text-white placeholder-gray-400 mt-4"
                  placeholder="Add link to your custom application form"
                />
                {errors.customFormLink && (
                  <p className="text-red-500 text-sm mt-2">{errors.customFormLink.message}</p>
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
          className="bg-primary-green w-full hover:bg-green-700 text-white px-12 py-3 rounded-lg text-lg font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Posting Job...' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
}