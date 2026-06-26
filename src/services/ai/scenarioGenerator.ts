// Custom Scenario Generator (Gemini)
import { SchemaType, type Schema } from '@google/generative-ai';
import { getGeminiModel, isGeminiAvailable, executeWithRetry } from './core';
import type { PlaybookSettings } from '../../types';

export const generateCustomScenario = async (prompt: string, apiKey: string | undefined) => {
  if (!isGeminiAvailable(apiKey)) {
    throw new Error('Gemini API key is required to generate scenarios.');
  }

  const model = getGeminiModel(apiKey, { aiMode: 'pro' } as PlaybookSettings);

  const systemInstruction = `You are an expert Best Buy store manager and scenario designer. Generate a realistic retail training scenario based on the user's prompt.`;

  const responseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING },
      name: { type: SchemaType.STRING },
      category: { type: SchemaType.STRING },
      difficulty: { type: SchemaType.STRING },
      greeting: { type: SchemaType.STRING },
      customerNeeds: { type: SchemaType.STRING },
      objections: {
        type: SchemaType.OBJECT,
        properties: {
          memberships: { type: SchemaType.STRING },
          protection: { type: SchemaType.STRING },
          creditCard: { type: SchemaType.STRING }
        },
        required: ["memberships", "protection", "creditCard"]
      },
      keywords: {
        type: SchemaType.OBJECT,
        properties: {
          connect: { type: SchemaType.STRING },
          discover: { type: SchemaType.STRING },
          recommend: { type: SchemaType.STRING },
          protect: { type: SchemaType.STRING }
        },
        required: ["connect", "discover", "recommend", "protect"]
      }
    },
    required: ["title", "name", "category", "difficulty", "greeting", "customerNeeds", "objections", "keywords"]
  };

  try {
    const result = await executeWithRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
      generationConfig: { 
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    }));
    
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      title: parsed?.title || "Custom Scenario",
      name: parsed?.name || "Customer",
      category: parsed?.category || "Computing",
      difficulty: parsed?.difficulty || "Medium",
      greeting: parsed?.greeting || "Hello, I need some help.",
      customerNeeds: parsed?.customerNeeds || "Looking for a product.",
      objections: {
        memberships: parsed?.objections?.memberships || "Not interested.",
        protection: parsed?.objections?.protection || "Not interested.",
        creditCard: parsed?.objections?.creditCard || "Not interested."
      },
      keywords: {
        connect: parsed?.keywords?.connect || "hello, hi, welcome",
        discover: parsed?.keywords?.discover || "need, looking for, help",
        recommend: parsed?.keywords?.recommend || "recommend, suggest",
        protect: parsed?.keywords?.protect || "protect, warranty, gsp"
      }
    };
  } catch (err) {
    console.error('Failed to generate custom scenario:', err);
    throw new Error('AI failed to generate scenario. Please try again.', { cause: err });
  }
};
