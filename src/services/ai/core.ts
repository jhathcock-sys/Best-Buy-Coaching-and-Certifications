import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import type { PlaybookSettings } from '../../types';

export interface FirebaseAIPayload {
  prompt: string;
  isProMode?: boolean;
  isJSON?: boolean;
  isVision?: boolean;
  base64Image?: string;
  mimeType?: string;
  apiKey?: string;
  schemaType?: string;
}

export function isGeminiAvailable(apiKey: string | undefined): boolean {
  // Relying entirely on cloud functions for AI now
  return true;
}

export async function executeWithRetry<T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (error: unknown) {
      const err = (error || {}) as { status?: number, code?: string };
      if ((err?.status === 429 || err?.code === 'functions/resource-exhausted') && retries < maxRetries) {
        const backoffMs = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        console.warn(`Rate limited. Retrying in ${backoffMs}ms...`);
        await new Promise(res => setTimeout(res, backoffMs));
        retries++;
      } else {
        throw error;
      }
    }
  }
}

export const callFirebaseAI = async (payload: FirebaseAIPayload) => {
  return executeWithRetry(async () => {
    try {
      const functions = getFunctions(app);
      const generateAIContentFn = httpsCallable(functions, 'generateAIContent');
      const result = await generateAIContentFn(payload);
      return result.data as { text: string };
    } catch (error) {
      console.error("Firebase AI Callable Error:", error);
      throw error;
    }
  });
};
