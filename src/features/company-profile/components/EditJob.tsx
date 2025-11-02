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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { refinedJobPostSchema } from '@/lib/validations/job-post';
import type { JobPostFormData } from '@/lib/validations/job-post';
import { useState, KeyboardEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { JobService, type JobPostDetail } from '@/lib/services/job.service';

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

interface EditJobModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly jobId: number;
  readonly onSuccess?: () => void;
}

export default function EditJobModal({ isOpen, onClose, jobId, onSuccess }: EditJobModalProps) {
  const [job, setJob] = useState<JobPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch job details when modal opens
  useEffect(() => {
    if (isOpen && jobId) {
      const fetchJobDetails = async () => {
        try {
          setIsLoading(true);
          const jobDetails = await JobService.getJobPostById(jobId.toString());
          setJob(jobDetails);
          setTags(jobDetails.tags || []);
        } catch (err) {
          console.error('Failed to fetch job details:', err);
          setError(err instanceof Error ? err.message : 'Failed to load job details');
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [isOpen, jobId]);

  // Update minimum date/time periodically to prevent selecting past times
  useEffect(() => {
    const updateMinDateTime = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setMinDateTime(now.toISOString().slice(0, 16));
    };

    updateMinDateTime();
    const interval = setInterval(updateMinDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Convert expiring date to datetime-local format
  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
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

  // Reset form when job data is loaded
  useEffect(() => {
    if (job) {
      reset({
        openingPosition: job.title || '',
        description: job.desc || '',
        requirements: job.req || '',
        workLocation: job.location || '',
        hiringType: job.type || '',
        salary: job.salary || '',
        experienceLevel: job.exp_lvl || '',
        tags: job.tags?.join(', ') || '',
        expiringTime: formatDateTimeLocal(job.expiring),
        includeDefaultForm: false,
        includeCustomForm: false,
        customFormLink: '',
      });
      setTags(job.tags || []);
    }
  }, [job, reset]);

  const handleExpiringTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const selectedDate = new Date(selectedValue);
      const now = new Date();

      if (selectedDate <= now) {
        setValue('expiringTime', '');
        setError('Please select a future date and time');
        setTimeout(() => setError(null), 3000);
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
    if (!job) return;

    try {
      setError(null);

      // Convert expiring time to ISO 8601 format with timezone if provided
      let expiringISO: string | undefined;
      if (data.expiringTime) {
        const expiringDate = new Date(data.expiringTime);
        expiringISO = expiringDate.toISOString();
      }

      // Map form data to API format
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
      };

      // Call the API to update job post
      await JobService.updateJobPost(job.id.toString(), jobPostData);

      // Close modal and trigger success callback
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating job post:', err);
      setError(err instanceof Error ? err.message : 'Failed to update job post');
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background max-h-[90vh] max-w-4xl overflow-y-auto border-zinc-700 text-white">
        <DialogTitle className="text-2xl font-bold text-white">Edit Job Post</DialogTitle>
        <DialogDescription className="sr-only">
          Edit the details of your job posting
        </DialogDescription>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-white">Loading job details...</p>
            </div>
          </div>
        ) : !job ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500">Failed to load job details</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-500 bg-red-900/20 p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Opening Position */}
              <div>
                <Label htmlFor="openingPosition" className="text-white">
                  Opening Position <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="openingPosition"
                  {...register('openingPosition')}
                  className="bg-darker-gray mt-2 border-gray-600 text-white placeholder-gray-400"
                  placeholder="e.g. Senior Software Engineer"
                />
                {errors.openingPosition && (
                  <p className="mt-2 text-sm text-red-500">{errors.openingPosition.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-white">
                  Description of Position <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="bg-darker-gray mt-2 min-h-32 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Requirements */}
              <div>
                <Label htmlFor="requirements" className="text-white">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  className="bg-darker-gray mt-2 min-h-32 border-gray-600 text-white placeholder-gray-400"
                  placeholder="List the key requirements, skills, and qualifications needed..."
                />
                {errors.requirements && (
                  <p className="mt-2 text-sm text-red-500">{errors.requirements.message}</p>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Work Location */}
                <div>
                  <Label htmlFor="workLocation" className="text-white">
                    Work Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="workLocation"
                    {...register('workLocation')}
                    className="bg-darker-gray mt-2 border-gray-600 text-white placeholder-gray-400"
                    placeholder="e.g. Bangkok, Thailand"
                  />
                  {errors.workLocation && (
                    <p className="mt-2 text-sm text-red-500">{errors.workLocation.message}</p>
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
                        <SelectTrigger className="bg-darker-gray mt-2 border-gray-600 text-white">
                          <SelectValue placeholder="Select hiring type" />
                        </SelectTrigger>
                        <SelectContent className="bg-darker-gray border-gray-600">
                          {JOB_TYPES.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-white hover:bg-gray-700"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.hiringType && (
                    <p className="mt-2 text-sm text-red-500">{errors.hiringType.message}</p>
                  )}
                </div>

                {/* Salary Range */}
                <div>
                  <Label htmlFor="salary" className="text-white">
                    Salary Range (THB)
                  </Label>
                  <Controller
                    name="salary"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-darker-gray mt-2 border-gray-600 text-white">
                          <SelectValue placeholder="Select salary range" />
                        </SelectTrigger>
                        <SelectContent className="bg-darker-gray border-gray-600">
                          {SALARY_RANGES.map((range) => (
                            <SelectItem
                              key={range}
                              value={range}
                              className="text-white hover:bg-gray-700"
                            >
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.salary && (
                    <p className="mt-2 text-sm text-red-500">{errors.salary.message}</p>
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
                        <SelectTrigger className="bg-darker-gray mt-2 border-gray-600 text-white">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent className="bg-darker-gray border-gray-600">
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem
                              key={level}
                              value={level}
                              className="text-white hover:bg-gray-700"
                            >
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.experienceLevel && (
                    <p className="mt-2 text-sm text-red-500">{errors.experienceLevel.message}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags" className="text-white">
                  Tags
                </Label>
                <div className="mt-2">
                  {tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-sm text-white"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="bg-darker-gray border-gray-600 text-white placeholder-gray-400"
                    placeholder="Type a tag and press Enter"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Press Enter after typing each tag</p>
              </div>

              {/* Expiring Time */}
              <div>
                <Label htmlFor="expiringTime" className="text-white">
                  Expiring Time
                </Label>
                <Input
                  id="expiringTime"
                  type="datetime-local"
                  {...register('expiringTime')}
                  onChange={handleExpiringTimeChange}
                  min={minDateTime}
                  className="bg-darker-gray relative mt-2 border-gray-600 pr-10 text-white placeholder-gray-400"
                />
                {errors.expiringTime && (
                  <p className="mt-2 text-sm text-red-500">{errors.expiringTime.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Optional: Set when this job posting will expire
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-zinc-700 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="cursor-pointer bg-gray-600 px-6 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-green cursor-pointer px-6 text-white hover:bg-green-700"
              >
                {isSubmitting ? 'Updating...' : 'Update Job Post'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
