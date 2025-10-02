import { useState, useEffect } from 'react';
import { UseFormSetValue, Path, PathValue } from 'react-hook-form';

// Make the hook generic so it can accept the form's concrete value type
interface UseSoftSkillsProps<
  TFieldValues extends { soft_skill?: string | string[] | undefined } = {
    soft_skill?: string | string[] | undefined;
  },
> {
  setValue: UseFormSetValue<TFieldValues>;
  initialSkills?: string[];
}

interface UseSoftSkillsReturn {
  skillInput: string;
  skills: string[];
  setSkillInput: (value: string) => void;
  setSkills: (skills: string[]) => void;
  addSkill: (value?: string) => void;
  removeSkill: (value: string) => void;
  onSkillKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useSoftSkills<
  TFieldValues extends { soft_skill?: string | string[] | undefined } = {
    soft_skill?: string | string[] | undefined;
  },
>({ setValue, initialSkills = [] }: UseSoftSkillsProps<TFieldValues>): UseSoftSkillsReturn {
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(initialSkills);

  useEffect(() => {
    // Keep react-hook-form value in sync. We constrain TFieldValues to include
    // `soft_skill?: string[] | undefined` so the call below is correctly typed.
    setValue(
      'soft_skill' as Path<TFieldValues>,
      (skills.length > 0 ? skills : undefined) as unknown as PathValue<
        TFieldValues,
        Path<TFieldValues>
      >
    );
  }, [skills, setValue]);

  const addSkill = (value?: string) => {
    const raw = (value ?? skillInput).trim();
    if (!raw) return;
    if (skills.includes(raw)) {
      setSkillInput('');
      return;
    }
    setSkills((s) => [...s, raw]);
    setSkillInput('');
  };

  const removeSkill = (value: string) => {
    setSkills((s) => s.filter((x) => x !== value));
  };

  const onSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
    // Removed Backspace handler to prevent accidental deletion of skills
  };

  return {
    skillInput,
    skills,
    setSkillInput,
    setSkills,
    addSkill,
    removeSkill,
    onSkillKeyDown,
  };
}
