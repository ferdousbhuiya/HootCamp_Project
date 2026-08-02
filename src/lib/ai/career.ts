import { callAIWithFallback } from './unified';
import type {
  JobRole,
  GapAnalysis,
  Roadmap,
  RoadmapPhase,
  RoadmapCourse,
  Skill,
  Certificate,
  OngoingCourse,
} from '@/types';
import { cleanText } from '@/lib/security/validation';

/**
 * Career Compass AI helpers.
 * All three prompts ask the LLM for ONLY valid JSON; every field is
 * sanitized afterwards (strip < >, truncate, clamp, cap array sizes).
 */

export function parseAIJson<T>(result: string): T | null {
  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Failed to parse AI JSON:', error);
    return null;
  }
}

export function cleanUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.replace(/[<>]/g, '').trim().slice(0, 300);
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

function clampScore(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.round(Math.max(0, Math.min(100, n)));
}

function cleanStringArray(value: unknown, max = 80, cap = 15): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, max))
    .filter(Boolean)
    .slice(0, cap);
}

function sanitizeGapAnalysis(raw: any): GapAnalysis {
  return {
    match_score: clampScore(raw?.match_score),
    coverage: clampScore(raw?.coverage),
    have_skills: cleanStringArray(raw?.have_skills, 80, 20),
    missing_skills: cleanStringArray(raw?.missing_skills, 80, 20),
    summary: cleanText(raw?.summary, 400),
    recommendations: cleanStringArray(raw?.recommendations, 160, 10),
  };
}

