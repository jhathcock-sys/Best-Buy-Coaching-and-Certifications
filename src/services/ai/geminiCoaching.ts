import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { getGeminiModel, isGeminiAvailable, executeWithRetry } from './core';
import type { PlaybookSettings, Employee, CoachingLog } from '../../types';

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
    const model = getGeminiModel(apiKey, playbookSettings);
    
    let fewShotTrainingText = '';
    if (playbookSettings?.trainingLogs && playbookSettings.trainingLogs.length > 0) {
      fewShotTrainingText = `
        MATCH THESE EXEMPLARY COACHING LOGS EXACTLY:
        Below are actual examples of high-quality coaching logs previously written by this store's leadership. You must replicate their exact tone of voice, formatting structures, depth of explanation, Best Buy terminology (like "human" and "make it easy"), and overall layout:
        
        ${playbookSettings.trainingLogs.slice(0, 3).map((log, idx) => `EXEMPLAR LOG #${idx + 1}:\n${log}`).join('\n\n')}
      `;
    }
    
    const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');
    
    const prompt = `
      You are an expert Retail Management Performance Coach and administrative assistant specializing in Best Buy's employee development frameworks. Your role is to help a Store Supervisor instantly generate structured, actionable coaching plans for employees based on the store's specific frameworks.
      
      Employee Name: ${name}
      Focus Area (Metric Gap): ${gapType}
      Raw Input/Gap Details: ${gapDetails || 'Needs performance coaching to meet store targets'}
      Observed Strengths: ${positives || 'Highly friendly and connects well with customers.'}
      Raw Observation / Floor Behavior: ${rawObservation || 'None provided.'}
      Selected DISC Steps to Focus On: ${stepsText}
      
      ${fewShotTrainingText}

      ${playbookSettings?.customSystemPrompt ? `ADDITIONAL CUSTOM COACHING GUIDELINES:\n${playbookSettings.customSystemPrompt}` : ''}
      
      ### 1. THE SALES FRAMEWORK (DISC):
      When analyzing the scenario or coaching focus, you must ground your recommendations in the DISC selling process defined below. Pay specific attention to the steps selected by the supervisor (${stepsText}):
      * **Discover**: Asking open-ended questions to gain insight into the customer's needs/solutions, uncovering their current membership status, and early-introducing the Best Buy Credit Card.
      * **Inspire**: Building excitement through physical or experiential product demonstrations (e.g., testing a soundbar, demoing Microsoft 365 features, putting a device directly in the customer’s hands).
      * **Solve**: Building the complete solution. This includes pitching Geek Squad Protection (GSP), applicable services, necessary accessories, and the appropriate My Best Buy membership offerings.
      * **Close**: Securing the business and finalizing the transition to checkout (e.g., "I can ring you out right here," "I'll grab that box for you," or leveraging supply chain by ordering for home delivery/store pickup).
      
      Ground your recommendations and the 'how' scripting directly in these selected steps: ${stepsText}.

      Translate this input into a highly structured coaching plan using the exact framework below:
      
      ### 2. THE OUTPUT STRUCTURE:
      Every coaching plan you generate must map to this exact layout:
      - **what**: 1-2 bullet points explicitly detailing the specific area, tool, pitch, or DISC step the employee needs to focus on during their interactions.
      - **how**: 1-2 bullet points describing the exact, actionable behavior change. You MUST include specific wording, scripting, or phrasing examples the employee should use on the floor.
      - **why**: 1-2 bullet points explaining the business or customer impact, directly tied to a key metric (e.g., Membership Efficiency, BP Efficiency, Paid Member Services, GSP Attachment, or Net Promoter Score).
      - **expectation** (Behavior): 1-2 bullet points summarizing the exact, observable behavior change that marks a successful transition on the sales floor.
      - **validation**: A clear statement detailing when and how the supervisor will actively observe, follow up, and validate that the coached behavior is being utilized.
      
      ### OPERATIONAL RULES:
      1. **Tone**: Direct, professional, floor-ready, and encouraging. Use retail-accurate terminology (e.g., Core, Blue Shirts, Code 1s, Walk out Working).
      2. **Missing Information**: If the supervisor provides a quick, raw note that lacks context for a section (like the Validation timeline), make a logical, high-standard retail assumption, but highlight it (e.g. by adding "[Verify this date/count]") so the supervisor can quickly edit it.
      
      You must reply strictly in a structured JSON format matching this schema:
      {
        "what": "string",
        "how": "string",
        "why": "string",
        "strengths": "string",
        "metricGap": "string",
        "expectation": "string",
        "validation": "string",
        "discStep": "Discover" | "Inspire" | "Solve" | "Close"
      }
    `;
    
    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        what: { type: SchemaType.STRING },
        how: { type: SchemaType.STRING },
        why: { type: SchemaType.STRING },
        strengths: { type: SchemaType.STRING },
        metricGap: { type: SchemaType.STRING },
        expectation: { type: SchemaType.STRING },
        validation: { type: SchemaType.STRING },
        discStep: { type: SchemaType.STRING }
      },
      required: ["what", "how", "why", "strengths", "metricGap", "expectation", "validation", "discStep"]
    };
    
    const result = await executeWithRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    }));
    
    const parsed = JSON.parse(result.response.text());
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

// Parse daily schedule image using Gemini Flash Vision

export const generateMonthlyOneOnOne = async (employeeData: Employee, logs: CoachingLog[], apiKey: string | undefined) => {
  try {
    const isAvailable = isGeminiAvailable(apiKey);
    if (!isAvailable) {
      throw new Error("Gemini API Key is not available");
    }

    const model = getGeminiModel(apiKey, { aiMode: 'pro' } as PlaybookSettings);

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

    const result = await executeWithRetry(() => model.generateContent(prompt));
    return result.response.text();

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
    const isAvailable = isGeminiAvailable(apiKey);
    if (!isAvailable) {
      throw new Error("Gemini API Key is not available");
    }

    const aiInstance = new GoogleGenerativeAI(apiKey!);
    const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-flash' });

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

    const result = await executeWithRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    }));
    
    const parsed = JSON.parse(result.response.text());
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

export const generatePerformanceGap = async (apiKey: string | undefined, employeeName: string, currentMetrics: Record<string, any>, historyMetrics: Record<string, any>[], departmentGoals: Record<string, any>) => {
  try {
    const isAvailable = isGeminiAvailable(apiKey);
    if (!isAvailable) {
      throw new Error("Gemini API Key is not available");
    }

    const model = getGeminiModel(apiKey, { aiMode: 'flash' } as PlaybookSettings);

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

    const result = await executeWithRetry(() => model.generateContent(prompt));
    return result.response.text().trim();
  } catch (error) {
    console.error("Gap Generation Error:", error);
    return "Failed to auto-generate gap. Please verify API key.";
  }
};
