import { GoogleGenerativeAI } from '@google/generative-ai';

export function isGeminiAvailable(apiKey) {
  return !!apiKey && apiKey.trim().length > 10;
}



export function getGeminiModel(apiKey, playbookSettings) {
  const aiInstance = new GoogleGenerativeAI(apiKey);
  const isProMode = playbookSettings?.aiMode === 'pro';
  // Use official stable Google AI Studio models: gemini-1.5-pro for complex auditing and GROW coaching logs, gemini-1.5-flash for fast simulation
  const modelName = isProMode ? 'gemini-1.5-pro' : 'gemini-1.5-pro';
  return aiInstance.getGenerativeModel({ model: modelName });
}

