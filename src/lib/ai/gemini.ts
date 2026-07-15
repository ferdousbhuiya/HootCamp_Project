import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.status === 503 || error?.status === 429;
      if (isRetryable && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Gemini API overloaded, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

export async function callGemini(prompt: string): Promise<string> {
  const gemini = getGemini();
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  const response = await retryWithBackoff(async () => {
    return await gemini.models.generateContent({
      model,
      contents: prompt,
    });
  });

  return response.text || '';
}
