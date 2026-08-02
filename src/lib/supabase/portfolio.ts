import type {
  Skill,
  Certificate,
  OngoingCourse,
  CareerGoal,
  Roadmap,
  Match,
} from '@/types';

export interface UserPortfolio {
  skills: Skill[];
  certificates: Certificate[];
  courses: OngoingCourse[];
  goals: CareerGoal[];
  roadmaps: Roadmap[];
  matches: Match[];
}

function isTableMissing(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

/** Fetches the full per-user portfolio with graceful empty results on missing tables. */
export async function fetchUserPortfolio(
  supabase: ReturnType<typeof import('@/lib/supabase/server').getSupabaseAdmin>,
  userId: string
): Promise<UserPortfolio> {
  const [skillsR, certsR, coursesR, goalsR, roadmapsR, matchesR] = await Promise.all([
    supabase.from('skills').select('*').eq('user_id', userId).order('confidence', { ascending: false }),
    supabase.from('certificates').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('ongoing_courses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('career_goals').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('roadmaps').select('*').eq('user_id', userId),
    supabase.from('matches').select('*').eq('user_id', userId).order('match_score', { ascending: false }),
  ]);

  return {
    skills: (skillsR.error ? [] : skillsR.data) || [],
    certificates: (certsR.error ? [] : certsR.data) || [],
    courses: (coursesR.error ? [] : coursesR.data) || [],
    goals: (goalsR.error ? [] : goalsR.data) || [],
    roadmaps: (roadmapsR.error ? [] : roadmapsR.data) || [],
    matches: (matchesR.error ? [] : matchesR.data) || [],
  };
}

/** Fetch the active goal (is_active = true) or null. */
export async function fetchActiveGoal(
  supabase: ReturnType<typeof import('@/lib/supabase/server').getSupabaseAdmin>,
  userId: string
): Promise<CareerGoal | null> {
  const { data, error } = await supabase
    .from('career_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0];
}
