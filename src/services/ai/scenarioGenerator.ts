// Custom Scenario Generator (Gemini)
import { callFirebaseAI, isGeminiAvailable } from './core';
import type { PlaybookSettings } from '../../types';

export const generateCustomScenario = async (prompt: string, apiKey: string | undefined) => {
  if (!isGeminiAvailable(apiKey)) {
    throw new Error('Gemini API key is required to generate scenarios.');
  }

  const systemInstruction = `You are an expert Best Buy store manager and scenario designer. Generate a realistic retail training scenario based on the user's prompt.`;

  try {
    const result = await callFirebaseAI({
      prompt: systemInstruction + '\n\n' + prompt,
      isProMode: true,
      isJSON: true,
      apiKey,
      schemaType: 'scenario'
    });
    
    const responseText = result.text;
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
