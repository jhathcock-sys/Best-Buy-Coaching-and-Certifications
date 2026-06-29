import { getGeminiModel } from './core';
import type { ShiftEvent, FollowUpTask, PlaybookSettings } from '../../types';
import type { ParsedEmployee } from '../../components/RentsDueAuditor/RentsDueLedger';

export type FloorLeaderShift = ShiftEvent;

export async function generateHandoffBriefing(
  activeShift: FloorLeaderShift,
  roster: ParsedEmployee[],
  followUpTasks: FollowUpTask[],
  playbookSettings: PlaybookSettings,
  apiKey: string | undefined
): Promise<string> {
  const model = getGeminiModel(apiKey, playbookSettings);

  const offTrackEmployees = roster.filter((emp) => 
    emp.revenueStatus === 'off-track' || 
    emp.appsStatus === 'off-track' || 
    emp.membershipsStatus === 'off-track'
  );

  const pendingTasks = followUpTasks.filter((task) => !task.completed);

  const prompt = `You are a highly professional Best Buy Store Manager. Write a concise, professional shift handoff briefing for the incoming Floor Leader.

CONTEXT:
Zone Assignments: ${JSON.stringify(activeShift.zoneAssignments || {}, null, 2)}
Employees Currently Off-Track: ${JSON.stringify(offTrackEmployees, null, 2)}
Pending Commitments/Tasks: ${JSON.stringify(pendingTasks, null, 2)}

REQUIREMENTS:
1. Summarize the current floor status based on zone assignments.
2. Note the employees who are Off-Track and need immediate coaching/support.
3. Call out any pending commitments from the follow-up tasks.
4. Provide exactly 3 bullet points of immediate actions for the incoming manager to take.

Keep the tone professional, urgent, and focused on retail execution. Format as Markdown.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Failed to generate handoff briefing:', error);
    return `### ⚠️ Shift Handoff Unreachable
The AI service is currently unavailable. Please review the following manually:
- Zone Assignments
- Off-track Employees (${offTrackEmployees.length} total)
- Pending Tasks (${pendingTasks.length} total)`;
  }
}
