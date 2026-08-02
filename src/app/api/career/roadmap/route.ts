import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { generateRoadmap } from '@/lib/ai/career';
import { resolveRole } from '@/lib/career/roles';
import type { Skill, Certificate, OngoingCourse, GapAnalysis, Roadmap } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleTitle = searchParams.get('roleTitle');
    if (!userId || !roleTitle) {
      return NextResponse.json({ error: 'User ID and role title required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .eq('role_title', roleTitle)
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json({ roadmap: null });
      throw error;
    }

    return NextResponse.json({ roadmap: rows && rows.length > 0 ? rows[0] : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch roadmap:', message, error);
    return NextResponse.json({ error: `Failed to fetch roadmap: ${message}` }, { status: 500 });
  }
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
    const gapAnalysis: GapAnalysis | undefined = body?.gapAnalysis;

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (!roleTitle && !roleId) return NextResponse.json({ error: 'Role title or role ID required' }, { status: 400 });
    if (skills.length === 0) return NextResponse.json({ error: 'No skills provided' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { role, requiredSkills } = await resolveRole(supabase, roleId, roleTitle);
    const resolvedTitle = role?.title || roleTitle;

    const roadmap: Roadmap = await generateRoadmap(
      skills,
      resolvedTitle,
      requiredSkills,
      gapAnalysis,
      certificates,
      ongoingCourses
    );

    let persisted = false;
    const { error: roadmapError } = await supabase
      .from('roadmaps')
      .upsert(
        {
          user_id: userId,
          role_title: resolvedTitle,
          desired_role_id: role?.id || null,
          phases: roadmap.phases,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,role_title' }
      )
      .select()
      .single();

    if (roadmapError) {
      console.error('Failed to persist roadmap:', roadmapError);
    } else {
      persisted = true;
    }

    return NextResponse.json({ roadmap, persisted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to generate roadmap:', message, error);
    return NextResponse.json({ error: `Failed to generate roadmap: ${message}` }, { status: 500 });
  }
}
