import { callFirebaseAI } from './core';
import type { Employee, DeptGoal, PlaybookSettings } from '../../types';

export type AuraStatus = 'excellent' | 'needs_coaching' | 'steady' | 'pending';

export interface AuraInsight {
  status: AuraStatus;
  insight: string;
  action: string;
}

interface AuraResponseItem {
  id: string;
  status: AuraStatus;
  insight: string;
  action: string;
}

export async function generateAuraBatchInsights(
  roster: Employee[],
  deptGoals: Record<string, DeptGoal>,
  apiKey: string,
  playbookSettings: PlaybookSettings
): Promise<Record<string, AuraInsight>> {
  if (!roster || roster.length === 0) return {};
  

  const rosterStats = roster.map(emp => ({
    id: emp.id,
    name: emp.name,
    department: emp.dept || (emp as any).department,
    revenue: emp.revenue || 0,
    transactions: emp.transactions || 0,
    apps: emp.apps || (emp as any).applications || 0,
    memberships: emp.memberships || 0,
  }));

  const prompt = `
You are the AI engine powering the 'Aura' HUD for Best Buy Floor Leaders.
Analyze this entire employee roster's current shift performance:
${JSON.stringify(rosterStats, null, 2)}

Against these current department goals:
${JSON.stringify(deptGoals, null, 2)}

Provide a strict JSON response containing an array of objects. Each object must represent an employee and contain exactly these four fields:
1. "id": The employee's exact id from the provided roster data.
2. "status": Must be exactly one of: "excellent", "needs_coaching", or "steady". Use "needs_coaching" if they have 0 apps/memberships or very low revenue per transaction relative to their department goals.
3. "insight": A single concise sentence observing their performance (e.g., "High transactions but 0 memberships attached.").
4. "action": A 3-4 word recommended action for the Floor Leader to take right now (e.g., "Roleplay Best Buy Total").

Do not include any other text, markdown formatting, or explanations. Only the raw JSON array.
`;

  const apiCall = async () => {
    const result = await callFirebaseAI({
      prompt,
      isProMode: false,
      isJSON: true,
      isVision: false,
      apiKey: apiKey,
      schemaType: 'aura_batch_insights'
    });

    const responseText = result.text;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedArray = JSON.parse(cleanJson) as AuraResponseItem[];
      
      if (!Array.isArray(parsedArray)) {
        throw new Error('Aura Engine did not return an array');
      }
      
      const insightsMap: Record<string, AuraInsight> = {};
      parsedArray.forEach((item: AuraResponseItem) => {
        if (item.id && ['excellent', 'needs_coaching', 'steady'].includes(item.status) && item.insight && item.action) {
          insightsMap[item.id] = {
            status: item.status,
            insight: item.insight,
            action: item.action
          };
        }
      });
      
      return insightsMap;
    } catch (e) {
      console.error("Aura parse error:", e, responseText);
      // Fallback: mark everyone as steady
      const fallbackMap: Record<string, AuraInsight> = {};
      roster.forEach(emp => {
        fallbackMap[emp.id] = { status: 'steady', insight: 'Data inconclusive.', action: 'Observe on floor' };
      });
      return fallbackMap;
    }
  };

  return apiCall();
}
