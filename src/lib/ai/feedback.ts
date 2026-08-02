import { callAIWithFallback } from './unified';
import { buildPortfolioContext, parseAIJson } from './career';
import { computePortfolioScore } from '@/lib/portfolioScore';
import { cleanText } from '@/lib/security/validation';
import type { Skill, Certificate, OngoingCourse, PortfolioFeedback } from '@/types';

function cleanStringArray(value: unknown, max = 120, cap = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, max))
    .filter(Boolean)
    .slice(0, cap);
}

function sanitizeFeedback(raw: any): PortfolioFeedback {
  return {
    strengths: cleanStringArray(raw?.strengths, 120, 8),
    weaknesses: cleanStringArray(raw?.weaknesses, 120, 6),
    missing_keywords: cleanStringArray(raw?.missing_keywords, 120, 12),
    suggestions: Array.isArray(raw?.suggestions)
      ? (raw.suggestions as Record<string, unknown>[]).slice(0, 8).map((s: Record<string, unknown>) => ({
          title: cleanText(s?.title, 120),
          description: cleanText(s?.description, 300),
        })).filter((s) => s.title.length > 0)
      : [],
  };
}

/**
 * AI review of the user's full portfolio: strengths, weaknesses, missing
 * employer keywords, and editable next-step suggestions.
 */
export async function generatePortfolioFeedback(
  skills: Skill[],
  certificates?: Certificate[],
  ongoingCourses?: OngoingCourse[],
  roleTitle?: string
): Promise<PortfolioFeedback> {
  const score = computePortfolioScore(skills, certificates || [], ongoingCourses || []);
  const roleLine = roleTitle ? `\nTarget role: ${roleTitle}` : '';

  const prompt = `${buildPortfolioContext(skills, certificates, ongoingCourses)}
Portfolio score: ${score.score}/100
Breakdown: skills ${score.breakdown.skills}/40, breadth ${score.breakdown.breadth}/10, verified ${score.breakdown.verification}/20, certificates ${score.breakdown.certificates}/20, courses ${score.breakdown.courses}/10.${roleLine}

Review this candidate's portfolio and return ONLY valid JSON:
{
  "strengths": ["3-6 grounded strengths"],
  "weaknesses": ["2-4 gaps"],
  "missing_keywords": ["6-12 keywords employers expect${roleTitle ? ' for this role' : ''}"],
  "suggestions": [{"title": "short action", "description": "1-2 sentences"}]
}
Every item must be grounded ONLY in the provided data. Never invent skills, certificates, or achievements. Return ONLY valid JSON, no prose.`;

  const result = await callAIWithFallback(prompt);
  const json = parseAIJson<any>(result);
  if (!json) throw new Error('AI returned invalid portfolio feedback');
  return sanitizeFeedback(json);
}
