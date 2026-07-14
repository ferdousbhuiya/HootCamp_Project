import { callOpenAI } from './openai';
import { callLMStudio } from './lmstudio';
import type { Skill, Match } from '@/types';

export async function findMatches(
  skills: Skill[],
  matchType: 'job' | 'learning_path' | 'credential' = 'job'
): Promise<Match[]> {
  const skillList = skills.map(s => s.name).join(', ');

  const prompt = `Given these skills: ${skillList}

Find 5 matching ${matchType === 'job' ? 'job roles' : matchType === 'learning_path' ? 'learning paths' : 'credentials/certifications'}.

Return a JSON array with:
- title: name of the match
- description: brief description
- match_score: 0.0 to 1.0
- matched_skills: array of skill names that match
- explanation: why this matches the skills

Return ONLY valid JSON array.`;

  let result: string;
  try {
    result = await callLMStudio(prompt);
  } catch {
    result = await callOpenAI(prompt);
  }

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as Match[];
  } catch {
    return [];
  }
}
