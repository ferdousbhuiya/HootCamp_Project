import { callOpenAI } from './openai';
import { callGemini } from './gemini';
import { callLMStudio } from './lmstudio';

export async function callAIWithFallback(prompt: string): Promise<string> {
  const errors: string[] = [];

  // Try OpenAI first if available
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('Attempting OpenAI...');
      return await callOpenAI(prompt);
    } catch (error: any) {
      const msg = error?.message || String(error);
      errors.push(`OpenAI: ${msg}`);
      console.error('OpenAI failed:', msg);
    }
  }

  // Try Gemini if available
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Attempting Gemini...');
      return await callGemini(prompt);
    } catch (error: any) {
      const msg = error?.message || String(error);
      errors.push(`Gemini: ${msg}`);
      console.error('Gemini failed:', msg);
    }
  }

  // Try LMStudio if available
  if (process.env.LMSTUDIO_BASE_URL) {
    try {
      console.log('Attempting LMStudio...');
      return await callLMStudio(prompt);
    } catch (error: any) {
      const msg = error?.message || String(error);
      errors.push(`LMStudio: ${msg}`);
      console.error('LMStudio failed:', msg);
    }
  }

  // All providers failed
  throw new Error(
    `All AI providers failed:\n${errors.join('\n')}\n\nPlease configure at least one AI provider in your .env file.`
  );
}
