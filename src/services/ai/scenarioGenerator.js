// Custom Scenario Generator (Gemini)
import { getGeminiModel, isGeminiAvailable } from './core.js';

export const generateCustomScenario = async (prompt, apiKey) => {
  if (!isGeminiAvailable(apiKey)) {
    throw new Error('Gemini API key is required to generate scenarios.');
  }

  const model = getGeminiModel(apiKey, { aiMode: 'pro' });

  const systemInstruction = `You are an expert Best Buy store manager and scenario designer. Generate a realistic retail training scenario based on the user's prompt. 
Return ONLY valid JSON that matches this exact schema, with NO markdown formatting, NO backticks, and NO other text:
{
  "title": "Short title",
  "name": "Customer Name",
  "category": "Computing|Home Theatre|Mobile|Appliances|Front End|Geek Squad",
  "difficulty": "Easy|Medium|Hard",
  "greeting": "The exact first words the customer says to start the interaction",
  "customerNeeds": "A description of what the customer is looking for and their current mood",
  "objections": {
    "memberships": "Why they don't want a Plus/Total membership",
    "protection": "Why they don't want Geek Squad Protection/AppleCare",
    "creditCard": "Why they don't want the Best Buy Credit Card"
  },
  "keywords": {
    "connect": "comma, separated, words, for, building, rapport",
    "discover": "comma, separated, words, for, uncovering, needs",
    "recommend": "comma, separated, words, for, pitching, solutions",
    "protect": "comma, separated, words, for, offering, GSP, AppleCare, Total"
  }
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.7 }
    });
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/`json/g, '').replace(/`/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to generate custom scenario:', err);
    throw new Error('AI failed to generate scenario. Please try again.', { cause: err });
  }
};
