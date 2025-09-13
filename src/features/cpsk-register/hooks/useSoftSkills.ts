import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';

interface UseSoftSkillsProps {
  setValue: UseFormSetValue<any>;
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

export function useSoftSkills({
  setValue,
  initialSkills = [],
}: UseSoftSkillsProps): UseSoftSkillsReturn {
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(initialSkills);

  useEffect(() => {
    // keep react-hook-form value in sync
    setValue('soft_skill', skills.length > 0 ? skills : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills]);

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
    } else if (e.key === 'Backspace' && skillInput === '' && skills.length) {
      // remove last and place it into input for quick edit
      const last = skills[skills.length - 1];
      setSkills((s) => s.slice(0, -1));
      setSkillInput(last);
    }
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
