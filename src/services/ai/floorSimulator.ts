import { SchemaType } from '@google/generative-ai';
import { getGeminiModel, executeWithRetry } from './core.js';

export async function runStoreShiftSimulationGemini(apiKey, rosterData, zoneAssignments, playbookSettings) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    const prompt = `
      You are a Retail Store Shift Simulator.
      Simulate an 8-hour retail shift at Best Buy based on:
      1. Roster Metrics Profile (strengths/gaps):
      ${JSON.stringify(rosterData)}
      2. Zone Placement (which employee is assigned to which department):
      ${JSON.stringify(zoneAssignments)}

      Generate:
      1. A chronological Shift Log listing 5 key events (e.g. Hour 1, Hour 3, Hour 5, Hour 6, Hour 8). Each event should describe a customer interaction (such as a gaming TV request, a membership objection, or register queues), showing how the assigned associate handled it based on their metrics/personality.
      2. A Store Performance Scorecard showing total estimated results (Revenue, Memberships, Credit Cards, CSAT) and evaluating the manager's staffing decisions (Leadership Placement Score 0-100).
      
      Respond strictly in a structured JSON format.
      JSON Format:
      {
        "shiftLogs": [
          {
            "hour": "e.g. Hour 1 (9:00 AM)",
            "zone": "e.g. Computing",
            "event": "Description of traffic or event.",
            "advisorResponse": "How the employee handled it, reflecting their strengths or metrics gaps.",
            "impact": "e.g., Member total attached, or missed GSP opportunity."
          }
        ],
        "scorecard": {
          "revenue": 14200,
          "revenueGoal": 12000,
          "memberships": 6,
          "creditCards": 4,
          "csat": 4.7,
          "placementScore": 85,
          "placementReview": "Detailed evaluation of why the manager's zone staffing succeeded or failed (e.g. Victor has surveys gaps so placing him on Front End registers hurt CSAT, but putting Daniel on Computing boosted sales)."
        }
      }
      Do not include markdown. Return only raw JSON.
    `;

    const responseSchema: any = {
      type: SchemaType.OBJECT,
      properties: {
        shiftLogs: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              hour: { type: SchemaType.STRING },
              zone: { type: SchemaType.STRING },
              event: { type: SchemaType.STRING },
              advisorResponse: { type: SchemaType.STRING },
              impact: { type: SchemaType.STRING }
            },
            required: ["hour", "zone", "event", "advisorResponse", "impact"]
          }
        },
        scorecard: {
          type: SchemaType.OBJECT,
          properties: {
            revenue: { type: SchemaType.NUMBER },
            revenueGoal: { type: SchemaType.NUMBER },
            memberships: { type: SchemaType.NUMBER },
            creditCards: { type: SchemaType.NUMBER },
            csat: { type: SchemaType.NUMBER },
            placementScore: { type: SchemaType.NUMBER },
            placementReview: { type: SchemaType.STRING }
          },
          required: ["revenue", "revenueGoal", "memberships", "creditCards", "csat", "placementScore", "placementReview"]
        }
      },
      required: ["shiftLogs", "scorecard"]
    };

    const result = await executeWithRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    }));

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Shift Simulation Error:', error);
    // Offline Mock Fallback
    return {
      shiftLogs: [
        {
          hour: "Hour 1 (10:00 AM)",
          zone: "Computing",
          event: "A mother with a college freshman student is looking for a premium laptop upgrade.",
          advisorResponse: "Victor was assigned here. He was friendly and quickly recommended a premium MacBook. However, in his rush to hit transaction volume, he skipped introducing protection plans during the demo.",
          impact: "Laptop sold. Memberships attached, but GSP protection was missed."
        },
        {
          hour: "Hour 3 (12:00 PM)",
          zone: "Home Theatre",
          event: "A customer wants to buy a high-end LG OLED television and wants it mounted on their drywall.",
          advisorResponse: "Daniel was assigned here. He discovery-probed about drywall setup. He recommended My Best Buy Total which included delivery and mounting services, resolving their objections.",
          impact: "OLED sold. Total membership attached. TV mounting service logged."
        },
        {
          hour: "Hour 5 (3:00 PM)",
          zone: "Front End",
          event: "Register queues back up with 5 customers. An impatient customer questions the cashier about credit card rewards.",
          advisorResponse: "Marcus was cashiering. He kept his composure, handled transactions efficiently, and explained the 10% back in rewards on the Best Buy Card, securing a credit card application.",
          impact: "Queue cleared. 1 credit card application submitted. CSAT remains stable."
        },
        {
          hour: "Hour 7 (6:00 PM)",
          zone: "Mobile",
          event: "An older couple wants to activate a new prepaid phone but is highly confused about network setup fees.",
          advisorResponse: "Taylor was assigned to Mobile. Taylor was extremely patient, explained options without jargon, and set up their phone, but skipped credit card and warranty pitches.",
          impact: "Phone activated. Positive CSAT survey, but 0 attachments."
        }
      ],
      scorecard: {
        revenue: 16500,
        revenueGoal: 15000,
        memberships: 5,
        creditCards: 3,
        csat: 4.6,
        placementScore: 82,
        placementReview: "Putting Daniel in Home Theatre was a strong decision—his technical knowledge helped secure premium OLED attachments. However, placing Victor in Computing led to GSP attachment misses due to his hurried closing behaviors. Consider matching Victor with a mentor on GSP pitches."
      }
    };
  }
}

// Audit 5-Star Customer Survey using Gemini
