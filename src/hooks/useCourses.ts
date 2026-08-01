'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Course, CourseRecommendation } from '@/types';

export function useCourses() {
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch courses');
      setCatalog(data.courses || []);
    } catch (err) {
      console.error('Course catalog fetch error:', err);
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const recommend = useCallback(async (missingSkills: string[], limit = 6) => {
    if (missingSkills.length === 0) {
      setRecommendations([]);
      return;
    }
    setRecommending(true);
    setError(null);
    try {
      const response = await fetch('/api/courses/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingSkills, limit }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to recommend courses');
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Course recommend error:', err);
      setRecommendations([]);
    } finally {
      setRecommending(false);
    }
  }, []);

  return { catalog, recommendations, loading, recommending, error, fetchCatalog, recommend };
}
