import { callFirebaseAI } from './core';
import type { PlaybookScenario } from './constants';
import type { PlaybookSettings } from '../../types';

export interface CoachingMessage {
  sender: string;
  text: string;
}

export interface CoachingHistory {
  completedCoachSteps?: Record<string, boolean>;
  currentCoachStep?: string;
  messages?: CoachingMessage[];
}

export function runOfflineEmployeeCoachingStep(message: string, history: CoachingHistory, scenario: PlaybookScenario) {
  if (!history || !scenario) return { messages: [], completedCoachSteps: {}, currentCoachStep: 'goal' };
  
  const lowercaseMsg = (message || '').toLowerCase();
  let responseText = '';
  
  // Simulate GROW Model Coaching Flow: Goal -> Reality -> Options -> Will
  let currentCoachStep = history?.currentCoachStep || 'goal';
  const completedCoachSteps = { ...(history?.completedCoachSteps || {}) };
  const isVictor = scenario?.id && (scenario.id.includes('victor') || scenario.id.includes('survey'));
  const isDaniel = scenario?.id && (scenario.id.includes('daniel') || scenario.id.includes('gsp') || scenario.id.includes('warranty'));

  if (currentCoachStep === 'goal') {
    // Check if manager is asking open questions about their goals
    if (lowercaseMsg.includes('how') || lowercaseMsg.includes('goal') || lowercaseMsg.includes('target') || lowercaseMsg.includes('what do you think') || lowercaseMsg.includes('where')) {
      completedCoachSteps.goal = true;
      currentCoachStep = 'reality';
      if (isVictor) {
        responseText = `Yeah, my goal is to maintain a 4.8 Survey Index like the store wants, but it feels impossible when I'm trying to lead in card apps and memberships. I have to move super fast on the floor to get those numbers. Do you want sales volume or surveys?`;
      } else if (isDaniel) {
        responseText = `My goal is to hit a 12% GSP attach rate, but it feels really hard. Customers are already spending a lot of money and they just say no as soon as I bring up Geek Squad or AppleCare. I don't see how I can change their minds.`;
      } else {
        responseText = `Yeah, my goal is to meet store metrics, but it feels impossible right now. Everyone says it is too expensive. I ask them, they say no, and I just move on. What am I supposed to do, force them?`;
      }
    } else {
      if (isVictor) {
        responseText = `I know my survey numbers are low, but I'm bringing in 13 credit cards and 11 memberships! I don't feel like a few bad surveys should matter when I'm leading the store. (Tip: Ask an open question to guide him to reflect on his goals!)`;
      } else if (isDaniel) {
        responseText = `I know my GSP attach is down at 7.5%, but I'm pitching it to everyone at checkout. They just don't want it. (Tip: Ask an open question to understand his personal goal for protection attach!)`;
      } else {
        responseText = `I know my numbers are low, but I don't feel like I can force people. What do you expect me to do differently? (Tip: Ask an open question to understand the employee's personal goals!)`;
      }
    }
  } 
  
  else if (currentCoachStep === 'reality') {
    // Check if manager is showing empathy and exploring the current reality instead of just lecturing
    const empathetic = lowercaseMsg.includes('understand') || lowercaseMsg.includes('hard') || lowercaseMsg.includes('tell me') || lowercaseMsg.includes('happen') || lowercaseMsg.includes('feel') || lowercaseMsg.includes('agree');
    if (empathetic) {
      completedCoachSteps.reality = true;
      currentCoachStep = 'options';
      if (isVictor) {
        responseText = `To be honest, I get so focused on pitching the My Best Buy card and Total membership during the checkout that once they say yes, I just want to ring them up quickly and move on to the next customer in line. I guess I don't spend any time explaining support, writing my name down, or thanking them. I just rush them out.`;
      } else if (isDaniel) {
        responseText = `Honestly, I wait until the very end at the checkout register to mention Geek Squad Protection or AppleCare+. They are already looking at a high total, and when I add another $100+ for protection, they look at me like I'm crazy. It feels super awkward to bring it up so late.`;
      } else {
        responseText = `Honestly, I wait until the checkout register to mention My Best Buy Total. They are already paying $1,000 for a laptop, and then when I add another $179, they look at me like I'm crazy. It feels super pushy to do it at the register.`;
      }
    } else {
      responseText = `It's easy for you to say 'just improve.' You aren't the one dealing with customers all day. (Tip: Show empathy, validate their frustration/hurry, and ask where exactly in the interaction they bring up GSP/surveys!)`;
    }
  } 
  
  else if (currentCoachStep === 'options') {
    // Check if manager is brainstorming options collaboratively (options stage)
    if (lowercaseMsg.includes('try') || lowercaseMsg.includes('what if') || lowercaseMsg.includes('option') || lowercaseMsg.includes('how about') || lowercaseMsg.includes('introduce') || lowercaseMsg.includes('slow') || lowercaseMsg.includes('early')) {
      completedCoachSteps.options = true;
      currentCoachStep = 'will';
      if (isVictor) {
        responseText = `Hmm... I guess I could slow down at the end. Instead of rushing them off, I could take a moment to write my name on a receipt card, walk them through their new membership benefits, and ask them to let me know how I did on the survey. That would actually build a better connection and probably stop those bad surveys.`;
      } else if (isDaniel) {
        responseText = `Hmm... I guess I could introduce protection plans earlier in the conversation, like during the product demo. When we are looking at mobile phones or laptops, I can say, "Since you are always traveling, drops/spill coverage is essential," rather than waiting until the register. That makes sense.`;
      } else {
        responseText = `Hmm... I guess I could introduce it earlier in the conversation. Like, when we are looking at laptops, I could say 'This laptop qualifies for free setup and a full year of support under our Total membership.' That way they see the value *before* we reach the register. That makes sense.`;
      }
    } else {
      if (isVictor) {
        responseText = `So what am I supposed to do? Stop pitching credit cards so I can chat with people? (Tip: Collaborate on options, like slowing down at checkout, writing down your name, and explaining benefits!)`;
      } else if (isDaniel) {
        responseText = `I don't know. If they don't want it, they don't want it. Do you want me to just pitch GSP as a mandatory fee? (Tip: Collaborate on options, like introducing protection earlier during the demo by tying it to their usage!)`;
      } else {
        responseText = `I don't know what else to do. If I tell them about it, they don't want it. (Tip: Collaborate on options, like introducing memberships earlier during the product demo!)`;
      }
    }
  } 
  
  else if (currentCoachStep === 'will') {
    // Will / Commitment
    if (lowercaseMsg.includes('will') || lowercaseMsg.includes('commit') || lowercaseMsg.includes('agree') || lowercaseMsg.includes('next steps') || lowercaseMsg.includes('track') || lowercaseMsg.includes('touch base') || lowercaseMsg.includes('when')) {
      completedCoachSteps.will = true;
      if (isVictor) {
        responseText = `I can definitely agree to do that! I will slow down and spend an extra minute with every customer at checkout, write my name down, and confidently ask for 5-star survey feedback on my next 10 interactions. Let's touch base on Friday to check my survey index. Thanks, boss!`;
      } else if (isDaniel) {
        responseText = `I will commit to trying that! I'll introduce protection plans early during needs discovery in my next 5 sales interactions and see if customer reactions improve. Let's touch base on Friday to review my GSP attach rate. Thanks for the coaching, boss!`;
      } else {
        responseText = `I can definitely agree to do that! I will try introducing the membership early in my next 5 interactions and see how customers react. Let's touch base on Friday to see how it went. Thanks for coaching me through this and not just writing me up, boss!`;
      }
    } else {
      responseText = `Alright, I can try. But how will we track if this actually works? (Tip: Establish a clear behavioral commitment, set a timeline, and agree on a follow-up Friday review!)`;
    }
  } 
  
  else {
    responseText = `Thanks boss! Let's get back to the floor. I've got this!`;
  }
  
  const updatedHistory = [
    ...(history?.messages || []),
    { sender: 'coach', text: message || '' },
    { sender: 'employee', text: responseText }
  ];
  
  return {
    messages: updatedHistory,
    completedCoachSteps,
    currentCoachStep
  };
}

