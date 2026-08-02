import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { fetchActiveGoal, fetchUserPortfolio } from '@/lib/supabase/portfolio';
import { computeGoalProgress } from '@/lib/goalProgress';
import { computePortfolioScore } from '@/lib/portfolioScore';
import type { CareerGoal, GoalBaseline } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function requiredSkillsFor(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  goal: CareerGoal
): Promise<string[]> {
  if (goal.desired_role_id) {
    const { data } = await supabase.from('job_roles').select('required_skills').eq('id', goal.desired_role_id).limit(1);
    const skills = data?.[0]?.required_skills;
    if (Array.isArray(skills)) return skills;
  }
  // Fall back to baseline's match skill approximation (missing skills known at capture)
  if (goal.baseline) {
    const required = (goal.baseline as GoalBaseline).skills || [];
    if (required.length > 0) return required;
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const goal = await fetchActiveGoal(supabase, userId);
    if (!goal) return NextResponse.json({ progress: null });

    const portfolio = await fetchUserPortfolio(supabase, userId);
    const roadmap = portfolio.roadmaps.find((r) => r.role_title.toLowerCase() === goal.role_title.toLowerCase()) || null;
    const requiredSkills = await requiredSkillsFor(supabase, goal);

    const progress = computeGoalProgress({
      skills: portfolio.skills,
      certificates: portfolio.certificates,
      courses: portfolio.courses,
      goal,
      roadmap,
      requiredSkills,
    });

    return NextResponse.json({ progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch goal progress:', message, error);
    return NextResponse.json({ error: `Failed to fetch goal progress: ${message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = cleanText(body?.userId, 64);
    const roleTitle = cleanText(body?.roleTitle, 120);

    if (!userId || !roleTitle) {
      return NextResponse.json({ error: 'User ID and role title required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find the goal row for this role
    const { data: goalRows } = await supabase
      .from('career_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('role_title', roleTitle)
      .limit(1);
    const goal: CareerGoal | null = goalRows && goalRows.length > 0 ? goalRows[0] : null;
    if (!goal) {
      return NextResponse.json({ error: 'Analyze this role first before setting it as your goal' }, { status: 400 });
    }

    // Clear any existing active goal FIRST (partial unique index constraint)
    await supabase
      .from('career_goals')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Capture baseline from current portfolio
    const portfolio = await fetchUserPortfolio(supabase, userId);
    const portfolioScore = computePortfolioScore(portfolio.skills, portfolio.certificates, portfolio.courses).score;
    const baseline: GoalBaseline = {
      skills: portfolio.skills.map((s) => s.name.trim()).filter(Boolean).slice(0, 60),
      portfolio_score: portfolioScore,
      match_score: goal.gap_analysis?.match_score ?? 0,
      courses: portfolio.courses
        .filter((c) => c.status === 'completed')
        .map((c) => c.course_name.trim())
        .filter(Boolean),
      captured_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('career_goals')
      .update({
        is_active: true,
        baseline,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goal.id);

    if (upsertError) throw upsertError;

    // Recompute progress for the newly active goal
    const requiredSkills = await requiredSkillsFor(supabase, goal);
    const roadmap = portfolio.roadmaps.find((r) => r.role_title.toLowerCase() === roleTitle.toLowerCase()) || null;
    const updatedGoal = { ...goal, is_active: true, baseline };
    const progress = computeGoalProgress({
      skills: portfolio.skills,
      certificates: portfolio.certificates,
      courses: portfolio.courses,
      goal: updatedGoal,
      roadmap,
      requiredSkills,
    });

    return NextResponse.json({ progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to set active goal:', message, error);
    return NextResponse.json({ error: `Failed to set active goal: ${message}` }, { status: 500 });
  }
}
