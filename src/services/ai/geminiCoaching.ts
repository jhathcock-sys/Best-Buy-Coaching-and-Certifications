import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';
import type { PlaybookSettings, Employee, CoachingLog } from '../../types';
import { executeWithRetry } from './core';
import { SchemaType, type Schema } from '@google/generative-ai'; // Just for types, not instantiation

export async function generateCoachingLogGemini(
  apiKey: string | undefined, 
  name: string, 
  gapType: string, 
  gapDetails: string, 
  positives: string, 
  rawObservation: string, 
  playbookSettings: PlaybookSettings, 
  selectedDiscSteps: string | string[]
) {
  try {
    const functions = getFunctions(app);
    const generateCoaching = httpsCallable(functions, 'generateCoaching');
    
    // Call the dedicated backend endpoint. The prompt and schema are securely stored on the server.
    const response = await executeWithRetry(() => generateCoaching({
      name,
      gapType,
      gapDetails,
      positives,
      rawObservation,
      playbookSettings,
      selectedDiscSteps,
      apiKey
    }));
    
    const parsed = response.data as Record<string, string>;
    const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');

    return {
      what: parsed?.what || "Provide a complete solution.",
      how: parsed?.how || "Follow the appropriate framework.",
      why: parsed?.why || "To ensure a quality customer experience.",
      strengths: parsed?.strengths || positives || "Demonstrates good core competencies.",
      metricGap: parsed?.metricGap || gapDetails || gapType || "Needs focused development.",
      expectation: parsed?.expectation || "Improve performance in the focus area.",
      validation: parsed?.validation || "Leader will follow up next week.",
      discStep: parsed?.discStep || stepsText || "Solve"
    };
  } catch (e) {
    console.error('Gemini Coaching Log generation error:', e);
    return null;
  }
}

export const generateMonthlyOneOnOne = async (employeeData: Employee, logs: CoachingLog[], apiKey: string | undefined) => {
  try {
    const functions = getFunctions(app);
    const generateAIContent = httpsCallable(functions, 'generateAIContent');

    const prompt = `
      You are an expert Best Buy Store Leader writing a formal 1-on-1 monthly performance appraisal for your associate.
      
      ASSOCIATE DATA:
      Name: ${employeeData?.name || 'Unknown'}
      Department: ${employeeData?.dept || 'Unknown'}
      Memberships: ${employeeData?.memberships || 0}
      Credit Cards: ${employeeData?.creditCards || 0}
      Protection/Warranty Attach: ${employeeData?.warranty || 0}%
      RPH (Revenue Per Hour): $${employeeData?.rph || 0}
      CSAT (Surveys): ${employeeData?.surveys || 0}/5
      
      RECENT COACHING LOGS (Last 30 Days):
      ${JSON.stringify(logs || [], null, 2)}
      
      Please write a professional, firm but supportive 1-on-1 document using the Start / Stop / Continue framework. 
      Format the output in strict Markdown.
      Use the following structure:
      
      # Monthly 1-on-1 Performance Review: ${employeeData?.name || 'Unknown'}
      **Date:** Current Month
      **Department:** ${employeeData?.dept || 'Unknown'}
      
      ## Performance Snapshot
      Summarize their hard metrics. Celebrate their wins and clearly state what metrics they are missing based on store standards.
      
      ## 🟢 Start
      Based on the coaching logs and metrics, what new behaviors, sales tactics, or routines should the associate START doing immediately to improve performance? Be specific.
      
      ## 🔴 Stop
      What bad habits, missed steps in the sales process (like missing the pitch), or non-productive behaviors should the associate STOP doing?
      
      ## 🔵 Continue
      What is the associate doing well that they should CONTINUE doing? Highlight their strengths and recent wins.
      
      ## Commitment
      Provide a blank commitment statement they need to agree to (e.g., "I commit to...").
      
      Use professional retail leadership language. Be concise and actionable.
    `;

    const response = await executeWithRetry(() => generateAIContent({
      prompt,
      apiKey,
      isJSON: false
    }));
    return (response.data as any).text;

  } catch (error) {
    console.error("1-on-1 Generation Error:", error);
    return `# Monthly 1-on-1 Performance Review: ${employeeData?.name || 'Unknown'}

*Note: AI generation failed or API key missing. This is a fallback template.*

## 1. Goal
Review your metrics for the month.

## 2. Reality
Discuss recent floor observations.

## 3. Options
Identify practice areas.

## 4. Will
I commit to: ___________________________`;
  }
};

