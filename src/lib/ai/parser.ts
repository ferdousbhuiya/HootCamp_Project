import { callGemini } from './gemini';
import type { Skill } from '@/types';

export async function parseResumeToSkills(text: string): Promise<Skill[]> {
  const prompt = `Extract skills from this resume text. Return a JSON array of objects with:
- name: skill name
- category: one of [technical, soft, domain, tool]
- confidence: 0.0 to 1.0

Resume text:
${text}

Return ONLY valid JSON array. No other text.`;

  const result = await callGemini(prompt);

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as Skill[];
  } catch {
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
