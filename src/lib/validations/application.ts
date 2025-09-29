import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const applicationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  surname: z
    .string()
    .min(1, 'Surname is required')
    .min(2, 'Surname must be at least 2 characters')
    .max(50, 'Surname must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .refine((val) => !!val, { message: 'Please enter a valid email address' }),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^(\+?[1-9]\d{0,2}[-\s]?)?(0\d{1,2})[-\s]?(\d{3})[-\s]?(\d{4})$/,
      'Please enter a valid phone number'
    ),

  major: z.enum(['CPE', 'SKE'], {
    message: 'Please select a major',
  }),

  educationLevel: z.string().min(1, 'Please select education level'),

  resume: z
    .instanceof(File, { message: 'Resume is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PDF, DOC, and DOCX files are allowed'
    )
    .nullable(),

  softSkills: z
    .array(z.string().min(1, 'Soft skill cannot be empty'))
    .min(1, 'Please add at least one soft skill'),

  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        type: z.string(),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
        answer: z.string().min(1, 'This question is required'),
      })
    )
    .optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;