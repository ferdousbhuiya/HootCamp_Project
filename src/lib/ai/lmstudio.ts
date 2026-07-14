import OpenAI from 'openai';

const lmstudio = new OpenAI({
  baseURL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio',
});

export async function callLMStudio(prompt: string): Promise<string> {
  const response = await lmstudio.chat.completions.create({
    model: process.env.LMSTUDIO_MODEL || 'qwen/qwen3.6-27b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content || '';
}