// Evaluate Manager's Coaching Session

export function evaluateCoachingSession(history: CoachingHistory) {
  if (!history) return { score: 0, passed: false, feedback: "No coaching history provided.", details: { empathy: 0, structure: 0, actionable: 0 } };
  const steps = history?.completedCoachSteps || {};
  
  const score = Math.round(
    (steps.goal ? 25 : 0) +
    (steps.reality ? 25 : 0) +
    (steps.options ? 25 : 0) +
    (steps.will ? 25 : 0)
  );
  
  let coachFeedback;
  if (score === 100) {
    coachFeedback = "Outstanding job! You guided Jordan flawlessly through the GROW model. You established his goal, explored his reality with deep empathy, brainstormed options collaboratively, and locked in a firm behavioral commitment for follow-up.";
  } else if (score >= 75) {
    coachFeedback = "Great coaching session! You used the GROW structure effectively, though you could have explored his obstacles (Reality) a bit deeper before jumping to solutions.";
  } else {
    coachFeedback = "This was a good conversation, but it felt a bit directive. To coach effectively 'like we would' at Best Buy, try to ask more open-ended questions rather than telling them what to do. Focus on guiding the employee to discover the solutions themselves.";
  }
  
  return {
    score,
    passed: score >= 75,
    feedback: coachFeedback,
    details: {
      empathy: steps.reality ? 100 : 40,
      structure: score,
      actionable: steps.will ? 100 : 30
    }
  };
}

