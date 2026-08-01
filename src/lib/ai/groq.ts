import OpenAI from 'openai';

let groqClient: OpenAI | null = null;

function getGroq(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groqClient;
}

export async function callGroq(prompt: string): Promise<string> {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned empty response');
  }
  return content;
}