function sanitizeRoadmap(raw: any, roleTitle: string, roleId?: string): Roadmap {
  const phases: RoadmapPhase[] = Array.isArray(raw?.phases) ? (raw.phases as Record<string, unknown>[]).slice(0, 3).map((phase: Record<string, unknown>): RoadmapPhase | null => {
    const courses: RoadmapCourse[] = Array.isArray(phase?.courses)
      ? phase.courses.slice(0, 4).map((course: Record<string, unknown>) => ({
          title: cleanText(course?.title, 160),
          platform: cleanText(course?.platform, 60),
          url: cleanUrl(course?.url),
          cost: cleanText(course?.cost, 80),
        })).filter((course) => course.title.length > 0)
      : [];
    const months = cleanText(phase?.months, 20);
    return {
      phase: Number(phase?.phase) || 0,
      months,
      title: cleanText(phase?.title, 80) || `Phase ${months}`,
      summary: cleanText(phase?.summary, 300),
      milestones: cleanStringArray(phase?.milestones, 200, 8),
      courses,
      skills_to_build: cleanStringArray(phase?.skills_to_build, 80, 10),
    };
  }).filter((phase): phase is RoadmapPhase => phase !== null) : [];

  return {
    id: '',
    user_id: '',
    role_title: roleTitle,
    desired_role_id: roleId,
    phases,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function buildPortfolioContext(skills: Skill[], certificates?: Certificate[], ongoingCourses?: OngoingCourse[]): string {
  const skillLines = skills
    .map((s) => `${cleanText(s.name, 80)} (confidence ${Math.round((s.confidence || 0) * 100)}%)`)
    .join(', ');
  const verified = skills.filter((s) => s.is_verified).map((s) => cleanText(s.name, 80)).join(', ');
  let context = `Portfolio skills: ${skillLines || 'none yet'}`;
  if (verified) context += `\nVerified skills: ${verified}`;
  if (certificates && certificates.length > 0) {
    context += `\nCertificates: ${certificates.map((c) => `${c.title} from ${c.issuer}`).join(', ')}`;
  }
  if (ongoingCourses && ongoingCourses.length > 0) {
    context += `\nOngoing courses: ${ongoingCourses.map((c) => `${c.course_name} (${c.progress}% complete)`).join(', ')}`;
  }
  return context;
}

export interface RoleEnrichment {
  required_skills: string[];
  salary_range: string;
  demand_level: 'low' | 'medium' | 'high';
  entry_difficulty: 'entry' | 'intermediate' | 'advanced';
}

/** Fills market data + required skills for a role the first time it's analyzed. */
export async function enrichRoleWithAI(roleTitle: string, description?: string): Promise<RoleEnrichment> {
  const prompt = `Given the job role "${roleTitle}"${description ? ` (Description: ${description})` : ''}, return ONLY valid JSON:
{
  "required_skills": ["Skill1", ..., "Skill8"],
  "salary_range": "85k-125k USD",
  "demand_level": "high",
  "entry_difficulty": "entry"
}
required_skills must be 8-12 specific, realistic industry skills for this role.
demand_level is one of: low, medium, high.
entry_difficulty is one of: entry, intermediate, advanced.
Return ONLY valid JSON, no prose.`;

  const result = await callAIWithFallback(prompt);
  const json = parseAIJson<RoleEnrichment>(result);
  if (!json) throw new Error('AI returned invalid role data');

  const demand = json.demand_level as string;
  const difficulty = json.entry_difficulty as string;

  return {
    required_skills: cleanStringArray(json.required_skills, 80, 15),
    salary_range: cleanText(json.salary_range, 80),
    demand_level: demand === 'low' || demand === 'medium' || demand === 'high' ? demand : 'medium',
    entry_difficulty:
      difficulty === 'entry' || difficulty === 'intermediate' || difficulty === 'advanced'
        ? difficulty
        : 'intermediate',
  };
}

/** Generates the quantified skill-gap analysis for a target role. */
export async function generateGapAnalysis(
  skills: Skill[],
  roleTitle: string,
  requiredSkills: string[],
  certificates?: Certificate[],
  ongoingCourses?: OngoingCourse[]
): Promise<GapAnalysis> {
  const prompt = `${buildPortfolioContext(skills, certificates, ongoingCourses)}

Target role: ${roleTitle}
Role required skills: ${requiredSkills.join(', ') || 'not specified'}

Compute a skill-gap analysis between the candidate's portfolio and the target role.
Return ONLY valid JSON:
{
  "match_score": 62,
  "coverage": 58,
  "have_skills": ["portfolio skills that satisfy required skills"],
  "missing_skills": ["required skills not in the portfolio"],
  "summary": "2-3 sentence gap explanation",
  "recommendations": ["3-5 short actionable next steps"]
}
match_score is an integer 0-100 representing overall fit.
coverage is an integer 0-100 representing % of required skills present.
Return ONLY valid JSON, no prose.`;

  const result = await callAIWithFallback(prompt);
  const json = parseAIJson<any>(result);
  if (!json) throw new Error('AI returned invalid gap analysis');
  return sanitizeGapAnalysis(json);
}

/** Generates a 3-phase career roadmap to close the gap. */
export async function generateRoadmap(
  skills: Skill[],
  roleTitle: string,
  requiredSkills: string[],
  gapAnalysis?: GapAnalysis,
  certificates?: Certificate[],
  ongoingCourses?: OngoingCourse[]
): Promise<Roadmap> {
  const gapContext = gapAnalysis
    ? `Gap analysis summary: ${gapAnalysis.summary}\nHave skills: ${gapAnalysis.have_skills.join(', ') || 'none'}\nMissing skills: ${gapAnalysis.missing_skills.join(', ') || 'none'}`
    : '';

  const prompt = `${buildPortfolioContext(skills, certificates, ongoingCourses)}

Target role: ${roleTitle}
Role required skills: ${requiredSkills.join(', ') || 'not specified'}
${gapContext}

Create a 3-phase career roadmap to close the skill gap for this role. Each phase must contain ONLY real, well-known courses (e.g. Coursera, Udemy, freeCodeCamp, edX) with valid URLs.
Return ONLY valid JSON:
{
  "phases": [
    {
      "phase": 1,
      "months": "0-3",
      "title": "Foundations",
      "summary": "...",
      "milestones": ["3-5 milestones"],
      "courses": [ { "title": "...", "platform": "...", "url": "https://...", "cost": "Free" } ],
      "skills_to_build": ["3-5 skills"]
    },
    { "phase": 2, "months": "3-6", ... },
    { "phase": 3, "months": "6-12", ... }
  ]
}
Return ONLY valid JSON, no prose.`;

  const result = await callAIWithFallback(prompt);
  const json = parseAIJson<any>(result);
  if (!json) throw new Error('AI returned invalid roadmap');
  const roadmap = sanitizeRoadmap(json, roleTitle);
  if (roadmap.phases.length === 0) throw new Error('AI returned no roadmap phases');
  return roadmap;
}
