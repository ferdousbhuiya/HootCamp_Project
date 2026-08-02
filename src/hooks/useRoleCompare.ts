'use client';

import { useState, useCallback } from 'react';
import type { RoleComparison, Skill, Certificate, OngoingCourse } from '@/types';

export function useRoleCompare() {
  const [comparisons, setComparisons] = useState<RoleComparison[]>([]);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareRoles = useCallback(async (
    userId: string,
    roles: { roleId?: string; roleTitle: string }[],
    skills: Skill[],
    certificates?: Certificate[],
    ongoingCourses?: OngoingCourse[]
  ): Promise<RoleComparison[] | null> => {
    setComparing(true);
    setError(null);
    try {
      const response = await fetch('/api/career/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roles,
          skills,
          certificates: certificates || [],
          ongoingCourses: ongoingCourses || [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to compare roles');
      setComparisons(data.comparisons || []);
      return data.comparisons as RoleComparison[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to compare roles';
      setError(message.includes('All AI providers failed')
        ? 'Could not compare roles. Please configure an AI provider in your app settings.'
        : message);
      return null;
    } finally {
      setComparing(false);
    }
  }, []);

  return { comparisons, comparing, error, compareRoles };
}
