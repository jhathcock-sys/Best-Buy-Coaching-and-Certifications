import { GoogleGenerativeAI } from '@google/generative-ai';

export function isGeminiAvailable(apiKey) {
  return !!apiKey && apiKey.trim().length > 10;
}



export function getGeminiModel(apiKey, playbookSettings) {
  const aiInstance = new GoogleGenerativeAI(apiKey);
  const isProMode = playbookSettings?.aiMode === 'pro';
  // Use official stable Google AI Studio models: gemini-3.5-pro for complex auditing and GROW coaching logs, gemini-3.5-flash for fast simulation
  const modelName = isProMode ? 'gemini-3.5-pro' : 'gemini-3.5-flash';
  return aiInstance.getGenerativeModel({ model: modelName });
}

export async function executeWithRetry(apiCall, maxRetries = 3) {
  let retries = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error.status === 429 && retries < maxRetries) {
        const backoffMs = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        console.warn(`Rate limited (429). Retrying in ${backoffMs}ms...`);
        await new Promise(res => setTimeout(res, backoffMs));
        retries++;
      } else {
        throw error;
      }
    }
  }
}
