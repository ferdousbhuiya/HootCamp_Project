'use client';

import { useState, useCallback } from 'react';
import type { GoalProgress } from '@/types';

export function useGoalProgress() {
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async (userId: string | null) => {
    if (!userId) {
      setProgress(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/career/goal-progress?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch goal progress');
      setProgress(data.progress || null);
    } catch (err) {
      console.error('Goal progress fetch error:', err);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setActiveGoal = useCallback(async (userId: string, roleTitle: string): Promise<GoalProgress | null> => {
    setSetting(true);
    setError(null);
    try {
      const response = await fetch('/api/career/goal-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to set active goal');
      setProgress(data.progress || null);
      return data.progress as GoalProgress;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set active goal';
      setError(message);
      return null;
    } finally {
      setSetting(false);
    }
  }, []);

  return { progress, loading, setting, error, loadProgress, setActiveGoal };
}
