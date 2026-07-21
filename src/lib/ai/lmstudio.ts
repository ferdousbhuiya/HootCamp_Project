import OpenAI from 'openai';

let modelCache: string | null = null;
const LMSTUDIO_TIMEOUT_MS = 20000;
const lmstudio = new OpenAI({
  baseURL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio',
});

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${LMSTUDIO_TIMEOUT_MS}ms`)), LMSTUDIO_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function getDynamicModel(): Promise<string> {
  if (modelCache) return modelCache;

  try {
    const modelsResponse = await withTimeout(lmstudio.models.list(), 'LM Studio model discovery');
    const modelId = modelsResponse.data[0]?.id;

    if (modelId) {
      modelCache = modelId;
      console.log(`Using model from endpoint: ${modelId}`);
      return modelId;
    }
  } catch (error) {
    console.error('Failed to fetch models from endpoint:', error);
  }

  // Fallback if dynamic fetch fails
  const fallbackModel =
    process.env.LMSTUDIO_MODEL || 'qwen/qwen3.6-27b';
  console.log(`Falling back to model: ${fallbackModel}`);
  return fallbackModel;
}

export async function callLMStudio(prompt: string): Promise<string> {
  const model = await getDynamicModel();
  const response = await withTimeout(
    lmstudio.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
    'LM Studio chat completion'
  );

  return response.choices[0].message.content || '';
}
