import { getGeminiModel, executeWithRetry } from './core';
import type { Employee, PlaybookSettings } from '../../types';

export async function generateHuddleScript(
  roster: Employee[], 
  apiKey: string | undefined, 
  playbookSettings: any
): Promise<string> {
  const model = getGeminiModel(apiKey, playbookSettings);

  const rosterContext = roster.map(emp => 
    `- ${emp.name} (${emp.dept}): RPH: ${emp.rph || 0}, Memberships: ${emp.memberships || 0}`
  ).join('\n');

  const prompt = `
You are a Best Buy Store Manager generating a short, motivational morning huddle script for your shift.
Your goals:
1. Set a positive, energetic tone for the day.
2. Point out specific employees by name based on their KPIs (RPH, Memberships, Department) to give targeted advice or praise.
3. Keep it brief, conversational, and impactful (about 2-3 paragraphs).

Here is the current roster and their metrics:
${rosterContext}

Generate the plain text huddle script.
  `.trim();

  const result = await executeWithRetry(async () => {
    return await model.generateContent(prompt);
  });

  return result.response.text();
}
