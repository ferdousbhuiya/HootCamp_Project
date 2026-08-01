import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { recommendCourses } from '@/lib/courses';
import type { Course } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const missingSkills: string[] = Array.isArray(body?.missingSkills)
      ? body.missingSkills.map((s: unknown) => cleanText(s, 80)).filter(Boolean)
      : [];
    const limit = Math.min(12, Math.max(1, Number(body?.limit) || 6));

    if (missingSkills.length === 0) {
      return NextResponse.json({ error: 'Missing skills required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: catalog, error } = await supabase.from('courses').select('*');

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json({ recommendations: [], catalogSize: 0 });
      throw error;
    }

    const courses: Course[] = catalog || [];
    const recommendations = recommendCourses(courses, missingSkills, limit);

    return NextResponse.json({ recommendations, catalogSize: courses.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to recommend courses:', message, error);
    return NextResponse.json({ error: `Failed to recommend courses: ${message}` }, { status: 500 });
  }
}
