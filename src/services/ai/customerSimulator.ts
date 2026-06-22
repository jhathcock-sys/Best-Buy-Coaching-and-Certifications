// Customer Roleplay Simulator (Gemini + Offline Fallback)
import { getGeminiModel } from './core.js';
import { OFFLINE_DIALOGUES } from './offlineSimulators.js';

export function runOfflineSimulationStep(message, history, scenario) {
  const lowercaseMsg = message.toLowerCase();
  
  // Create a tracking object based on what keywords are found
  const completedSteps = { ...history.completedSteps };
  let currentActiveStep = history.currentActiveStep || 'connect';
  let responseText;
  
  const scid = scenario.id;
  const isStandard = OFFLINE_DIALOGUES[scid] !== undefined;
  
  // Welcome / Connect
  if (currentActiveStep === 'connect') {
    const metConnect = scenario.successKeywords.connect.some(kw => lowercaseMsg.includes(kw));
    if (metConnect || lowercaseMsg.length > 15) {
      completedSteps.connect = true;
      currentActiveStep = 'discover';
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].connect.met 
        : `Thanks for greeting me so nicely. Yes, my name is ${scenario.name || 'Customer'}. I am looking for a product that fits my needs: ${scenario.needs || 'good performance'}.`;
    } else {
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].connect.unmet 
        : `Hello... yes, my name is ${scenario.name || 'Customer'}. What options do you have? (Tip: Build a connection, introduce yourself, ask his name or congrats!)`;
    }
  }
  
  // Understand / Discover
  else if (currentActiveStep === 'discover') {
    const metDiscover = scenario.successKeywords.discover.some(kw => lowercaseMsg.includes(kw));
    if (metDiscover) {
      completedSteps.discover = true;
      currentActiveStep = 'recommend';
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].discover.met 
        : `I'm looking for something that addresses my needs: ${scenario.needs || 'good reliability'}. What specific models do you recommend?`;
    } else {
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].discover.unmet 
        : `Well, what features should I look for? (Tip: Ask about their usage, preferences, room/setup details, or budget!)`;
    }
  }
  
  // Recommend / Sell
  else if (currentActiveStep === 'recommend') {
    const pitchedMembership = lowercaseMsg.includes('membership') || lowercaseMsg.includes('total') || lowercaseMsg.includes('plus');
    const metRecommend = scenario.successKeywords.recommend.some(kw => lowercaseMsg.includes(kw));
    
    if (metRecommend && !pitchedMembership) {
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].recommend.metNoMembership 
        : `That sounds like a great recommendation! But does this come with any setup help or tech support? Or any discounts?`;
    } else if (metRecommend && pitchedMembership) {
      completedSteps.recommend = true;
      currentActiveStep = 'protect';
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].recommend.metMembership 
        : `Oh, so the My Best Buy Total membership gives us setup help, support, and discounts? That sounds useful, but adding that on top is a lot. Also, what happens if this product breaks? Is that covered in the membership?`;
    } else {
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].recommend.unmet 
        : `I'm not sure which option to choose. Why should I buy this product here? (Tip: Propose a specific product model, and introduce My Best Buy Plus/Total membership!)`;
    }
  }
  
  // Protect / Warranty Attach
  else if (currentActiveStep === 'protect') {
    const metProtect = scenario.successKeywords.protect.some(kw => lowercaseMsg.includes(kw));
    if (metProtect) {
      completedSteps.protect = true;
      currentActiveStep = 'close';
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].protect.met 
        : `Wow, Geek Squad Protection covering accidental damage/spills is huge! Especially since it's included or discounted with the Total membership. That gives me real peace of mind. Okay, let's do the product, the protection, and the membership. Is there any way to split up this total cost over time?`;
    } else {
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].protect.unmet 
        : `I am worried about it breaking, but adding even more money for protection is hard. Is there no other way to get it covered? (Tip: Recommend Geek Squad Protection (GSP) or AppleCare+, highlighting accidental coverage!)`;
    }
  }
  
  // Close / Credit Card Pitch
  else if (currentActiveStep === 'close') {
    const pitchedCard = lowercaseMsg.includes('card') || lowercaseMsg.includes('financing') || lowercaseMsg.includes('rewards') || lowercaseMsg.includes('credit');
    if (pitchedCard) {
      completedSteps.close = true;
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].close.met 
        : `Really? 12 months interest-free financing or 10% back in rewards on our first purchase today with the Best Buy Card? That is perfect! That completely solves the budget stretch. Let's do the application and get everything rung up today. Thank you so much, you made this so easy and human!`;
    } else {
      responseText = isStandard 
        ? OFFLINE_DIALOGUES[scid].close.unmet 
        : `Okay, so the total is pretty high. I guess I'll just put it on my debit card, unless there are any special payment programs or rewards we get for spending this much today? (Tip: Propose the Best Buy Credit Card, explaining the 12-month interest-free financing or 10% back in rewards!)`;
    }
  }
  
  // If we are at the end, just wrap up
  else {
    responseText = `Awesome! I'm completely set. Thank you for setting us up for success. You coached me through this perfectly!`;
  }
  
  // Update simulated metrics based on steps completed
  const currentMetrics = { ...history.metrics };
  if (completedSteps.connect) currentMetrics.surveys = 5.0;
  if (completedSteps.recommend) currentMetrics.memberships = 100;
  if (completedSteps.protect) currentMetrics.warranty = 100;
  if (completedSteps.close) {
    currentMetrics.creditCards = 1;
    currentMetrics.rph = 1450;
  }
  
  const updatedHistory = [
    ...history.messages,
    { sender: 'advisor', text: message },
    { sender: 'customer', text: responseText }
  ];
  
  return {
    messages: updatedHistory,
    completedSteps,
    currentActiveStep,
    metrics: currentMetrics
  };
}

