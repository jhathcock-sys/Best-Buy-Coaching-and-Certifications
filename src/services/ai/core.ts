import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import type { PlaybookSettings } from '../../types';

export interface GeminiRequestPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface GeminiRequestContent {
  role?: string;
  parts?: GeminiRequestPart[];
}

export interface GeminiRequest {
  contents?: GeminiRequestContent[];
  systemInstruction?: {
    role: string;
    parts: { text: string }[];
  };
  generationConfig?: {
    responseMimeType?: string;
    responseSchema?: any; // Allows @google/generative-ai Schema
    maxOutputTokens?: number;
    temperature?: number;
  };
}

export interface GeminiResponseData {
  text?: string;
}

export function isGeminiAvailable(apiKey: string | undefined): boolean {
  // Relying entirely on cloud functions for AI now
  return true;
}

export function getGeminiModel(apiKey: string | undefined, playbookSettings?: Partial<PlaybookSettings>) {
  const isProMode = playbookSettings?.aiMode === 'pro';
  
  return {
    generateContent: async (req: GeminiRequest | string) => {
      try {
        const request: GeminiRequest = typeof req === 'string' ? { contents: [{ role: 'user', parts: [{ text: req }] }] } : req;
        const functions = getFunctions(app);
        const generateAIContentFn = httpsCallable(functions, 'generateAIContent');
        
        let prompt = '';
        let isVision = false;
        let base64Image: string | null = null;
        let mimeType: string | null = null;
        
        const contents = request?.contents || [];
        // Flatten all parts
        for (const content of contents) {
          const parts = content?.parts || [];
          for (const part of parts) {
            if (part?.text) {
              prompt += part.text + '\n';
            }
            if (part?.inlineData) {
              isVision = true;
              base64Image = part.inlineData.data;
              mimeType = part.inlineData.mimeType;
            }
          }
        }
        
        const isJSON = request?.generationConfig?.responseMimeType === 'application/json';
        const responseSchema = request?.generationConfig?.responseSchema;
        
        const payload = {
          prompt: prompt.trim(),
          isProMode,
          isJSON,
          isVision,
          base64Image,
          mimeType,
          apiKey,
          modelConfig: {
            responseSchema
          }
        };
        
        const result = await generateAIContentFn(payload);
        const data = (result?.data || {}) as GeminiResponseData;
        
        return {
          response: {
            text: () => data?.text || ''
          }
        };
      } catch (error) {
        console.error("Firebase AI Callable Error:", error);
        throw error;
      }
    },
    generateContentStream: async function(req: GeminiRequest | string) {
      const result = await this.generateContent(req);
      return {
        stream: [
          { text: () => result.response.text() }
        ]
      };
    }
  };
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
