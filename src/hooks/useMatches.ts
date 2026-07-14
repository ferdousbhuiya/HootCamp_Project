'use client';

import { useState } from 'react';
import type { Match, Skill } from '@/types';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findJobMatches = async (skills: Skill[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, matchType: 'job' }),
      });

      if (!response.ok) throw new Error('Failed to find matches');

      const data = await response.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, findJobMatches };
}
