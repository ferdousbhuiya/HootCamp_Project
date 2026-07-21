'use client';

import { useState, useEffect } from 'react';
import type { Skill } from '@/types';

const STORAGE_KEY = 'skills-pathfinder-skills';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load skills from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSkills(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const extractSkills = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/skills', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract skills');
      }

      const normalizedSkills: Skill[] = (data.skills || []).map((skill: Partial<Skill>, index: number) => ({
        id: skill.id || crypto.randomUUID(),
        name: skill.name || `Skill ${index + 1}`,
        category: skill.category || 'technical',
        confidence: typeof skill.confidence === 'number' ? skill.confidence : 0.5,
        source: skill.source || 'resume',
      }));
      setSkills(normalizedSkills);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSkills));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const persistSkills = (nextSkills: Skill[]) => {
    setSkills(nextSkills);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSkills));
  };

  const addSkill = (name: string, category = 'technical') => {
    const trimmedName = name.trim();
    if (!trimmedName || skills.some(skill => skill.name.toLowerCase() === trimmedName.toLowerCase())) return;

    persistSkills([
      ...skills,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        category,
        confidence: 1,
        source: 'resume',
      },
    ]);
  };

  const updateSkill = (id: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    persistSkills(skills.map(skill => skill.id === id ? { ...skill, name: trimmedName } : skill));
  };

  const removeSkill = (id: string) => {
    persistSkills(skills.filter(skill => skill.id !== id));
  };

  const clearSkills = () => {
    setSkills([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { skills, loading, error, extractSkills, addSkill, updateSkill, removeSkill, clearSkills };
}
