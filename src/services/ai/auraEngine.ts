import { getGeminiModel, executeWithRetry } from './core';

export type AuraStatus = 'excellent' | 'needs_coaching' | 'steady' | 'pending';

export interface AuraInsight {
  status: AuraStatus;
  insight: string;
  action: string;
}

export async function generateAuraInsightForEmployee(
  employee: any,
  deptGoals: any,
  apiKey: string,
  playbookSettings: any
): Promise<AuraInsight> {
  const model = getGeminiModel(apiKey, playbookSettings);
  
  const empStats = {
    name: employee.name,
    department: employee.department,
    revenue: employee.revenue || 0,
    transactions: employee.transactions || 0,
    apps: employee.applications || 0,
    memberships: employee.memberships || 0,
  };

  const prompt = `
You are the AI engine powering the 'Aura' HUD for Best Buy Floor Leaders.
Analyze this employee's current shift performance:
${JSON.stringify(empStats, null, 2)}

Provide a strict JSON response containing exactly these three fields:
1. "status": Must be exactly one of: "excellent", "needs_coaching", or "steady". Use "needs_coaching" if they have 0 apps/memberships or very low revenue per transaction.
2. "insight": A single concise sentence observing their performance (e.g., "High transactions but 0 memberships attached.").
3. "action": A 3-4 word recommended action for the Floor Leader to take right now (e.g., "Roleplay Best Buy Total").

Do not include any other text, markdown formatting, or explanations. Only the raw JSON object.
`;

  const apiCall = async () => {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    try {
      // In case the model wraps it in markdown blocks
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      // Validate schema loosely
      if (['excellent', 'needs_coaching', 'steady'].includes(parsed.status) && parsed.insight && parsed.action) {
        return parsed as AuraInsight;
      }
      throw new Error('Invalid JSON structure returned by Aura Engine');
    } catch (e) {
      console.error("Aura parse error:", e, responseText);
      return { status: 'steady', insight: 'Data inconclusive.', action: 'Observe on floor' };
    }
  };

  return executeWithRetry(apiCall, 2);
}
