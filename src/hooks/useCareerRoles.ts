'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JobRole } from '@/types';

export function useCareerRoles() {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/career/roles');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch roles');
      setRoles(data.roles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, error, refetch: fetchRoles };
}
