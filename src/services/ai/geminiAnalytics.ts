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
      modelConfig: {
        responseSchema: {
          type: "OBJECT",
          properties: {
            chartType: {
              type: "STRING",
              description: "The type of chart to display: 'bar', 'metric', or 'line'",
              enum: ["bar", "metric", "line"]
            },
            title: {
              type: "STRING",
              description: "A concise, descriptive title for the chart"
            },
            narrativeSummary: {
              type: "STRING",
              description: "A short, insightful summary of what the data shows answering the user's question"
            },
            dataPoints: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  label: {
                    type: "STRING",
                    description: "X-axis label or metric name"
                  },
                  value: {
                    type: "NUMBER",
                    description: "Y-axis value or metric value"
                  },
                  colorAccent: {
                    type: "STRING",
                    description: "Optional hex color code for this specific data point, e.g. '#2563EB'"
                  }
                },
                required: ["label", "value"]
              }
            },
            format: {
              type: "STRING",
              description: "How to format the values: 'currency', 'number', or 'percentage'",
              enum: ["currency", "number", "percentage"]
            }
          },
          required: ["chartType", "title", "narrativeSummary", "dataPoints", "format"]
        }
      }
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
