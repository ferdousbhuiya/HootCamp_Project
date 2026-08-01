'use client';

import { useState, useCallback } from 'react';
import type { Roadmap, JobRole, Skill, Certificate, OngoingCourse, GapAnalysis } from '@/types';

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoadmap = useCallback(async (userId: string, roleTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/career/roadmap?userId=${encodeURIComponent(userId)}&roleTitle=${encodeURIComponent(roleTitle)}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch roadmap');
      setRoadmap(data.roadmap || null);
    } catch (err) {
      console.error('Roadmap fetch error:', err);
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateRoadmap = useCallback(async (
    userId: string,
    role: JobRole,
    skills: Skill[],
    gapAnalysis?: GapAnalysis,
    certificates?: Certificate[],
    ongoingCourses?: OngoingCourse[]
  ): Promise<Roadmap | null> => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roleId: role.id,
          roleTitle: role.title,
          skills,
          certificates: certificates || [],
          ongoingCourses: ongoingCourses || [],
          gapAnalysis: gapAnalysis || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate roadmap');
      setRoadmap(data.roadmap || null);
      return data.roadmap as Roadmap;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate roadmap';
      setError(message.includes('All AI providers failed')
        ? 'Could not generate roadmap. Please configure an AI provider in your app settings.'
        : message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { roadmap, loading, generating, error, loadRoadmap, generateRoadmap };
}
