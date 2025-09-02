import { z } from 'zod';

export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_RESUME_TYPES = ['application/pdf'];

const PHONE_REGEX = /^([+]?\d{1,3}[-\s]?)?\d{7,14}$/; // permissive international phone

export const cpskSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),

  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => PHONE_REGEX.test(val), {
      message: 'Please enter a valid phone number',
    }),

  program: z.string().min(1, 'Please select a program'),

  year: z.string().min(1, 'Please select year'),

  // soft_skill: accept string (comma separated) or array
  soft_skill: z
    .union([
      z.string().transform((s) =>
        typeof s === 'string'
          ? s
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : []
      ),
      z.array(z.string()),
    ])
    .optional(),

  resume: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_RESUME_SIZE, 'Resume must be less than 5MB')
    .refine((file) => ACCEPTED_RESUME_TYPES.includes(file.type), 'Only PDF files are allowed')
    .optional(),
});

export type CpskFormData = z.infer<typeof cpskSchema>;