// -------------------------------------------------------------
// LIVE GOOGLE GEMINI GENERATIVE SERVICE
// -------------------------------------------------------------

// Helper to check if API key is active

export function generateCoachingLogLocal(name: string, gapType: string, gapDetails: string, positives: string, rawObservation: string, selectedDiscSteps: string[] | string) {
  const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');
  const formattedObs = rawObservation ? ` Based on observation: "${rawObservation}".` : '';

  let what = '';
  let how = '';
  let why = '';
  let strengths = positives || `Demonstrates high professionalism, warm customer connections, and maintains good checkout pace.`;
  let calculatedGapDetails = gapDetails || `Needs focused development in ${gapType || 'general'} attachment/objection handling to meet standard benchmarks.`;
  let expectation = '';
  let validation = '';

  const cleanGapType = String(gapType || '').toLowerCase();

  if (cleanGapType.includes('membership')) {
    what = `Uncover customer membership status early in the conversation and pitch My Best Buy Plus/Total benefits. Focus on ${stepsText} steps.`;
    how = `Always ask: "Are you currently a My Best Buy member?" and match benefits: "With My Best Buy Total, this purchase includes 24/7 tech support and protection coverage."${formattedObs}`;
    why = `Secures customer lifetime value, builds paid member loyalty, and drives store paid services attach metrics.`;
    expectation = `Consistently introduce the membership program on at least 70% of customer interactions, aiming for 2+ new paid memberships weekly.`;
    validation = `Leader will perform 3 side-by-side floor observations during peak weekend shifts to verify membership pitching behaviors.`;
  } else if (cleanGapType.includes('card') || cleanGapType.includes('credit')) {
    what = `Early-introduce the Best Buy Credit Card rewards and financing benefits during consultative solution building. Focus on ${stepsText} steps.`;
    how = `Say: "By putting this on your Best Buy Card, you'll earn 5% back in rewards today—that is $50 back on this purchase!" Address objections with interest-free financing options.${formattedObs}`;
    why = `Decreases sales floor purchase friction, increases average transaction ticket size, and meets store financing benchmarks.`;
    expectation = `Pitch credit card benefits to all clients making hardware purchases over $150, target 1+ card application submitted weekly.`;
    validation = `Leader will shadow 3 checkout transactions to monitor financing pitches and objection handling techniques.`;
  } else if (cleanGapType.includes('warranty') || cleanGapType.includes('protection') || cleanGapType.includes('gsp')) {
    what = `Pitch Geek Squad Protection or AppleCare+ as a complete safety solution when presenting hardware options. Focus on ${stepsText} steps.`;
    how = `Say: "I always recommend adding Geek Squad Protection because it covers accidental drops, spills, and hardware failures for peace of mind."${formattedObs}`;
    why = `Safeguards client technology investments, increases store paid services profitability, and supports store benchmarks.`;
    expectation = `Present GSP or AppleCare+ on 100% of eligible hardware devices, maintaining a department attach index of 12%+.`;
    validation = `Leader will review the weekly department protection attach reports and perform follow-up shadowing on Monday.`;
  } else if (cleanGapType.includes('survey') || cleanGapType.includes('star')) {
    what = `Establish strong checkout rapport and explicitly request a 5-star customer feedback survey. Focus on ${stepsText} steps.`;
    how = `Slow down, write your name on the receipt sleeve, and say: "I hope I made your checkout easy today! My name is ${name || 'Advisor'}. If you get a survey in your email, please take 30 seconds to rate my service 5 stars!"${formattedObs}`;
    why = `Improves Net Promoter Score (NPS), drives customer retention index, and showcases team member service quality.`;
    expectation = `Ensure the receipt sleeve is personalized and the survey pitch is delivered to at least 5 clients daily, aiming for 2+ positive weekly mentions.`;
    validation = `Leader will shadow the register queue for 30 minutes during peak hours to verify receipt sleeve usage.`;
  } else {
    // RPH or Fallback
    what = `Deliver a complete solution to every customer by pitching appropriate accessories and services alongside hardware. Focus on ${stepsText} steps.`;
    how = `Map the full setup: "To get the most out of your new device, let's add the essential setup accessories and backup protection." Address objections with value benefits.${formattedObs}`;
    why = `Raises overall Revenue Per Hour (RPH) performance to align with the store target of $1,200/hr.`;
    expectation = `Consistently add at least 2 attachment items to hardware quotes, targeting a weekly average RPH of $1,200+.`;
    validation = `Leader will review hourly sales ledger data on the employee performance dashboard next Friday.`;
  }

  return {
    what,
    how,
    why,
    strengths,
    gapDetails: calculatedGapDetails,
    expectation,
    validation
  };
}

