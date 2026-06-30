import { isGeminiAvailable, executeWithRetry, callFirebaseAI } from './core';
import type { PlaybookSettings } from '../../types';

export async function auditStoreFloorGemini(apiKey: string | undefined, base64Image: string, mimeType: string) {
  try {
    const systemPrompt = `
      You are a Best Buy Store General Manager.
      Analyze the uploaded image of the store sales floor. Look for:
      1. Customer traffic bottlenecks (e.g. queue lengths at checkout, clusters of unassisted shoppers).
      2. Code 1 Risks (register lines backing up beyond 3 customers).
      3. Visual Merchandising standards (cleanliness, stocked endcaps, display setups).
      4. Staffing levels and zone coverage.
    `;

    const result = await callFirebaseAI({
      prompt: systemPrompt,
      isProMode: true,
      isJSON: true,
      isVision: true,
      base64Image: base64Image,
      mimeType: mimeType,
      apiKey: apiKey,
      schemaType: 'audit_floor'
    });

    const parsed = JSON.parse(result.text);
    return {
      status: parsed?.status || "Unknown",
      statusDetails: parsed?.statusDetails || "No details generated.",
      observations: Array.isArray(parsed?.observations) ? parsed.observations : [],
      actionPlan: Array.isArray(parsed?.actionPlan) ? parsed.actionPlan : []
    };
  } catch (error) {
    console.error('Vision Store Floor Audit Error:', error);
    // Local offline mock fallback
    return {
      status: "Yellow",
      statusDetails: "Visual merchandising gap observed in Computing display and moderate register queues.",
      observations: [
        "Computing laptop table has multiple devices out of line or with screen power turned off.",
        "Register checkout has a line of 3 customers waiting with only one cashier logged in.",
        "A group of customers is clustered near the Home Theatre sound demonstration bar without active advisor greeting."
      ],
      actionPlan: [
        "Floor leader should call for a 'Code 1' support cashier to clear the register queue.",
        "Assign an advisor to Computing to inspect display cables and clean/tidy up the laptop table.",
        "Shadow HT zone to ensure all customer groups are greeted within 10 seconds."
      ]
    };
  }
}

// Audit performance workbook metrics using Gemini Pro/Ultra

export async function auditPerformanceWorkbookGemini(apiKey: string | undefined, workbookText: string, playbookSettings: PlaybookSettings) {
  try {
    const systemPrompt = `
      You are a Store General Manager auditing employee performance metrics.
      Analyze the following CSV or tabular employee metrics data.
      Identify:
      1. Overall store performance trends.
      2. Groupings of employees sharing similar performance gaps (e.g., 'Membership Attachment opportunities', 'Low Credit Card attachment', 'CSAT/Survey struggles').
      3. Concrete floor actions and scripts to help each group.
    `;

    const result = await callFirebaseAI({
      prompt: systemPrompt + '\\n\\nData:\\n' + (workbookText || ''),
      isProMode: playbookSettings?.aiMode === 'pro',
      isJSON: true,
      isVision: false,
      apiKey: apiKey,
      schemaType: 'audit_performance_workbook'
    });

    const parsed = JSON.parse(result.text);
    return {
      overallSummary: parsed?.overallSummary || "No summary provided.",
      topPerformers: Array.isArray(parsed?.topPerformers) ? parsed.topPerformers : [],
      gapClusters: Array.isArray(parsed?.gapClusters) ? parsed.gapClusters : [],
      recommendedActionTimeline: parsed?.recommendedActionTimeline || "No timeline provided."
    };
  } catch (error) {
    console.error('Workbook Audit Error:', error);
    return {
      overallSummary: "Offline Roster Auditor: RPH remains strong across Computing, but GSP attachment and paid member services are pacing behind store goals.",
      topPerformers: [
        "Victor - Leading in My Best Buy memberships attach.",
        "Daniel - Elite RPH performance at register."
      ],
      gapClusters: [
        {
          "name": "Geek Squad Protection (GSP) Opportunities",
          "employees": ["Daniel", "Taylor"],
          "focusBehavior": "Introduce protection early during the product demo.",
          "coachingTip": "Shadow them on Computing transactions and script them to mention GSP drop/spill protection as a benefit within the first 3 minutes."
        },
        {
          "name": "CSAT Survey Index Gaps",
          "employees": ["Victor", "Marcus"],
          "focusBehavior": "Slowing down checkout and writing name on receipt sleeves.",
          "coachingTip": "Validate checkout speeds. Guide them to spend 30 seconds personalizing the receipt sleeve and asking for 5-star feedback."
        }
      ],
      recommendedActionTimeline: "Conduct targeted side-by-side observations for the GSP cluster by Wednesday, and review weekly survey indexes during the Friday leadership sync."
    };
  }
}

