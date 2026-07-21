import { randomUUID } from 'crypto';
import { callAIWithFallback } from './unified';
import type { Skill } from '@/types';
import { cleanText, clampConfidence } from '@/lib/security/validation';

export async function parseResumeToSkills(text: string): Promise<Skill[]> {
  const prompt = `Extract skills from this resume text. Return a JSON array of objects with:
- name
- category: one of [technical, soft, domain, tool]
- confidence: 0.0 to 1.0
Resume text:
${text}
Return ONLY valid JSON array.`;
  const result = await callAIWithFallback(prompt);
  let cleaned = '';
  try {
    cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
    const json: unknown = JSON.parse(cleaned);
    if (!Array.isArray(json)) return [];
    return json.map((item: any): Skill => ({
      id: randomUUID(),
      name: cleanText(item?.name, 80),
      category: cleanText(item?.category, 30).toLowerCase() || 'technical',
      confidence: clampConfidence(item?.confidence),
      source: 'resume',
    })).filter((skill) => skill.name.length > 0);
  } catch (error) {
    console.error('Failed to parse skills JSON:', error);
    return [];
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
