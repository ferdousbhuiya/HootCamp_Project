'use client';

import { useState, useCallback } from 'react';
import type { CareerGoal, JobRole, Skill, Certificate, OngoingCourse, GapAnalysis } from '@/types';

export function useCareerGoal() {
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async (userId: string | null) => {
    if (!userId) {
      setLoading(false);
      setGoals([]);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/career/goals?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch goals');
      setGoals(data.goals || []);
    } catch (err) {
      console.error('Career goal fetch error:', err);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeGap = useCallback(async (
    userId: string,
    role: JobRole,
    skills: Skill[],
    certificates?: Certificate[],
    ongoingCourses?: OngoingCourse[]
  ): Promise<GapAnalysis | null> => {
    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/career/gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roleId: role.id,
          roleTitle: role.title,
          skills,
          certificates: certificates || [],
          ongoingCourses: ongoingCourses || [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate gap analysis');

      // Refresh saved goals so the "previously analyzed" badge + cache stay current
      await loadGoals(userId);
      return data.gapAnalysis as GapAnalysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate gap analysis';
      setError(message.includes('All AI providers failed')
        ? 'Could not generate career analysis. Please configure an AI provider in your app settings.'
        : message);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [loadGoals]);

  const findGoalForRole = useCallback((roleTitle: string): CareerGoal | undefined => {
    return goals.find((g) => g.role_title.toLowerCase() === roleTitle.toLowerCase());
  }, [goals]);

  return { goals, loading, analyzing, error, loadGoals, analyzeGap, findGoalForRole };
}
