import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import type { GenerativeChartConfig, Employee } from '../../types';

export async function askConversationalAnalytics(
  question: string,
  snapshots: Record<string, Employee[]>
): Promise<GenerativeChartConfig | null> {
  const functions = getFunctions(app);
  const generateAIContentFn = httpsCallable(functions, 'generateAIContent');

  // Trim snapshots to the last 60 dates
  const dates = Object.keys(snapshots || {}).sort();
  const recentDates = dates.slice(-60);
  
  const trimmedSnapshots: Record<string, Partial<Employee>[]> = {};
  for (const date of recentDates) {
    trimmedSnapshots[date] = (snapshots[date] || []).map(emp => ({
      name: emp.name,
      rph: emp.rph,
      hours: emp.hours,
      creditCards: emp.creditCards,
      memberships: emp.memberships,
      surveys: emp.surveys
    }));
  }

  const prompt = `
You are an expert data analyst. Based on the provided data snapshots, answer the user's question by formulating a generative chart configuration.

Question: "${question}"

Data snapshots (last 60 dates):
${JSON.stringify(trimmedSnapshots)}
`;

  try {
    const payload = {
      prompt: prompt.trim(),
      isProMode: true,
      isJSON: true,
      schemaType: 'conversational_analytics'
    };

    const result = await generateAIContentFn(payload);
    const data = (result?.data || {}) as { text?: string };
    
    if (data?.text) {
      try {
        return JSON.parse(data.text) as GenerativeChartConfig;
      } catch (parseError) {
        console.error("Error parsing GenerativeChartConfig JSON:", parseError);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating conversational analytics chart:", error);
    throw error;
  }
}
