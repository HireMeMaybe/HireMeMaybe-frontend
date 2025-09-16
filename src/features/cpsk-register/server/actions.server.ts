'use server';

import { cpskSchema, MAX_RESUME_SIZE } from '@/lib/validations/cpsk';
import type { CpskRegistrationResult } from '@/types/cpsk';

export async function registerCpsk(formData: FormData): Promise<CpskRegistrationResult> {
  // Handle soft_skill which can be submitted as multiple fields or a single comma-separated string
  const softSkillEntries = formData
    .getAll('soft_skill')
    .filter(Boolean)
    .map((s) => String(s));
  let soft_skill: string | string[] | undefined;
  if (softSkillEntries.length === 0) {
    const ss = formData.get('soft_skill') as string | null;
    soft_skill = ss || undefined;
  } else if (softSkillEntries.length === 1) {
    soft_skill = softSkillEntries[0];
  } else {
    soft_skill = softSkillEntries;
  }

  const payload = {
    first_name: (formData.get('first_name') as string) || undefined,
    last_name: (formData.get('last_name') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    program: (formData.get('program') as string) || undefined,
    year: (formData.get('year') as string) || undefined,
    soft_skill,
  };

  const resume = formData.get('resume') as File | null;
  if (resume && resume.size > MAX_RESUME_SIZE) {
    return {
      success: false,
      message: 'Resume too large',
      errors: [{ field: 'resume', message: 'File too large' }],
    };
  }

  const parsed = cpskSchema.safeParse(payload);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return { success: false, message: 'Validation failed', errors };
  }

  // Simulate storage / DB
  const id = `cpsk_${Date.now()}`;
  return { success: true, message: 'Registration successful', id };
}