// Offline Session Evaluator

export function evaluateSessionOffline(history) {
  const steps = history.completedSteps || {};
  
  // Calculate scores
  const connectScore = steps.connect ? 100 : 50;
  const discoverScore = steps.discover ? 100 : 40;
  const recommendScore = steps.recommend ? 100 : 30;
  const protectScore = steps.protect ? 100 : 20;
  const closeScore = steps.close ? 100 : 10;
  
  const averageScore = Math.round((connectScore + discoverScore + recommendScore + protectScore + closeScore) / 5);
  const passed = averageScore >= 80;
  
  // Map behaviors to Best Buy Values
  const beHuman = Math.round(connectScore * 0.7 + discoverScore * 0.3);
  const makeItEasy = Math.round(discoverScore * 0.4 + recommendScore * 0.4 + closeScore * 0.2);
  const showWhatPossible = Math.round(recommendScore * 0.3 + protectScore * 0.5 + closeScore * 0.2);
  
  let reality = "You established standard parameters. ";
  if (steps.connect && steps.discover) {
    reality += "You did an excellent job building early rapport and discovering the college freshman major needs.";
  } else {
    reality += "You jumped straight into products without fully connecting or understanding the student's requirements.";
  }
  
  if (steps.recommend && steps.protect) {
    reality += " Great job explaining the peace of mind offered by Geek Squad Protection.";
  } else {
    reality += " Protection attach was a missed opportunity today.";
  }
  
  const feedback = {
    overallScore: averageScore,
    passed,
    breakdown: {
      connect: connectScore,
      discover: discoverScore,
      recommend: recommendScore,
      protect: protectScore,
      close: closeScore
    },
    values: {
      beHuman,
      makeItEasy,
      showWhatPossible
    },
      growReport: {
        goal: "Achieve consultative sales excellence by demonstrating full capability in discovering needs, matching memberships/warranty, and closing with BBY Credit Card solutions.",
        reality: reality,
      options: [
        "Be Human: Next time, congratulations the parent/student early to build deeper rapport before asking technical questions.",
        "Make It Easy: Introduce My Best Buy memberships as a shield or umbrella package to save them money on support rather than a separate retail line.",
        "Show What's Possible: Position Geek Squad protection in discovery (e.g. 'He will be carrying this around campus, drops/spills are super common, we have a total care package...')."
      ],
      will: "Execute roleplay again focusing on smooth credit card financing transitions. Commitment: Pitch the card in every budget-straining scenario."
    }
  };
  
  return feedback;
}

// MOCK employee response generator for Manager's Coaching practice

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
    return runOfflineSimulationStep(message, history, scenario);
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
    return evaluateSessionOffline(history);
  }
}

// Run employee simulation step using Gemini with past coaching history context
