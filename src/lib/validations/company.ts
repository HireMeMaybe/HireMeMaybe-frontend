import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

export const companyRegisterSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .refine((val) => !!val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
  
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+?[1-9]\d{0,2}[-\s]?)?(0\d{1,2})[-\s]?(\d{3})[-\s]?(\d{4})$/,"Please enter a valid phone number"),
  
  overview: z
    .string()
    .min(1, "Company overview is required")
    .min(10, "Overview must be at least 10 characters")
    .max(1000, "Overview must be less than 1000 characters"),
  
  industry: z
    .string()
    .min(1, "Please select an industry"),
  
  companySize: z
    .string()
    .min(1, "Please select company size"),
  
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 10MB")
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only JPG, JPEG, PNG, and PDF files are allowed")
    .optional(),
  
  banner: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 10MB")
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only JPG, JPEG, PNG, and PDF files are allowed")
    .optional(),
});

export type CompanyRegisterFormData = z.infer<typeof companyRegisterSchema>;