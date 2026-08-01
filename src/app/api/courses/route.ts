import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json({ courses: [] });
      throw error;
    }

    return NextResponse.json({ courses: courses || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch courses:', message, error);
    return NextResponse.json({ error: `Failed to fetch courses: ${message}` }, { status: 500 });
  }
}
