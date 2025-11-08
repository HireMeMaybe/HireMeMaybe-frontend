import { useState } from 'react';
import { JobService, CpskService } from '@/lib/services';
import type { ApplicationFormData } from '@/types/application';

interface UseApplicationSubmitReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitApplication: (jobId: string, data: ApplicationFormData) => Promise<boolean>;
}

export function useApplicationSubmit(): UseApplicationSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitApplication = async (jobId: string, data: ApplicationFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // If the user uploaded a new resume, upload it to CPSK first so backend has a file id
      if (data.resume instanceof File) {
        try {
          await CpskService.uploadResume(data.resume);
        } catch (err) {
          // Non-fatal: log and continue — CPSK upload may not be required for application creation
          console.warn('Resume upload failed during application submit:', err);
        }
      }

      // Fetch latest CPSK profile to obtain cpsk_id and resume_id
      let profile;
      try {
        profile = await CpskService.getProfile();
      } catch (err) {
        console.warn('Failed to fetch CPSK profile while submitting application:', err);
        profile = undefined;
      }

      // Map form questions to the expected answer payload
      const answerPayload = {
        expected_salary: '',
        id: 0,
        programming_languages: [] as string[],
        right_to_work: '',
        year_of_experience: 0,
      };

      console.log('Processing questions:', data.questions);

      if (data.questions && Array.isArray(data.questions)) {
        for (const q of data.questions) {
          const questionText = (q.question || '').toLowerCase();
          const answer = q.answer || '';

          console.log(`Question: "${q.question}"`);
          console.log(`Answer: "${answer}"`);
          console.log(`Type: ${q.type}`);

          // Match: "Which of the following statements best describes your right to work in Thailand?"
          if (questionText.includes('right to work')) {
            answerPayload.right_to_work = answer;
            console.log('✓ Mapped right_to_work:', answer);
          }
          // Match: "What's your expected monthly basic salary?"
          else if (questionText.includes('salary')) {
            answerPayload.expected_salary = answer;
            console.log('✓ Mapped expected_salary:', answer);
          }
          // Match: "How many years' experience do you have as a Software Engineer?"
          else if (questionText.includes('experience')) {
            // Parse experience from answer text
            const answerLower = answer.toLowerCase();
            if (answerLower.includes('no experience')) {
              answerPayload.year_of_experience = 0;
            } else if (answerLower.includes('less than 1')) {
              answerPayload.year_of_experience = 0;
            } else if (answerLower.includes('1-2')) {
              answerPayload.year_of_experience = 1;
            } else if (answerLower.includes('3-5')) {
              answerPayload.year_of_experience = 3;
            } else if (answerLower.includes('5+')) {
              answerPayload.year_of_experience = 5;
            } else {
              // Try to parse as number
              const parsed = parseInt(answer, 10);
              if (!Number.isNaN(parsed)) {
                answerPayload.year_of_experience = parsed;
              }
            }
            console.log('✓ Mapped year_of_experience:', answerPayload.year_of_experience);
          }
          // Match: "Which of the following programming languages are you experienced in?"
          else if (q.type === 'multiselect' || questionText.includes('programming')) {
            // Answers are stored as comma-separated string
            const languages = answer
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            answerPayload.programming_languages = languages;
            console.log('✓ Mapped programming_languages:', languages);
          }
        }
      }

      console.log('Final answer payload:', answerPayload);

      const createPayload = {
        answer: answerPayload,
        cpsk_id: profile?.id ?? '',
        post_id: Number(jobId),
        resume_id: profile?.resume_id ?? 0,
      };

      await JobService.createApplication(createPayload);
      return true;
    } catch (err) {
      console.error('Error submitting application:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitError, submitApplication };
}
