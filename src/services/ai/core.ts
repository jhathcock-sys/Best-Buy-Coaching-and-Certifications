import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

export function isGeminiAvailable(apiKey: any) {
  // Relying entirely on cloud functions for AI now
  return true;
}

export function getGeminiModel(apiKey: any, playbookSettings: any) {
  const isProMode = playbookSettings?.aiMode === 'pro';
  
  return {
    generateContent: async (request: any) => {
      try {
        const functions = getFunctions(app);
        const generateAIContentFn = httpsCallable(functions, 'generateAIContent');
        
        let prompt = '';
        let isVision = false;
        let base64Image = null;
        let mimeType = null;
        
        const contents = request.contents || [];
        // Flatten all parts
        for (const content of contents) {
          const parts = content.parts || [];
          for (const part of parts) {
            if (part.text) {
              prompt += part.text + '\n';
            }
            if (part.inlineData) {
              isVision = true;
              base64Image = part.inlineData.data;
              mimeType = part.inlineData.mimeType;
            }
          }
        }
        
        const isJSON = request.generationConfig?.responseMimeType === 'application/json';
        const responseSchema = request.generationConfig?.responseSchema;
        
        const payload = {
          prompt: prompt.trim(),
          isProMode,
          isJSON,
          isVision,
          base64Image,
          mimeType,
          modelConfig: {
            responseSchema
          }
        };
        
        const result = await generateAIContentFn(payload);
        const data = result.data as any;
        
        return {
          response: {
            text: () => data.text
          }
        };
      } catch (error) {
        console.error("Firebase AI Callable Error:", error);
        throw error;
      }
    },
    generateContentStream: async function(request: any) {
      const result = await this.generateContent(request);
      return {
        stream: [
          { text: () => result.response.text() }
        ]
      };
    }
  };
}

export async function executeWithRetry(apiCall: any, maxRetries = 3) {
  let retries = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      if ((error.status === 429 || error?.code === 'functions/resource-exhausted') && retries < maxRetries) {
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
