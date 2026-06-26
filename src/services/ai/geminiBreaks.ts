import { getGeminiModel, executeWithRetry } from './core';

export const generateOptimizedBreaks = async (
  roster: any[],
  zoneAssignments: Record<string, string[]>,
  currentBreaks: any[],
  apiKey?: string,
  playbookSettings?: any
) => {
  const model = getGeminiModel(apiKey, playbookSettings);

  const prompt = `
You are an intelligent scheduling assistant for Best Buy.
Your task is to generate an optimized break schedule for the current roster of employees.
We want to avoid overlapping breaks for employees working in the same zone.

Here is the current roster:
${JSON.stringify(roster, null, 2)}

Here are the current zone assignments (Zone -> Array of Employee IDs):
${JSON.stringify(zoneAssignments, null, 2)}

Here are the currently scheduled breaks (do not overwrite these unless absolutely necessary):
${JSON.stringify(currentBreaks, null, 2)}

Please return a JSON array of break objects. Each break object should have:
- employeeId: (string) The ID of the employee
- employeeName: (string) The name of the employee
- startTime: (string) The start time of the break (e.g., "12:00 PM")
- duration: (number) The duration in minutes (e.g., 15 or 30)

Return ONLY valid JSON.
  `.trim();

  const request = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 2048,
    }
  };

  const response = await executeWithRetry(async () => {
    const res = await model.generateContent(request);
    return res.response.text();
  });

  try {
    const breaks = JSON.parse(response);
    return Array.isArray(breaks) ? breaks : (breaks.breaks || []);
  } catch (error) {
    console.error('Failed to parse AI break schedule:', error);
    return [];
  }
};
