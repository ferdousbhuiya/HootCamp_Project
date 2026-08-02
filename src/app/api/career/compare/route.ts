import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { generateGapAnalysis } from '@/lib/ai/career';
import { resolveRole } from '@/lib/career/roles';
import { recommendCourses } from '@/lib/courses';
import type { Skill, Certificate, OngoingCourse, RoleComparison, CareerGoal } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface CompareRoleInput {
  roleId?: string;
  roleTitle?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = cleanText(body?.userId, 64);
    const rawRoles: CompareRoleInput[] = Array.isArray(body?.roles) ? body.roles.slice(0, 3) : [];
    const skills: Skill[] = Array.isArray(body?.skills) ? body.skills : [];
    const certificates: Certificate[] = Array.isArray(body?.certificates) ? body.certificates : [];
    const ongoingCourses: OngoingCourse[] = Array.isArray(body?.ongoingCourses) ? body.ongoingCourses : [];

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (rawRoles.length < 2) return NextResponse.json({ error: 'Select at least 2 roles to compare' }, { status: 400 });
    if (skills.length === 0) return NextResponse.json({ error: 'No skills provided' }, { status: 400 });

    // Dedupe roles by lowercase title
    const seen = new Set<string>();
    const roles = rawRoles.filter((r) => {
      const key = (cleanText(r.roleTitle, 120) || r.roleId || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const supabase = getSupabaseAdmin();

    // Load cached gap analyses + course catalog once
    const [goalsR, coursesR] = await Promise.all([
      supabase.from('career_goals').select('*').eq('user_id', userId),
      supabase.from('courses').select('*'),
    ]);
    const goals: CareerGoal[] = (goalsR.error ? [] : goalsR.data) || [];
    const catalog = (coursesR.error ? [] : coursesR.data) || [];
    const goalByTitle = new Map(goals.map((g) => [g.role_title.toLowerCase(), g]));

    const comparisons: RoleComparison[] = [];

    // Sequential — avoid provider rate-limit cascades through the fallback chain
    for (const input of roles) {
      const roleTitle = cleanText(input.roleTitle, 120);

      // Reuse cached gap analysis if present
      const cachedGoal = roleTitle ? goalByTitle.get(roleTitle.toLowerCase()) : undefined;
      if (cachedGoal?.gap_analysis) {
        const gap = cachedGoal.gap_analysis;
        // Enrich the cached role with market data from job_roles (salary/demand)
        let cachedRole: { id: string; title: string; description?: string; salary_range?: string; demand_level?: string; entry_difficulty?: string; created_at: string } = {
          id: cachedGoal.desired_role_id || '',
          title: cachedGoal.role_title,
          created_at: cachedGoal.updated_at || new Date().toISOString(),
        };
        if (cachedGoal.desired_role_id) {
          const { data: roleRows } = await supabase
            .from('job_roles')
            .select('id, title, description, salary_range, demand_level, entry_difficulty, created_at')
            .eq('id', cachedGoal.desired_role_id)
            .limit(1);
          if (roleRows && roleRows.length > 0) {
            cachedRole = roleRows[0] as typeof cachedRole;
          }
        }
        comparisons.push({
          role: cachedRole as import('@/types').JobRole,
          gap,
          courses: recommendCourses(catalog, gap.missing_skills, 4),
          cached: true,
        });
        continue;
      }

      const { role, requiredSkills } = await resolveRole(supabase, input.roleId, roleTitle);
      const resolvedTitle = role?.title || roleTitle;
      const gap = await generateGapAnalysis(skills, resolvedTitle, requiredSkills, certificates, ongoingCourses);

      // Persist so the next compare is cached
      await supabase
        .from('career_goals')
        .upsert(
          {
            user_id: userId,
            role_title: resolvedTitle,
            desired_role_id: role?.id || null,
            gap_analysis: gap,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,role_title' }
        );

      comparisons.push({
        role: role || {
          id: '',
          title: resolvedTitle,
          description: '',
          created_at: new Date().toISOString(),
        },
        gap,
        courses: recommendCourses(catalog, gap.missing_skills, 4),
        cached: false,
      });
    }

    return NextResponse.json({ comparisons });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to compare roles:', message, error);
    return NextResponse.json({ error: `Failed to compare roles: ${message}` }, { status: 500 });
  }
}
