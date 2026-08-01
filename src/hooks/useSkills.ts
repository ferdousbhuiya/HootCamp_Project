'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import type { Skill } from '@/types';

export function useSkills() {
  const { user } = useAuthContext();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setSkills([]); // Clear skills if no user
      return;
    }
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSkills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const persistSkills = async (nextSkills: Skill[]) => {
    if (!user) return;

    // Optimistic update
    setSkills(nextSkills);

    try {
      const supabase = getSupabaseClient();
      // Ensure all skills have a user_id before upserting
      const skillsWithUser = nextSkills.map(skill => ({ ...skill, user_id: user.id }));

      // Here we need to decide on a primary key for upsert. 'id' is a good candidate.
      // The onConflict needs to be on a unique column, assuming 'id' is the primary key.
      const { error: upsertError } = await supabase.from('skills').upsert(skillsWithUser);

      if (upsertError) {
        console.error('Failed to persist skills to database:', upsertError);
        setError(`Failed to save to database: ${upsertError.message}`);
        // Don't revert state - keep the skills locally even if DB fails
      }
    } catch (err) {
      console.error('Unexpected error persisting skills:', err);
      setError('Failed to save skills to database');
      // Don't revert state - keep the skills locally even if DB fails
    }
  };

  const extractSkills = async (file: File, source: 'resume' | 'certificate' | 'manual' = 'resume') => {
    if (!user) {
      setError('You must be logged in to extract skills.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('source', source);
      const response = await fetch('/api/skills', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to extract skills');

      const normalizedSkills: Skill[] = (data.skills || []).map((skill: Partial<Skill>) => ({
        id: skill.id || crypto.randomUUID(),
        user_id: skill.user_id || user.id,
        name: skill.name || 'Unnamed Skill',
        category: skill.category || 'technical',
        confidence: typeof skill.confidence === 'number' ? skill.confidence : 0.5,
        source: skill.source || source,
        verification_source: skill.verification_source || (source === 'certificate' ? 'certificate' : 'resume'),
        is_verified: skill.is_verified || (source === 'certificate'),
        certificate_id: skill.certificate_id,
        ongoing_course_id: skill.ongoing_course_id,
      }));

      // Merge new skills with existing ones, avoiding duplicates by name
      const currentSkills = [...skills];
      const skillsToadd = normalizedSkills.filter(
        newSkill => !currentSkills.some(
          existing => existing.name.toLowerCase() === newSkill.name.toLowerCase()
        )
      );

      if (skillsToadd.length > 0) {
        await persistSkills([...currentSkills, ...skillsToadd]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during extraction');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (name: string, category = 'technical') => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName || skills.some(skill => skill.name.toLowerCase() === trimmedName.toLowerCase())) return;
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: trimmedName,
      category,
      confidence: 1,
      source: 'manual',
      verification_source: 'manual',
      is_verified: false,
      user_id: user.id,
    };
    persistSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, name: string) => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    persistSkills(skills.map(skill => skill.id === id ? { ...skill, name: trimmedName } : skill));
  };

  const removeSkill = async (id: string) => {
    if (!user) return;
    const skillsBeforeDelete = [...skills];
    // Optimistic update
    setSkills(skills.filter(skill => skill.id !== id));

    const supabase = getSupabaseClient();
    const { error: deleteError } = await supabase.from('skills').delete().eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      setSkills(skillsBeforeDelete); // Revert on failure
    }
  };

  const clearSkills = () => {
    if (!user) return;
    setSkills([]);
  };

  return { skills, loading, error, extractSkills, addSkill, updateSkill, removeSkill, clearSkills, fetchSkills };
}
