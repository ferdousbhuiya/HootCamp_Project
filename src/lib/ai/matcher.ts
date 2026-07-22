import { randomUUID } from 'crypto';
import { callAIWithFallback } from './unified';
import type { Match, Skill } from '@/types';
import { cleanText, clampConfidence } from '@/lib/security/validation';

type MatchType = 'job' | 'learning_path' | 'credential';

interface RawMatch {
  title?: unknown;
  description?: unknown;
  match_score?: unknown;
  matched_skills?: unknown[];
  explanation?: unknown;
  missing_skills?: unknown[];
  next_steps?: unknown[];
}

export async function findMatches(skills: Skill[], matchType: MatchType = 'job'): Promise<Match[]> {
  const skillList = skills.map((skill) => cleanText(skill.name, 80)).join(', ');
  const target = matchType === 'job' ? 'job roles' : matchType === 'learning_path' ? 'learning paths' : 'credentials/certifications';
  const prompt = `Given these skills: ${skillList}
Find 5 matching ${target}.
Return a JSON array with objects containing:
- title
- description
- match_score
- matched_skills
- explanation
- missing_skills
- next_steps
- type: "${matchType}"
Return ONLY valid JSON array.`;

  const result = await callAIWithFallback(prompt);
  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse match JSON:', error);
    return [];
  }
  if (!Array.isArray(json)) return [];

  return json.map((item: RawMatch): Match => ({
    id: randomUUID(),
    user_id: '',
    created_at: new Date().toISOString(),
    title: cleanText(item?.title, 120),
    description: cleanText(item?.description, 300),
    match_score: clampConfidence(item?.match_score),
    matched_skills: Array.isArray(item?.matched_skills) ? item.matched_skills.map((skill: unknown) => cleanText(skill, 80)).filter(Boolean) : [],
    explanation: cleanText(item?.explanation, 500),
    missing_skills: Array.isArray(item?.missing_skills) ? item.missing_skills.map((skill: unknown) => cleanText(skill, 80)).filter(Boolean) : [],
    next_steps: Array.isArray(item?.next_steps) ? item.next_steps.map((step: unknown) => cleanText(step, 160)).filter(Boolean) : [],
    type: matchType,
  })).filter((match) => match.title.length > 0);
}
