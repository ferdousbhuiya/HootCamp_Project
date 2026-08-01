import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: goals, error } = await supabase
      .from('career_goals')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json({ goals: [] });
      throw error;
    }

    return NextResponse.json({ goals: goals || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch career goals:', message, error);
    return NextResponse.json({ error: `Failed to fetch career goals: ${message}` }, { status: 500 });
  }
}
