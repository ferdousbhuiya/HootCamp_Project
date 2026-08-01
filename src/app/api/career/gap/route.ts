import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { enrichRoleWithAI, generateGapAnalysis } from '@/lib/ai/career';
import type { JobRole, Skill, Certificate, OngoingCourse, GapAnalysis } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Resolve a role from job_roles (by id or title). If found and not yet
 * enriched, fill its market data via AI and persist. If not found, treat
 * as a custom role (no persistence to job_roles).
 */
async function resolveRole(
  supabase: ReturnType<typeof getSupabaseAdmin>,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = cleanText(body?.userId, 64);
    const roleId = body?.roleId ? String(body.roleId).slice(0, 64) : undefined;
    const roleTitle = cleanText(body?.roleTitle, 120);
    const skills: Skill[] = Array.isArray(body?.skills) ? body.skills : [];
    const certificates: Certificate[] = Array.isArray(body?.certificates) ? body.certificates : [];
    const ongoingCourses: OngoingCourse[] = Array.isArray(body?.ongoingCourses) ? body.ongoingCourses : [];

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (!roleTitle && !roleId) return NextResponse.json({ error: 'Role title or role ID required' }, { status: 400 });
    if (skills.length === 0) return NextResponse.json({ error: 'No skills provided' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { role, requiredSkills } = await resolveRole(supabase, roleId, roleTitle);
    const resolvedTitle = role?.title || roleTitle;

    const gapAnalysis: GapAnalysis = await generateGapAnalysis(
      skills,
      resolvedTitle,
      requiredSkills,
      certificates,
      ongoingCourses
    );

    // Upsert the goal so the analysis survives reloads
    let persisted = false;
    const { error: goalError } = await supabase
      .from('career_goals')
      .upsert(
        {
          user_id: userId,
          role_title: resolvedTitle,
          desired_role_id: role?.id || null,
          gap_analysis: gapAnalysis,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,role_title' }
      )
      .select()
      .single();

    if (goalError) {
      console.error('Failed to persist career goal:', goalError);
    } else {
      persisted = true;
    }

    return NextResponse.json({ gapAnalysis, role, persisted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to generate gap analysis:', message, error);
    return NextResponse.json({ error: `Failed to generate gap analysis: ${message}` }, { status: 500 });
  }
}
