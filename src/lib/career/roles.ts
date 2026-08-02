import { enrichRoleWithAI } from '@/lib/ai/career';
import { cleanText } from '@/lib/security/validation';
import type { JobRole } from '@/types';

/**
 * Resolve a role from job_roles (by id or title). If found and not yet
 * enriched, fill its market data via AI and persist. If not found, treat
 * as a custom role (no persistence to job_roles).
 */
export async function resolveRole(
  supabase: ReturnType<typeof import('@/lib/supabase/server').getSupabaseAdmin>,
  roleId?: string,
  roleTitle?: string
): Promise<{ role: JobRole | null; requiredSkills: string[]; enrichedNow: boolean }> {
  const title = cleanText(roleTitle, 120);
  if (!title && !roleId) return { role: null, requiredSkills: [], enrichedNow: false };

  let query = supabase.from('job_roles').select('*');
  if (roleId) {
    query = query.eq('id', roleId);
  } else {
    query = query.eq('title', title);
  }
  const { data: rows, error } = await query.limit(1);
  if (error) throw error;

  const role: JobRole | null = rows && rows.length > 0 ? rows[0] : null;

  if (role && !role.required_skills) {
    const enrichment = await enrichRoleWithAI(role.title, role.description);
    const { error: updateError } = await supabase
      .from('job_roles')
      .update({
        required_skills: enrichment.required_skills,
        salary_range: enrichment.salary_range,
        demand_level: enrichment.demand_level,
        entry_difficulty: enrichment.entry_difficulty,
      })
      .eq('id', role.id);
    if (!updateError) {
      role.required_skills = enrichment.required_skills;
      role.salary_range = enrichment.salary_range;
      role.demand_level = enrichment.demand_level;
      role.entry_difficulty = enrichment.entry_difficulty;
    }
    return { role, requiredSkills: enrichment.required_skills, enrichedNow: true };
  }

  return { role, requiredSkills: role?.required_skills || [], enrichedNow: false };
}
