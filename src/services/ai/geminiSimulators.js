import { getGeminiModel } from './core.js';
import { runOfflineSimulationStep, evaluateSessionOffline, runOfflineEmployeeCoachingStep, evaluateCoachingSession } from './offlineSimulators.js';

export async function runGeminiSimulationStep(apiKey, message, history, scenario, playbookSettings) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    // Format conversation history
    const historyString = history.messages.map(m => {
      const roleName = m.sender === 'advisor' ? 'Sales Advisor (User)' : 'Customer (Gemini)';
      return `${roleName}: ${m.text}`;
    }).join('\n');
    
    // Construct system instructions
    const systemPrompt = `
      You are roleplaying as a Best Buy Customer. 
      Your Profile:
      - Name: ${scenario.name}
      - Needs: ${scenario.needs}
      - Core Objections: Memberships objection: "${scenario.objections.membership}", Warranty objection: "${scenario.objections.warranty}", Card objection: "${scenario.objections.card}".
      - General Mood: ${scenario.difficulty === 'Hard' ? 'Slightly resistant but curious' : 'Friendly, wants technical assistance'}
      
      Playbook Guidelines (Coaching standard):
      - Allowed/Preferred Phrases: ${playbookSettings.allowedPhrases ? playbookSettings.allowedPhrases.join(', ') : 'My Best Buy Plus, My Best Buy Total, Geek Squad Protection, AppleCare+'}
      - Prohibited/Forbidden Phrases: ${playbookSettings.forbiddenPhrases ? playbookSettings.forbiddenPhrases.join(', ') : 'warranty, pushy, contract'}
      - Custom Instructions: ${playbookSettings.customSystemPrompt || 'Evaluate based on Best Buy customer principles.'}

      Current Sales Flow Stages to watch:
      1. Welcome/Connect (building rapport, greeting)
      2. Understand/Discover (asking open-ended usage questions, preferences, setup)
      3. Recommend/Sell (product recommendation, My Best Buy membership mention)
      4. Protect (Geek Squad Protection/AppleCare recommendation)
      5. Close (Best Buy Credit Card financing/rewards pitch, finalize sale)

      INSTRUCTION:
      Respond to the Sales Advisor's last message: "${message}".
      Keep your response highly natural, retail-grounded, and conversational. Do not sound like an AI. Act exactly like a real human customer in a Best Buy store.
      
      You must reply strictly in a structured JSON format to allow client-side tracking.
      JSON Format:
      {
        "responseText": "Your spoken dialogue response to the sales advisor here.",
        "currentActiveStep": "connect" | "discover" | "recommend" | "protect" | "close",
        "completedSteps": {
          "connect": true/false (has advisor successfully connected?),
          "discover": true/false (has advisor discovered needs?),
          "recommend": true/false (has advisor recommended product and membership?),
          "protect": true/false (has advisor recommended warranty?),
          "close": true/false (has advisor recommended card and closed?)
        }
      }
    `;

    const prompt = `
      Conversation History:
      ${historyString}
      
      Advisor's New Message:
      "${message}"
      
      Provide your JSON response matching the customer role:
    `;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n' + prompt }] }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText);
    
    // Update simulated metrics based on steps completed
    const currentMetrics = { ...history.metrics };
    if (data.completedSteps.connect) currentMetrics.surveys = 5.0;
    if (data.completedSteps.recommend) currentMetrics.memberships = 100;
    if (data.completedSteps.protect) currentMetrics.warranty = 100;
    if (data.completedSteps.close) {
      currentMetrics.creditCards = 1;
      currentMetrics.rph = 1450;
    }
    
    const updatedMessages = [
      ...history.messages,
      { sender: 'advisor', text: message },
      { sender: 'customer', text: data.responseText }
    ];
    
    return {
      messages: updatedMessages,
      completedSteps: data.completedSteps,
      currentActiveStep: data.currentActiveStep,
      metrics: currentMetrics
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fall back to offline simulation seamlessly in case of error
    return runOfflineSimulationStep(message, history, scenario, playbookSettings);
  }
}

// Evaluate Roleplay session using Gemini

