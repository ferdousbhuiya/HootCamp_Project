'use client';

import { useState } from 'react';
import type { Skill } from '@/types';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (!response.ok) throw new Error('Failed to extract skills');

      const data = await response.json();
      setSkills(data.skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { skills, loading, error, extractSkills };
}