// Audit store floor layout and queue metrics using Gemini Vision

export async function runGeminiEmployeeCoachingStep(apiKey: string | undefined, message: string, history: CoachingHistory, employeeScenario: PlaybookScenario, playbookSettings: PlaybookSettings, pastCoachingSummary: string, onStream?: (text: string) => void) {
  try {
    if (!history || !employeeScenario) return runOfflineEmployeeCoachingStep(message, history, employeeScenario);
    
    // Format conversation history
    const historyString = (history?.messages || []).map(m => {
      const roleName = m.sender === 'coach' ? 'Store Supervisor (User)' : 'Employee (Gemini)';
      return `${roleName}: ${m.text}`;
    }).join('\n');
    
    // Construct system instructions
    const systemPrompt = `
      You are roleplaying as a Best Buy Retail Employee being coached by your Store Supervisor/Manager.
      
      Your Employee Profile:
      - Name: ${employeeScenario?.name || 'Employee'}
      - Personality / Behavior Type: ${employeeScenario?.personality || 'Normal'}
      - Description: ${employeeScenario?.description || 'Retail employee'}
      - Performance Gap Focus: ${employeeScenario?.metricGap || 'General'}
      
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
      Respond to the Store Supervisor's last message: "${message || ''}".
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
      "${message || ''}"
      
      Provide your JSON response matching the employee role:
    `;

    const result = await callFirebaseAI({
      prompt: systemPrompt + '\\n' + prompt,
      isProMode: playbookSettings?.aiMode === 'pro',
      isJSON: true,
      isVision: false,
      apiKey: apiKey,
      schemaType: 'employee_coaching_step'
    });
    
    const finalResponseText = result.text;
    
    if (onStream) {
       try {
         const tempParsed = JSON.parse(finalResponseText);
         if (tempParsed.responseText) {
           onStream(tempParsed.responseText);
         }
       } catch (e) {
       }
    }

    let data: any;
    try {
      const parsedData = JSON.parse(finalResponseText);
      data = {
        responseText: parsedData?.responseText || "I'm not sure what to say to that.",
        currentCoachStep: parsedData?.currentCoachStep || history?.currentCoachStep || 'goal',
        completedCoachSteps: {
          goal: parsedData?.completedCoachSteps?.goal ?? !!history?.completedCoachSteps?.goal,
          reality: parsedData?.completedCoachSteps?.reality ?? !!history?.completedCoachSteps?.reality,
          options: parsedData?.completedCoachSteps?.options ?? !!history?.completedCoachSteps?.options,
          will: parsedData?.completedCoachSteps?.will ?? !!history?.completedCoachSteps?.will
        }
      };
    } catch (parseError) {
      console.warn("Incomplete or invalid JSON from stream, falling back to manual extraction", parseError);
      
      let extractedText = "I'm not sure how to answer that.";
      const textMatch = finalResponseText.match(/"responseText"\s*:\s*"([^]*?)"(?:,|\s*\})/);
      if (textMatch) {
        extractedText = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      } else {
         const partialMatch = finalResponseText.match(/"responseText"\s*:\s*"([^]*)/);
         if (partialMatch) {
           extractedText = partialMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
         }
      }
      
      data = {
        responseText: extractedText,
        currentCoachStep: history?.currentCoachStep || 'goal',
        completedCoachSteps: { ...(history?.completedCoachSteps || {}) }
      };
      
      const stepMatch = finalResponseText.match(/"currentCoachStep"\s*:\s*"([^"]+)"/);
      if (stepMatch) data.currentCoachStep = stepMatch[1];
      
      const goalMatch = finalResponseText.match(/"goal"\s*:\s*(true|false)/);
      if (goalMatch) data.completedCoachSteps.goal = goalMatch[1] === 'true';
      
      const realityMatch = finalResponseText.match(/"reality"\s*:\s*(true|false)/);
      if (realityMatch) data.completedCoachSteps.reality = realityMatch[1] === 'true';
      
      const optionsMatch = finalResponseText.match(/"options"\s*:\s*(true|false)/);
      if (optionsMatch) data.completedCoachSteps.options = optionsMatch[1] === 'true';
      
      const willMatch = finalResponseText.match(/"will"\s*:\s*(true|false)/);
      if (willMatch) data.completedCoachSteps.will = willMatch[1] === 'true';
    }
    
    const updatedMessages = [
      ...(history?.messages || []),
      { sender: 'coach', text: message || '' },
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

export async function evaluateCoachingSessionGemini(apiKey: string | undefined, history: CoachingHistory, scenario: PlaybookScenario, playbookSettings: PlaybookSettings) {
  try {
    if (!history || !scenario) return evaluateCoachingSession(history);
    
    const dialogueStr = (history?.messages || []).map(m => `${m.sender === 'coach' ? 'Supervisor' : 'Employee'}: ${m.text}`).join('\n');
    
    const evaluationPrompt = `
      You are a Best Buy Store General Manager. Evaluate the following coaching conversation between a Store Supervisor and a Retail Employee (${scenario?.name || 'Employee'}).
      
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

    const result = await callFirebaseAI({
      prompt: evaluationPrompt,
      isProMode: playbookSettings?.aiMode === 'pro',
      isJSON: true,
      isVision: false,
      apiKey: apiKey,
      schemaType: 'evaluate_coaching_session'
    });
    const parsed = JSON.parse(result.text);
    return {
      score: parsed?.score || 0,
      passed: parsed?.passed ?? false,
      feedback: parsed?.feedback || "Feedback could not be generated.",
      details: {
        empathy: parsed?.details?.empathy || 0,
        structure: parsed?.details?.structure || 0,
        actionable: parsed?.details?.actionable || 0
      }
    };
  } catch (error) {
    console.error('Gemini Coaching Evaluation Error:', error);
    return evaluateCoachingSession(history);
  }
}

// Generate structured 4-Section Coaching Log using Gemini