export const generateActionPlan = async (employeeData: Employee, logs: CoachingLog[], apiKey: string | undefined) => {
  try {
    const functions = getFunctions(app);
    const generateAIContent = httpsCallable(functions, 'generateAIContent');

    const prompt = `
      You are an expert Best Buy Store Manager tasked with creating a 30-Day Performance Improvement Plan (Action Plan) for an associate.
      
      ASSOCIATE DATA:
      Name: ${employeeData?.name || 'Unknown'}
      Department: ${employeeData?.dept || 'Unknown'}
      Memberships: ${employeeData?.memberships || 0}
      Credit Cards: ${employeeData?.creditCards || 0}
      RPH: $${employeeData?.rph || 0}
      
      RECENT COACHING LOGS:
      ${JSON.stringify(logs || [], null, 2)}
      
      Create a strict, structured 4-week action plan.
      Output format must be a JSON object matching this exact schema:
      {
        "type": "30-Day Action Plan: Focus Area",
        "status": "Active",
        "reason": "Brief summary of why this plan was generated based on data",
        "dateCreated": "Today's Date",
        "planText": "Markdown formatted 4-week detailed plan"
      }
    `;

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        type: { type: SchemaType.STRING },
        status: { type: SchemaType.STRING },
        reason: { type: SchemaType.STRING },
        dateCreated: { type: SchemaType.STRING },
        planText: { type: SchemaType.STRING }
      },
      required: ["type", "status", "reason", "dateCreated", "planText"]
    };

    const response = await executeWithRetry(() => generateAIContent({
      prompt,
      apiKey,
      isJSON: true,
      modelConfig: { responseSchema }
    }));
    
    const parsed = JSON.parse((response.data as any).text);
    return {
      type: parsed?.type || "30-Day Action Plan: Focus Area",
      status: parsed?.status || "Active",
      reason: parsed?.reason || "Action plan generated based on metrics",
      dateCreated: parsed?.dateCreated || new Date().toLocaleDateString(),
      planText: parsed?.planText || "Plan details could not be generated."
    };
  } catch (error) {
    console.error("Action Plan Generation Error:", error);
    return null;
  }
};

export const generatePerformanceGap = async (
  apiKey: string | undefined, 
  employeeName: string, 
  currentMetrics: Record<string, any>, 
  historyMetrics: Record<string, any>[], 
  departmentGoals: Record<string, any>
) => {
  try {
    const functions = getFunctions(app);
    const generateAIContent = httpsCallable(functions, 'generateAIContent');

    const prompt = `
      You are an expert Best Buy Sales Manager analyzing an employee's weekly performance metrics.
      
      Employee Name: ${employeeName}
      Department Goals: ${JSON.stringify(departmentGoals || {})}
      
      Current Week Metrics:
      ${JSON.stringify(currentMetrics || {}, null, 2)}
      
      Historical Performance Data (Previous Weeks):
      ${JSON.stringify(historyMetrics || [], null, 2)}
      
      Compare the current metrics against the department goals. Look at the historical data to determine if the current performance is an anomaly or a downward trend.
      
      Write a highly concise, 1 to 2 sentence "Opportunity Gap Description" that identifies the primary metric falling short and suggests what specific behavior the employee needs to focus on fixing this week. Do not use pleasantries. Be direct and actionable.
    `;

    const response = await executeWithRetry(() => generateAIContent({
      prompt,
      apiKey,
      isJSON: false
    }));
    return ((response.data as any).text || "").trim();
  } catch (error) {
    console.error("Gap Generation Error:", error);
    return "Failed to auto-generate gap. Please verify API key.";
  }
};
