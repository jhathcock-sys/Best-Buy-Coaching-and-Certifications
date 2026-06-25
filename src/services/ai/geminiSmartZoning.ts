import { getGeminiModel } from './core';

export async function generateSmartZoning(roster: any[], zones: string[], apiKey: string, playbookSettings: any) {
  if (!apiKey) throw new Error("Missing Gemini API Key");
  
  const model = getGeminiModel(apiKey, playbookSettings);

  const prompt = `
    You are an AI Floor Leader for Best Buy. 
    Your goal is to optimize the daily lineup by assigning employees to specific zones to maximize revenue and metrics.
    
    Here is the available roster with their historical performance (RPH = Revenue Per Hour):
    ${JSON.stringify(roster.map(e => ({ id: e.id, name: e.name, rph: e.rph, memberships: e.memberships, dept: e.dept })), null, 2)}
    
    Here are the zones available:
    ${JSON.stringify(zones)}
    
    Rules for assignment:
    1. Every employee in the roster MUST be assigned to exactly one zone.
    2. Try to assign employees to zones that match their department (e.g. Computing to Computing), but flex high-RPH performers to high-traffic zones (like Mobile or Computing) if needed.
    3. Ensure no zone is left empty if possible.
    
    Respond ONLY with a valid JSON object where keys are the zone names, and values are arrays of employee IDs assigned to that zone. Do not include markdown blocks or any other text.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error("Smart Zoning AI Error:", err);
    throw err;
  }
}
