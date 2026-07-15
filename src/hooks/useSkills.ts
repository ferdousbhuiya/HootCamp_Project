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

      setSkills(data.skills);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.skills));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearSkills = () => {
    setSkills([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { skills, loading, error, extractSkills, clearSkills };
}
