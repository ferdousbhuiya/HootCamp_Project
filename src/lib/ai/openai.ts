import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content || '';
}
