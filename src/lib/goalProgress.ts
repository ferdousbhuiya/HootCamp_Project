import type { Skill, Certificate, OngoingCourse, CareerGoal, Roadmap, GoalProgress } from '@/types';
import { computePortfolioScore } from '@/lib/portfolioScore';

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function present(skillName: string, skills: Skill[]): boolean {
  const n = normalize(skillName);
  return skills.some((s) => {
    const sn = normalize(s.name);
    return sn === n || sn.includes(n) || n.includes(sn);
  });
}

/**
 * Deterministic progress computation for the active goal. No AI — pure
 * comparison of the current portfolio against the baseline captured at
 * activation.
 */
export function computeGoalProgress(args: {
  skills: Skill[];
  certificates: Certificate[];
  courses: OngoingCourse[];
  goal: CareerGoal;
  roadmap?: Roadmap | null;
  requiredSkills: string[];
}): GoalProgress {
  const { skills, certificates, courses, goal, roadmap, requiredSkills } = args;
  const baseline = goal.baseline || {
    skills: [],
    portfolio_score: 0,
    match_score: 0,
    courses: [],
    captured_at: goal.created_at || new Date().toISOString(),
  };

  const baselineSkills = new Set(baseline.skills.map(normalize));
  const baselineCourses = new Set(baseline.courses.map(normalize));

  // Coverage = % of required skills present now
  const presentRequired = requiredSkills.filter((r) => present(r, skills));
  const coverage = requiredSkills.length > 0
    ? Math.round((presentRequired.length / requiredSkills.length) * 100)
    : 0;

  // New skills since baseline
  const currentSkillNames = skills.map((s) => s.name.trim());
  const skillsAcquired = currentSkillNames.filter((n) => n && !baselineSkills.has(normalize(n)));
  const goalSkillsAcquired = skillsAcquired.filter((n) => requiredSkills.some((r) => {
    const rn = normalize(r);
    const nn = normalize(n);
    return nn === rn || nn.includes(rn) || rn.includes(nn);
  }));

  // Courses completed since baseline
  const completedNow = courses.filter((c) => c.status === 'completed').map((c) => c.course_name.trim());
  const coursesCompleted = completedNow.filter((n) => n && !baselineCourses.has(normalize(n)));

  // Roadmap phases whose skills_to_build are all present
  const phases = roadmap?.phases || [];
  let phasesCompleted = 0;
  for (const phase of phases) {
    const allPresent = phase.skills_to_build.length > 0 && phase.skills_to_build.every((s) => present(s, skills));
    if (allPresent) phasesCompleted++;
  }

  return {
    role_title: goal.role_title,
    coverage,
    match_score_now: coverage,
    match_score_change: coverage - (baseline.match_score || 0),
    skills_acquired: skillsAcquired.slice(0, 20),
    goal_skills_acquired: goalSkillsAcquired.slice(0, 20),
    courses_completed: coursesCompleted.slice(0, 20),
    roadmap_phases_completed: phasesCompleted,
    roadmap_total_phases: phases.length,
    portfolio_score_now: computePortfolioScore(skills, certificates, courses).score,
    baseline,
  };
}
