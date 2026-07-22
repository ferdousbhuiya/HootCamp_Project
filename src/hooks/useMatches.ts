'use client';

import { useCallback, useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import type { Match, Skill } from '@/types';

export function useMatches() {
  const { user } = useAuthContext();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const findJobMatches = useCallback(async (
    skills: Skill[],
    matchType: 'job' | 'learning_path' | 'credential' = 'job'
  ) => {
    if (!user) {
      setError('You must be logged in to find matches.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, matchType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find matches');
      }

      const newMatches = (data.matches || []).map((match: Match) => ({...match, user_id: user.id}));

      if (newMatches.length > 0) {
        const supabase = getSupabaseClient();
        // Clear old matches for this type before inserting new ones
        await supabase.from('matches').delete().eq('user_id', user.id).eq('type', matchType);
        const { error: insertError } = await supabase.from('matches').insert(newMatches);
        if (insertError) throw insertError;
      }

      // Fetch all matches again to update the UI
      await fetchMatches();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, fetchMatches]);

  return { matches, loading, error, findJobMatches };
}
