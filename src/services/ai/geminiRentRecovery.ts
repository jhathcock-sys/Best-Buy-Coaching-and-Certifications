import { callFirebaseAI } from './core';
import type { PlaybookSettings, FollowUpTask } from '../../types';
import type { ParsedEmployee } from '../../components/RentsDueAuditor/RentsDueLedger';

export async function generateRentRecoveryPlans(
  employees: ParsedEmployee[],
  playbookSettings: Partial<PlaybookSettings>,
  apiKey: string | undefined
): Promise<FollowUpTask[]> {
  if (!employees || employees.length === 0) return [];

  const employeesData = employees.map(employee => {
    const metricGaps = [];
    if (employee.rphStatus === 'off-track') metricGaps.push(`Revenue Per Hour (RPH): Actual ${employee.rph} vs Goal ${employee.rphOwed}`);
    if (employee.appsStatus === 'off-track') metricGaps.push(`Credit Card Apps: Actual ${employee.apps} vs Goal ${employee.appsOwed}`);
    if (employee.membershipsStatus === 'off-track') metricGaps.push(`Paid Memberships: Actual ${employee.memberships} vs Goal ${employee.membershipsOwed}`);
    const gapsText = metricGaps.length > 0 ? metricGaps.join(', ') : 'Overall performance gaps';
    return { name: employee.name, gaps: gapsText };
  });

  const systemPrompt = `You are a Best Buy Coach (Sales Manager) evaluating multiple employees who are currently "Off-Track" for the day.
For each employee, generate a customized, actionable 15-minute roleplay or coaching task to help them close their specific metric gaps.
Provide specific feedback or an actionable roleplay scenario.

You must return a JSON array containing objects that satisfy this interface:
[
  {
    "id": "string (generate a random uuid or unique string)",
    "employeeId": "string",
    "employeeName": "string",
    "topic": "string (short description of the gap)",
    "actionItem": "string (the customized roleplay scenario or coaching action)",
    "category": "Roleplay",
    "dueDate": "string (ISO string for today)",
    "completed": false
  }
]
Return ONLY the raw JSON array, without markdown formatting.`;

  const prompt = `Employee Data:
${JSON.stringify(employeesData, null, 2)}`;

  try {
    const result = await callFirebaseAI({
      prompt: systemPrompt + '\n\n' + prompt,
      isProMode: playbookSettings?.aiMode === 'pro',
      isJSON: true,
      apiKey,
      schemaType: 'rent_recovery'
    });
    const text = result.text || '[]';
    
    let tasks: FollowUpTask[] = JSON.parse(text);
    if (!Array.isArray(tasks)) {
      console.error("Parsed Gemini response is not an array:", text);
      return [];
    }
    
    return tasks.map(task => {
      return {
        ...task,
        completed: false,
        action: task.actionItem || task.action,
        id: task.id || Math.random().toString(36).substring(2, 15),
        dueDate: task.dueDate || new Date().toISOString()
      };
    });
  } catch (err) {
    console.error("Failed to generate or parse Gemini response:", err);
    return [];
  }
}