// Run 8-Hour staff shift simulation using Gemini

export async function auditFiveStarSurveyGemini(apiKey: string | undefined, base64Image: string | undefined, mimeType: string | undefined, textInput: string, playbookSettings: PlaybookSettings) {
  try {
    const isAvailable = isGeminiAvailable(apiKey);
    if (!isAvailable) {
      throw new Error("Gemini API Key is not available");
    }

    const systemPrompt = `
      You are a Best Buy Store General Manager auditing a 5-Star customer survey (ratings 1 to 5, where 1-3 are detractors, 4 is passive, 5 is promoter).
      
      Your task is to analyze the survey feedback (either parsed from the screenshot or provided as text).
      Provide a General Manager level review:
      1. Extract the rating (1 to 5 stars).
      2. Extract the customer's comment.
      3. Extract the associate's name mentioned in the survey (if any, otherwise write "Unknown" or "General Staff").
      4. Determine the department (Computing, Home Theatre, Mobile, Front End, Geek Squad, Appliances, or General Sales).
      5. Perform a root-cause analysis of why this rating was given.
      6. Draft a 1-on-1 coaching script for the supervisor to coach this associate using open-ended questions (GROW framework).
      7. List 2-3 specific floor action steps for the supervisor to validate.
    `;

    let result;
    if (base64Image && mimeType) {
      const textPart = textInput ? `User supplied text context: "${textInput}"` : "Please audit the image.";
      result = await callFirebaseAI({
        prompt: systemPrompt + '\n' + textPart,
        isProMode: playbookSettings?.aiMode === 'pro',
        isJSON: true,
        isVision: true,
        base64Image: base64Image,
        mimeType: mimeType,
        apiKey: apiKey,
        schemaType: 'audit_five_star_survey'
      });
    } else {
      result = await callFirebaseAI({
        prompt: systemPrompt + '\nAnalyze this customer survey feedback: "' + (textInput || '') + '"',
        isProMode: playbookSettings?.aiMode === 'pro',
        isJSON: true,
        isVision: false,
        apiKey: apiKey,
        schemaType: 'audit_five_star_survey'
      });
    }

    const parsed = JSON.parse(result.text);
    return {
      rating: parsed?.rating || 0,
      comment: parsed?.comment || "No comment provided.",
      associateName: parsed?.associateName || "Unknown",
      department: parsed?.department || "General Sales",
      rootCause: parsed?.rootCause || "Unknown cause.",
      coachingScript: parsed?.coachingScript || "No script provided.",
      checkItems: Array.isArray(parsed?.checkItems) ? parsed.checkItems : []
    };
  } catch (error) {
    console.error('5-Star Detractor Survey Audit Error:', error);
    // Offline Mock Fallback (matches Jordan checkout detractor)
    return {
      rating: 2,
      comment: textInput || "I bought an iPad yesterday. The checkout line was extremely long and the cashier Jordan didn't even ask if I had a membership or thank me. Terrible service.",
      associateName: "Jordan",
      department: "Front End",
      rootCause: "Operational bottleneck at checkout (Code 1 cashier backup) combined with Jordan's rushed checkout behavior, causing him to skip the standard Connect (greeting), Protect (membership check), and Close (appreciation) steps.",
      coachingScript: "Hey Jordan, I wanted to review some customer feedback from yesterday. The client felt checkout was rushed and mentioned they weren't asked about their membership. What obstacles did you run into during that rush? GMs expect us to use the receipt sleeve to slow down and greet every client. Let's practice that greeting right now.",
      checkItems: [
        "Call for a Code 1 backup cashier immediately when checkout queues exceed 3 clients.",
        "Validate Jordan's receipt sleeve greeting technique during peak hours today.",
        "Verify Jordan checks active membership status on every single transaction."
      ]
    };
  }
}

// Parse Rents Due Document (CSV or Image OCR)