export async function evaluateSessionGemini(apiKey, history, scenario, playbookSettings) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    const dialogueStr = history.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    const evaluationPrompt = `
      You are a Best Buy Sales Evaluator and Coach. Evaluate the following sales roleplay transcript between a Sales Advisor and a Customer (${scenario.name}).
      
      Transcript:
      ${dialogueStr}
      
      Playbook standards:
      - Allowed Terms: ${playbookSettings.allowedPhrases ? playbookSettings.allowedPhrases.join(', ') : 'My Best Buy Total/Plus, GSP'}
      - Prohibited Terms: ${playbookSettings.forbiddenPhrases ? playbookSettings.forbiddenPhrases.join(', ') : 'warranty'}

      Evaluate on a 0-100 scale for each Best Buy Sales Flow Step:
      - Connect: Greeting, welcoming, building emotional connection/rapport.
      - Discover: Probing questions, understanding the 'why' and context of college.
      - Recommend: Correct product suggestion, mentioning My Best Buy memberships.
      - Protect: Recommending Geek Squad Protection (GSP) or AppleCare.
      - Close: Offering Best Buy Credit Card financing/rewards, and asking for the sale.

      Also evaluate on Best Buy's core values:
      - Be Human
      - Make It Easy
      - Show What's Possible

      Provide the coaching feedback using the GROW framework:
      - Goal: The ideal standard.
      - Reality: What the advisor actually did well or missed.
      - Options: 3 concrete action steps they can take next time.
      - Will: A call to action.

      You must reply strictly in structured JSON matching this schema:
      {
        "overallScore": number (0-100),
        "passed": boolean (overallScore >= 80),
        "breakdown": {
          "connect": number,
          "discover": number,
          "recommend": number,
          "protect": number,
          "close": number
        },
        "values": {
          "beHuman": number,
          "makeItEasy": number,
          "showWhatPossible": number
        },
        "growReport": {
          "goal": "string",
          "reality": "string",
          "options": ["string", "string", "string"],
          "will": "string"
        }
      }
    `;

    const result = await model.generateContent(evaluationPrompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini Evaluation Error:', error);
    return evaluateSessionOffline(history, scenario, playbookSettings);
  }
}

// Run employee simulation step using Gemini with past coaching history context

export async function runGeminiEmployeeCoachingStep(apiKey, message, history, employeeScenario, playbookSettings, pastCoachingSummary) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    // Format conversation history
    const historyString = history.messages.map(m => {
      const roleName = m.sender === 'coach' ? 'Store Supervisor (User)' : 'Employee (Gemini)';
      return `${roleName}: ${m.text}`;
    }).join('\n');
    
    // Construct system instructions
    const systemPrompt = `
      You are roleplaying as a Best Buy Retail Employee being coached by your Store Supervisor/Manager.
      
      Your Employee Profile:
      - Name: ${employeeScenario.name}
      - Personality / Behavior Type: ${employeeScenario.personality}
      - Description: ${employeeScenario.description}
      - Performance Gap Focus: ${employeeScenario.metricGap}
      
      Your Historical Coaching Logs (Long-Term Memory):
      ${pastCoachingSummary || 'No previous coaching logs recorded.'}
      
      GROW Coaching Framework Stages:
      1. Goal (Establish what the employee wants to achieve, their target index or attachment goal).
      2. Reality (Explore current status, obstacles, and validate their feelings/stress. The employee is initially defensive, arrogant, or conflict-avoidant, but opens up when the coach shows empathy).
      3. Options (Collaborative brainstorming of floor strategies, pitch methods, or behavior changes. E.g. slowing down at checkout, pitching earlier, using receipt sleeves).
      4. Will (Confirm commitment, set clear behavioral targets, and agree on a timeline/review check-in).

      Coaching Guidelines & Tone Rules:
      - Start defensive, transaction-focused, or avoidant depending on your profile. Only transition to the next stage of GROW (e.g. from Goal to Reality, or Reality to Options) if the supervisor responds appropriately (e.g., asking open-ended questions, validating your stress, asking for your ideas, or setting follow-up agreements).
      - If the supervisor behaves too directively (e.g., lecturing you, ordering you, or threatening write-ups), remain defensive, closed-off, or simple in your answers.
      - Recall your past coaching history. If the supervisor mentions a goal you agreed to in a previous session, react to it realistically (e.g., "Yeah, I know we talked about checking membership status last week, but it was just so busy on Monday...").
      - Act like a real human employee. Do NOT say things like "As a Best Buy retail employee..." or "Under the GROW framework..." Keep it strictly in-character as the retail employee.
      
      Playbook Constraints:
      - Allowed Terms: ${playbookSettings?.allowedPhrases ? playbookSettings.allowedPhrases.join(', ') : 'My Best Buy Plus/Total, Geek Squad Protection, AppleCare+'}
      - Prohibited Terms: ${playbookSettings?.forbiddenPhrases ? playbookSettings.forbiddenPhrases.join(', ') : 'warranty, contract'}
      - Custom Instructions: ${playbookSettings?.customSystemPrompt || 'Ground coaching responses in store sales floor experiences.'}

      INSTRUCTION:
      Respond to the Store Supervisor's last message: "${message}".
      Keep your response natural, store-grounded, and professional yet realistic.
      
      You must reply strictly in a structured JSON format to allow client-side tracking of GROW coaching progress.
      JSON Format:
      {
        "responseText": "Your spoken dialogue response to the supervisor here.",
        "currentCoachStep": "goal" | "reality" | "options" | "will",
        "completedCoachSteps": {
          "goal": true/false (has supervisor successfully guided you through defining the goal?),
          "reality": true/false (has supervisor explored your obstacles and shown empathy?),
          "options": true/false (has supervisor brainstormed floor strategies collaboratively with you?),
          "will": true/false (has supervisor locked in a firm behavioral commitment and follow-up?)
        }
      }
    `;

    const prompt = `
      Conversation History:
      ${historyString}
      
      Supervisor's New Message:
      "${message}"
      
      Provide your JSON response matching the employee role:
    `;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n' + prompt }] }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText);
    
    const updatedMessages = [
      ...history.messages,
      { sender: 'coach', text: message },
      { sender: 'employee', text: data.responseText }
    ];
    
    return {
      messages: updatedMessages,
      completedCoachSteps: data.completedCoachSteps,
      currentCoachStep: data.currentCoachStep
    };
  } catch (error) {
    console.error('Gemini Employee Coaching Step Error:', error);
    // Fall back to offline simulation seamlessly in case of error
    return runOfflineEmployeeCoachingStep(message, history, employeeScenario);
  }
}

