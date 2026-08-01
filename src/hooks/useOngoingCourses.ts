'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import type { OngoingCourse } from '@/types';

export function useOngoingCourses() {
  const { user } = useAuthContext();
  const [courses, setCourses] = useState<OngoingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setCourses([]);
      return;
    }
    
    // Skip API calls if we know tables don't exist
    if (tablesExist === false) {
      setLoading(false);
      setCourses([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/ongoing-courses?userId=${user.id}`);
      const data = await response.json();
      if (!response.ok) {
        // If it's a 500 error, assume table doesn't exist and skip future calls
        if (response.status === 500) {
          console.log('Ongoing courses table may not exist yet, skipping future calls');
          setTablesExist(false);
          setCourses([]);
          return;
        }
        throw new Error(data.error || 'Failed to fetch ongoing courses');
      }
      setTablesExist(true);
      setCourses(data.courses || []);
    } catch (err) {
      // Silently handle errors - don't show error state for missing tables
      console.error('Ongoing courses fetch error:', err);
      setTablesExist(false);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user, tablesExist]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const addCourse = useCallback(async (courseData: {
    courseName: string;
    provider?: string;
    platform?: string;
    startDate?: string;
    expectedCompletionDate?: string;
    progress?: number;
    status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    url?: string;
    description?: string;
  }) => {
    if (!user) {
      setError('You must be logged in to add courses.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ongoing-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...courseData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add course');
      await fetchCourses();
      return data.course;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add course');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCourses]);

  const updateCourse = useCallback(async (courseId: string, courseData: {
    courseName?: string;
    provider?: string;
    platform?: string;
    startDate?: string;
    expectedCompletionDate?: string;
    progress?: number;
    status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    url?: string;
    description?: string;
  }) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ongoing-courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...courseData }),
      });
      if (!response.ok) throw new Error('Failed to update course');
      await fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setLoading(false);
    }
  }, [user, fetchCourses]);

  const deleteCourse = useCallback(async (courseId: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ongoing-courses?courseId=${courseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete course');
      await fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  }, [user, fetchCourses]);

  return { courses, loading, error, addCourse, updateCourse, deleteCourse, refetch: fetchCourses };
}
