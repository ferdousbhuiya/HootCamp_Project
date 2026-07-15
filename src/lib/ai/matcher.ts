import { callGemini } from './gemini';
import type { Skill, Match } from '@/types';

export async function findMatches(
  skills: Skill[],
  matchType: 'job' | 'learning_path' | 'credential' = 'job'
): Promise<Match[]> {
  const skillList = skills.map(s => s.name).join(', ');

  const prompt = `Given these skills: ${skillList}

Find 5 matching ${matchType === 'job' ? 'job roles' : matchType === 'learning_path' ? 'learning paths' : 'credentials/certifications'}.

Return a JSON array with objects containing:
- title: name of the match
- description: brief description (1-2 sentences)
- match_score: number between 0.0 and 1.0
- matched_skills: array of skill names that match
- explanation: why this matches the skills (2-3 sentences)
- type: "${matchType}"

Return ONLY valid JSON array. No other text.`;

  const result = await callGemini(prompt);

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const matches = JSON.parse(cleaned) as Match[];

    // Ensure each match has a type field
    return matches.map(match => ({
      ...match,
      type: match.type || matchType,
    }));
  } catch {
    return [];
  }
}
