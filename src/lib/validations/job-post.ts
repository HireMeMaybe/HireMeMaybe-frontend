import { z } from 'zod';

export const jobPostSchema = z.object({
  openingPosition: z
    .string()
    .min(1, 'Opening position is required')
    .min(3, 'Position title must be at least 3 characters')
    .max(100, 'Position title must be less than 100 characters'),

  description: z
    .string()
    .min(1, 'Job description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),

  requirements: z
    .string()
    .min(1, 'Requirements are required')
    .min(10, 'Requirements must be at least 10 characters')
    .max(1500, 'Requirements must be less than 1500 characters'),

  workLocation: z
    .string()
    .min(1, 'Work location is required')
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location must be less than 100 characters'),

  hiringType: z.string().min(1, 'Please select a hiring type'),

  salary: z.string().optional().or(z.literal('')),

  experienceLevel: z.string().min(1, 'Please select an experience level'),

  tags: z.string().min(1, 'Tags are required').max(200, 'Tags must be less than 200 characters'),

  expiringTime: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        const selectedDate = new Date(val);
        const now = new Date();
        return selectedDate > now;
      },
      {
        message: 'Expiring time must be after the current date and time',
      }
    ),

  includeDefaultForm: z.boolean().optional(),
  includeCustomForm: z.boolean().optional(),

  customFormLink: z
    .string()
    .refine((val) => val === '' || /^https?:\/\/.+\..+/.test(val), {
      message: 'Please enter a valid URL',
    })
    .optional()
    .or(z.literal('')),
});

// Refined schema to validate custom form link only when custom form is enabled
export const refinedJobPostSchema = jobPostSchema.refine(
  (data) => {
    if (data.includeCustomForm && !data.customFormLink) {
      return false;
    }
    return true;
  },
  {
    message: 'Custom form link is required when custom form is enabled',
    path: ['customFormLink'],
  }
);

export type JobPostFormData = z.infer<typeof jobPostSchema>;
