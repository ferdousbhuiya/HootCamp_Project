'use client';

import { useState, useCallback } from 'react';
import type { PortfolioFeedback, Skill, Certificate, OngoingCourse } from '@/types';

export function usePortfolioFeedback() {
  const [feedback, setFeedback] = useState<PortfolioFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = useCallback(async (
    skills: Skill[],
    certificates?: Certificate[],
    ongoingCourses?: OngoingCourse[],
    roleTitle?: string
  ): Promise<PortfolioFeedback | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/career/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          certificates: certificates || [],
          ongoingCourses: ongoingCourses || [],
          roleTitle: roleTitle || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate feedback');
      setFeedback(data.feedback);
      return data.feedback as PortfolioFeedback;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate feedback';
      setError(message.includes('All AI providers failed')
        ? 'Could not generate feedback. Please configure an AI provider in your app settings.'
        : message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { feedback, loading, error, getFeedback };
}
