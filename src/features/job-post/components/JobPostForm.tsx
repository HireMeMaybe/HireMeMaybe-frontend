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
import { useState, KeyboardEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { JobService } from '@/lib/services/job.service';
import { useRouter } from 'next/navigation';

const JOB_TYPES = ['Onsite', 'Hybrid', 'Remote'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

const SALARY_RANGES = [
  'Less than 15,000',
  '15,000 - 30,000',
  '30,000 - 50,000',
  '50,000 - 80,000',
  '80,000 - 120,000',
  'More than 120,000',
];

export default function JobPostForm() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update minimum date/time periodically to prevent selecting past times
  useEffect(() => {
    const updateMinDateTime = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setMinDateTime(now.toISOString().slice(0, 16));
    };

    updateMinDateTime(); // Set initial value
    const interval = setInterval(updateMinDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
      expiringTime: '',
      includeDefaultForm: false,
      includeCustomForm: false,
      customFormLink: '',
    },
  });

  const includeDefaultForm = watch('includeDefaultForm');
  const includeCustomForm = watch('includeCustomForm');

  const handleExpiringTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const selectedDate = new Date(selectedValue);
      const now = new Date();

      if (selectedDate <= now) {
        // Clear the invalid value
        setValue('expiringTime', '');
        // You could also show an alert or toast here
        alert('Please select a future date and time');
        return;
      }
    }
    setValue('expiringTime', selectedValue);
  };

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

  const onSubmit = async (data: JobPostFormData) => {
    try {
      setError(null);

      // Convert expiring time to ISO 8601 format with timezone if provided
      let expiringISO: string | undefined;
      if (data.expiringTime) {
        const expiringDate = new Date(data.expiringTime);
        expiringISO = expiringDate.toISOString(); // Converts to "2006-01-02T15:04:05.000Z" format
      }

      // Map form data to API format
      const optionalForms =
        data.includeCustomForm && data.customFormLink ? [data.customFormLink] : undefined;

      const jobPostData = {
        title: data.openingPosition,
        desc: data.description,
        exp_lvl: data.experienceLevel,
        location: data.workLocation,
        type: data.hiringType,
        req: data.requirements,
        tags: data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        ...(expiringISO && { expiring: expiringISO }),
        ...(data.salary && { salary: data.salary }),
        default_form: data.includeDefaultForm ?? false,
        optional_forms: optionalForms,
      };

      // Call the API
      const result = await JobService.createJobPost(jobPostData);

      // Success - redirect or show success message
      console.log('Job post created successfully:', result);

      // Redirect to job details page or company dashboard
      router.push(`/job-post/${result.id}`);
    } catch (err) {
      console.error('Error creating job post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create job post');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="mb-8 text-3xl font-bold text-white">Job Posting</h1>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-900/20 p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

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
              <p className="text-red-reject mt-2 text-sm">{errors.openingPosition.message}</p>
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
              <p className="text-red-reject mt-2 text-sm">{errors.description.message}</p>
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
              <p className="text-red-reject mt-2 text-sm">{errors.requirements.message}</p>
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
              <p className="text-red-reject mt-2 text-sm">{errors.workLocation.message}</p>
            )}
          </div>

          {/* Job Type */}
          <div>
            <Label htmlFor="hiringType" className="text-white">
              Job Type <span className="text-red-reject">*</span>
            </Label>
            <Controller
              name="hiringType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-darker-gray mt-4 border-gray-600 text-white">
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-darker-gray border-gray-600">
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-gray-600">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.hiringType && (
              <p className="text-red-reject mt-2 text-sm">{errors.hiringType.message}</p>
            )}
          </div>

          {/* Salary */}
          <div>
            <Label htmlFor="salary" className="text-white">
              Salary (Optional)
            </Label>
            <Controller
              name="salary"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-darker-gray mt-4 border-gray-600 text-white">
                    <SelectValue placeholder="Select Salary Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-darker-gray border-gray-600">
                    {SALARY_RANGES.map((range) => (
                      <SelectItem
                        key={range}
                        value={range}
                        className="text-white hover:bg-gray-600"
                      >
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.salary && (
              <p className="text-red-reject mt-2 text-sm">{errors.salary.message}</p>
            )}
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
              <p className="text-red-reject mt-2 text-sm">{errors.experienceLevel.message}</p>
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
            {errors.tags && <p className="text-red-reject mt-2 text-sm">{errors.tags.message}</p>}
          </div>
        </div>
      </Card>

      {/* Job Timing Card */}
      <Card className="bg-very-dark-gray border-background p-9">
        <h2 className="text-2xl font-semibold text-white">Job Timing</h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Expiring Time */}
          <div className="relative">
            <Label htmlFor="expiringTime" className="text-white">
              Expiring Time (Optional)
            </Label>
            <Input
              id="expiringTime"
              type="datetime-local"
              {...register('expiringTime')}
              onChange={handleExpiringTimeChange}
              min={minDateTime}
              className="bg-darker-gray mt-4 border-gray-600 text-white"
              placeholder="dd/mm/yyyy HH:MM AM"
            />
            {errors.expiringTime && (
              <p className="text-red-reject mt-2 text-sm">{errors.expiringTime.message}</p>
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
                  <p className="text-red-reject mt-2 text-sm">{errors.customFormLink.message}</p>
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
