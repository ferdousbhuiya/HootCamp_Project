import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: roles, error } = await supabase
      .from('job_roles')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      // Table missing (migration not run) → empty list, not a crash
      if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json({ roles: [] });
      throw error;
    }

    return NextResponse.json({ roles: roles || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch job roles:', message, error);
    return NextResponse.json({ error: `Failed to fetch job roles: ${message}` }, { status: 500 });
  }
}