// Evaluate coaching session using Gemini

export async function evaluateCoachingSessionGemini(apiKey, history, scenario, playbookSettings) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    const dialogueStr = history.messages.map(m => `${m.sender === 'coach' ? 'Supervisor' : 'Employee'}: ${m.text}`).join('\n');
    
    const evaluationPrompt = `
      You are a Best Buy Store General Manager. Evaluate the following coaching conversation between a Store Supervisor and a Retail Employee (${scenario.name}).
      
      Coaching Transcript:
      ${dialogueStr}
      
      Playbook standards:
      - Allowed Terms: ${playbookSettings?.allowedPhrases ? playbookSettings.allowedPhrases.join(', ') : 'My Best Buy Total/Plus, GSP'}
      - Prohibited Terms: ${playbookSettings?.forbiddenPhrases ? playbookSettings.forbiddenPhrases.join(', ') : 'warranty'}

      Evaluate on a 0-100 scale for each Best Buy Coaching Skill:
      - Empathy & Listening (Reality Stage): How well the supervisor showed empathy, validated the employee's concerns, and listened to their challenges instead of lecturing.
      - GROW Structure Alignment: How well they followed the Goal -> Reality -> Options -> Will flow, transitioning only when the employee was ready.
      - Actionable Commitment: Did they define specific behavioral floor actions (Will Stage) and schedule a concrete review date/timeline (e.g. next Friday check-in)?

      Provide feedback and tips under a GROW structure:
      - Goal: The target coaching style (leading with humanity, collaborative guidance).
      - Reality: Critique of what the supervisor did well and what they missed.
      - Options / WILL: Development suggestions for the supervisor to improve their coaching style.

      You must reply strictly in structured JSON matching this schema:
      {
        "score": number (overall score 0-100),
        "passed": boolean (overall score >= 75),
        "feedback": "string (combined general feedback and development tips)",
        "details": {
          "empathy": number (0-100),
          "structure": number (0-100),
          "actionable": number (0-100)
        }
      }
    `;

    const result = await model.generateContent(evaluationPrompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini Coaching Evaluation Error:', error);
    return evaluateCoachingSession(history);
  }
}

// Generate structured 4-Section Coaching Log using Gemini

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

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

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



export const generateCustomScenario = async (prompt, apiKey) => {
  if (!isGeminiAvailable(apiKey)) {
    throw new Error('Gemini API key is required to generate scenarios.');
  }

  const model = getGeminiModel(apiKey, { aiMode: 'pro' });

  const systemInstruction = `You are an expert Best Buy store manager and scenario designer. Generate a realistic retail training scenario based on the user's prompt. 
Return ONLY valid JSON that matches this exact schema, with NO markdown formatting, NO backticks, and NO other text:
{
  "title": "Short title",
  "name": "Customer Name",
  "category": "Computing|Home Theatre|Mobile|Appliances|Front End|Geek Squad",
  "difficulty": "Easy|Medium|Hard",
  "greeting": "The exact first words the customer says to start the interaction",
  "customerNeeds": "A description of what the customer is looking for and their current mood",
  "objections": {
    "memberships": "Why they don't want a Plus/Total membership",
    "protection": "Why they don't want Geek Squad Protection/AppleCare",
    "creditCard": "Why they don't want the Best Buy Credit Card"
  },
  "keywords": {
    "connect": "comma, separated, words, for, building, rapport",
    "discover": "comma, separated, words, for, uncovering, needs",
    "recommend": "comma, separated, words, for, pitching, solutions",
    "protect": "comma, separated, words, for, offering, GSP, AppleCare, Total"
  }
}`;

  try {
    const result = await model.generateContent([systemInstruction, prompt]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/`json/g, '').replace(/`/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to generate custom scenario:', err);
    throw new Error('AI failed to generate scenario. Please try again.');
  }
};

