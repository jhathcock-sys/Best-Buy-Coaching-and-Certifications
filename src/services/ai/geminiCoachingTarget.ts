import { callFirebaseAI } from './core';
import type { Employee, PlaybookSettings } from '../../types';

export interface CoachingTarget {
  name: string;
  reason: string;
  recommendedAction: string;
}

export async function generateCoachingTargets(
  roster: Employee[], 
  apiKey: string | undefined, 
  playbookSettings: PlaybookSettings
): Promise<CoachingTarget[]> {
  if (!apiKey) throw new Error("Missing Gemini API Key");

  const rosterContext = roster.map(emp => 
    `- ${emp.name} (${emp.dept}): RPH: ${emp.rph || 0}, Memberships: ${emp.memberships || 0}, Apps: ${emp.apps || 0}`
  ).join('\n');

  const prompt = `
Act as a Best Buy coach. Review this shift roster and their historical KPIs.
Identify the top 3 employees who need immediate coaching intervention right now based on poor performance metrics or large metric gaps.
Focus on low RPH or zero memberships.

Here is the current roster and their metrics:
${rosterContext}

Output ONLY a JSON array with exactly 3 objects.
Each object must have exactly these keys: "name", "reason", "recommendedAction".
Do not include markdown wrappers.
  `.trim();

  try {
    const result = await callFirebaseAI({
      prompt,
      isProMode: playbookSettings?.aiMode === 'pro',
      isJSON: true,
      apiKey,
      schemaType: 'coaching_target'
    });
    
    const text = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Coaching Target Generation Error:", error);
    throw error;
  }
}
