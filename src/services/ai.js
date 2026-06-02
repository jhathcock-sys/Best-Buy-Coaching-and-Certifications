import { GoogleGenerativeAI } from '@google/generative-ai';

// Pre-defined Customer Scenarios
export const STANDARD_SCENARIOS = [
  {
    id: 'computing-college',
    title: 'Computing: College Prep',
    role: 'Customer',
    name: 'Sarah Miller',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    description: 'Mother shopping for a laptop for her college-bound freshman son.',
    category: 'Computing',
    difficulty: 'Medium',
    initialGreeting: "Hi there, my son is heading off to college next month and needs a laptop. I really don't know much about computers and don't want to buy the wrong thing. Can you help us?",
    needs: 'Durability, long battery life, and enough speed for engineering apps.',
    objections: {
      membership: "Wait, why does that membership cost $179? That seems like a lot for just shipping and discounts.",
      warranty: "Computers always break or spill, I am so worried he will drop it or ruin it in the dorms.",
      card: "I don't think we need another credit card, I'll probably just pay with my debit card."
    },
    successKeywords: {
      connect: ['hello', 'hi', 'welcome', 'introduce', 'name', 'how are', 'college', 'congrats', 'freshman'],
      discover: ['major', 'engineering', 'use it for', 'budget', 'prefer', 'screen size', 'need', 'requirements'],
      recommend: ['laptop', 'macbook', 'spectre', 'yoga', 'plus', 'total', 'membership', 'benefits'],
      protect: ['geek squad', 'protection', 'gsp', 'accidental', 'spill', 'drop', 'warranty', 'coverage'],
      close: ['financing', 'bby card', 'rewards', '10% back', 'monthly', 'check out', 'ring you up', 'ready']
    }
  },
  {
    id: 'ht-gaming',
    title: 'Home Theater: OLED Upgrade',
    role: 'Customer',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Tech enthusiast wanting a high-end OLED TV for gaming on his new PS5 Pro.',
    category: 'Home Theater',
    difficulty: 'Hard',
    initialGreeting: "Hey! I'm looking to upgrade my living room setup. I just got a PS5 Pro and my current 4K TV is old and laggy. I heard OLED is the way to go, but they seem pretty pricey.",
    needs: 'HDMI 2.1, 120Hz, low input lag, deep blacks, smart home integration.',
    objections: {
      membership: "I buy things here maybe once a year, I don't see why a membership makes sense for me.",
      warranty: "Doesn't it already come with a manufacturer warranty? Why pay extra for Geek Squad?",
      card: "A credit card? No thanks, I don't want to damage my credit score."
    },
    successKeywords: {
      connect: ['welcome', 'name', 'gaming', 'ps5', 'pro', 'congrats', 'awesome', 'nice to meet'],
      discover: ['hdmi 2.1', '120hz', 'objections', 'light', 'bright', 'mounting', 'sound', 'size', 'room'],
      recommend: ['oled', 'c4', 'b4', 'bravia', 'soundbar', 'total', 'plus', 'installation', 'mounting'],
      protect: ['burn-in', 'panel', 'geek squad', 'gsp', 'mounting coverage', 'protection', 'five years'],
      close: ['12 months', 'financing', 'rewards', '10% back', 'card', 'checkout', 'get this setup', 'order']
    }
  },
  {
    id: 'geek-repair',
    title: 'Geek Squad: Virus Recovery',
    role: 'Customer',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    description: 'Senior citizen whose laptop is sluggish and riddled with popup warning screens.',
    category: 'Geek Squad Services',
    difficulty: 'Easy',
    initialGreeting: "Hello... I am so frustrated. My computer keeps flashing these scary red screens saying I have viruses and need to call a number. I'm afraid to touch it. Can you fix it?",
    needs: 'Patience, clear explanations without jargon, software cleanup, virus security.',
    objections: {
      membership: "Oh, that Total membership includes support? But what if I only need you once? $179 is steep.",
      warranty: "My laptop is two years old, I don't think it has any warranty left.",
      card: "I don't use credit cards at my age, I just write checks or pay cash."
    },
    successKeywords: {
      connect: ['welcome', 'help', 'don\'t worry', 'name', 'make it easy', 'safe', 'scam', 'popups'],
      discover: ['age', 'backup', 'photos', 'important', 'use for', 'security', 'antivirus'],
      recommend: ['total', 'membership', '24/7', 'geek squad', 'agent', 'unlimited', 'clean', 'webroot'],
      protect: ['protection', 'secured', 'peace of mind', 'coverage', 'support'],
      close: ['easy', 'finance', 'rewards', 'membership discounts', 'receipt', 'card', 'appointment']
    }
  }
];

// Pre-defined Employee Scenarios (for Managers to practice coaching)
export const EMPLOYEE_SCENARIOS = [
  {
    id: 'victor-surveys',
    title: 'Coaching: Victor (Surveys Gap)',
    role: 'Employee',
    name: 'Victor (Home Theatre)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    description: "Victor has high membership and credit card volume, but extremely low surveys. His hurried closing behaviors are actively damaging the customer experience.",
    metricGap: '5-Star Surveys: Failing (0.5 average)',
    initialGreeting: "Hey Boss. You wanted to see me? If this is about my survey scores again, I don't get it. I'm leading the store in memberships and credit card apps! Who cares about a few complaints when I'm bringing in the money?",
    personality: 'Arrogant, focused entirely on transactional metrics, dismissive of customer experience.',
    coachingGoal: 'Get Victor to realize that hurried closing behaviors harm long-term loyalty and coach him to focus on a high-quality human experience.'
  },
  {
    id: 'daniel-gsp',
    title: 'Coaching: Daniel (GSP Attach Gap)',
    role: 'Employee',
    name: 'Daniel (Mobile)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    description: "Daniel has elite RPH and great memberships, but his Geek Squad Protection (GSP) attach rate is at 7.5% (Goal: 12.0%).",
    metricGap: 'GSP Attach Rate: 7.5% (Goal: 12.0%)',
    initialGreeting: "Hi there. I know my protection attach numbers are a bit low this month. I always mention AppleCare+ and GSP at checkout, but they usually just say they don't want the extra cost. I don't want to push too hard.",
    personality: 'Polite, conflict-avoidant, fears being "pushy", pitches GSP as a register checklist item.',
    coachingGoal: 'Teach Daniel to pitch Geek Squad Protection and AppleCare earlier in discovery by connecting it to usage, rather than as a register checklist.'
  }
];

// Offline Sandbox Dialogue Simulation Engine
export function runOfflineSimulationStep(message, history, scenario, guidelines) {
  const lowercaseMsg = message.toLowerCase();
  
  // Create a tracking object based on what keywords are found
  const completedSteps = { ...history.completedSteps };
  let currentActiveStep = history.currentActiveStep || 'connect';
  let responseText = "";
  
  // 1. Analyze Advisor's message for Sales Flow checkpoints
  
  // Welcome / Connect
  if (currentActiveStep === 'connect') {
    const metConnect = scenario.successKeywords.connect.some(kw => lowercaseMsg.includes(kw));
    if (metConnect || lowercaseMsg.length > 15) {
      completedSteps.connect = true;
      currentActiveStep = 'discover';
      responseText = `Thanks for greeting me so nicely. Yes, my freshman is heading to college for engineering. We want something that will last him all four years, but honestly, it needs to be reliable. He's a bit clumsy, and I don't want to have to buy a new computer in a year. What do you recommend?`;
    } else {
      responseText = `Hello... yes, I just need a computer for my son. What computers do you have? (Tip: Build a connection, introduce yourself, ask his name or congrats on college!)`;
    }
  }
  
  // Understand / Discover
  else if (currentActiveStep === 'discover') {
    const metDiscover = scenario.successKeywords.discover.some(kw => lowercaseMsg.includes(kw));
    if (metDiscover) {
      completedSteps.discover = true;
      currentActiveStep = 'recommend';
      responseText = `He'll be doing a lot of intensive coding, 3D modeling, and general coursework. He prefers something lighter so he can carry it between dorms and classes easily. Our budget is around $1,200, but we can stretch a bit if it really makes a difference. What's a good brand?`;
    } else {
      responseText = `Well, like I said, he is going to college. Do you have a list of required laptops? Or do you just pick one off the shelf? (Tip: Ask about his major, daily usage, screen size preferences, or budget!)`;
    }
  }
  
  // Recommend / Sell
  else if (currentActiveStep === 'recommend') {
    const pitchedMembership = lowercaseMsg.includes('membership') || lowercaseMsg.includes('total') || lowercaseMsg.includes('plus');
    const metRecommend = scenario.successKeywords.recommend.some(kw => lowercaseMsg.includes(kw));
    
    if (metRecommend && !pitchedMembership) {
      responseText = `That laptop looks beautiful and extremely fast! But wow, $1,199 is right at our budget limit. Does this come with any setup help or tech support? Or any discounts?`;
    } else if (metRecommend && pitchedMembership) {
      completedSteps.recommend = true;
      currentActiveStep = 'protect';
      responseText = `Oh, so the My Best Buy Total membership gives us free shipping, discounts, and tech support? That sounds useful, but $179 is a lot to add today on top of the laptop. Also, what happens if he drops the laptop and cracks the screen? Is that covered in the membership?`;
    } else {
      responseText = `I'm not sure about these laptops. Why should I buy this one instead of just ordering something online? (Tip: Propose a specific laptop model like a MacBook or Premium Windows device, and introduce My Best Buy Plus/Total membership!)`;
    }
  }
  
  // Protect / Warranty Attach
  else if (currentActiveStep === 'protect') {
    const metProtect = scenario.successKeywords.protect.some(kw => lowercaseMsg.includes(kw));
    if (metProtect) {
      completedSteps.protect = true;
      currentActiveStep = 'close';
      responseText = `Wow, Geek Squad Protection covering accidental drops and spills is huge! Especially since it's included or discounted with the Total membership. That gives me real peace of mind. Okay, we should definitely do that laptop, the protection, and the membership. Is there any way to split up this total cost over time?`;
    } else {
      responseText = `I am really worried about him dropping it, but adding even more money for protection is hard. Is there no other way to get it covered? (Tip: Recommend Geek Squad Protection (GSP) or AppleCare+, highlighting drop/spill protection!)`;
    }
  }
  
  // Close / Credit Card Pitch
  else if (currentActiveStep === 'close') {
    const pitchedCard = lowercaseMsg.includes('card') || lowercaseMsg.includes('financing') || lowercaseMsg.includes('rewards') || lowercaseMsg.includes('credit');
    if (pitchedCard) {
      completedSteps.close = true;
      responseText = `Really? 12 months interest-free financing or 10% back in rewards on our first purchase today with the Best Buy Card? That is perfect! That completely solves the budget stretch. Let's do the application and get everything rung up today. Thank you so much, you made this so easy and human!`;
    } else {
      responseText = `Okay, so the total is pretty high. I guess I'll just put it on my debit card, unless there are any special payment programs or rewards we get for spending this much today? (Tip: Propose the Best Buy Credit Card, explaining the 12-month interest-free financing or 10% back in rewards!)`;
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
export function evaluateSessionOffline(history, scenario, guidelines) {
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
      goal: "Achieve Best Buy certification in consultative sales by demonstrating full capability in discovering needs, matching memberships/warranty, and closing with BBY Credit Card solutions.",
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
export function runOfflineEmployeeCoachingStep(message, history, scenario) {
  const lowercaseMsg = message.toLowerCase();
  let responseText = "";
  
  // Simulate GROW Model Coaching Flow: Goal -> Reality -> Options -> Will
  let currentCoachStep = history.currentCoachStep || 'goal';
  const completedCoachSteps = { ...history.completedCoachSteps };
  const isVictor = scenario.id && (scenario.id.includes('victor') || scenario.id.includes('survey'));
  const isDaniel = scenario.id && (scenario.id.includes('daniel') || scenario.id.includes('gsp') || scenario.id.includes('warranty'));

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
    ...history.messages,
    { sender: 'coach', text: message },
    { sender: 'employee', text: responseText }
  ];
  
  return {
    messages: updatedHistory,
    completedCoachSteps,
    currentCoachStep
  };
}

// Evaluate Manager's Coaching Session
export function evaluateCoachingSession(history) {
  const steps = history.completedCoachSteps || {};
  
  const score = Math.round(
    (steps.goal ? 25 : 0) +
    (steps.reality ? 25 : 0) +
    (steps.options ? 25 : 0) +
    (steps.will ? 25 : 0)
  );
  
  let coachFeedback = "";
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
export function isGeminiAvailable(apiKey) {
  return !!apiKey && apiKey.trim().length > 10;
}

// Initialize Gemini Client
function getGeminiModel(apiKey) {
  const aiInstance = new GoogleGenerativeAI(apiKey);
  // Using 1.5-flash which has a great free tier
  return aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// Run a Generative simulation step using Gemini
export async function runGeminiSimulationStep(apiKey, message, history, scenario, playbookSettings) {
  try {
    const model = getGeminiModel(apiKey);
    
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
      2. Understand/Discover (asking open-ended usage questions, major, setup)
      3. Recommend/Sell (laptop match, My Best Buy membership mention)
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
    const model = getGeminiModel(apiKey);
    
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

// Generate structured 4-Section Coaching Log using Gemini
export async function generateCoachingLogGemini(apiKey, name, gapType, gapDetails, positives, playbookSettings) {
  try {
    const aiInstance = new GoogleGenerativeAI(apiKey);
    const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let fewShotTrainingText = '';
    if (playbookSettings && playbookSettings.trainingLogs && playbookSettings.trainingLogs.length > 0) {
      fewShotTrainingText = `
        MATCH THESE EXEMPLARY COACHING LOGS EXACTLY:
        Below are actual examples of high-quality coaching logs previously written by this store's leadership. You must replicate their exact tone of voice, formatting structures, depth of explanation, Best Buy terminology (like "human" and "make it easy"), and overall layout:
        
        ${playbookSettings.trainingLogs.map((log, idx) => `EXEMPLAR LOG #${idx + 1}:\n${log}`).join('\n\n')}
      `;
    }
    
    const prompt = `
      You are a Best Buy Store Leader / Coach. Build a formal employee coaching log using the Best Buy 4-Section Coaching Framework.
      Employee: ${name}
      Metric Gap Type: ${gapType}
      Gap Details: ${gapDetails}
      What they are currently doing well: ${positives || 'Highly friendly and connects well with customers.'}
      
      ${fewShotTrainingText}
      
      Generate a professional coaching log with exactly these 4 sections:
      
      SECTION 1: THE CORE OBJECTIVE (WHAT / HOW / WHY)
      - What we need them to do: [Clear behavioral action, e.g. Introduce My Best Buy Total early]
      - How we need them to do it: [Step-by-step how to pitch it. You MUST explicitly structure this behavioral plan using the Best Buy "DISC" model. Break it down strictly using: "[Discover] ... [Inspire] ... [Solve] ... [Close] ..."]
      - Why we need them to do it: [Value to customer and store goals]
      
      SECTION 2: CURRENT STRENGTHS
      - What they are currently doing well: [Emphasize their positive skills]
      
      SECTION 3: METRIC GAP
      - Gap we are trying to fill: [Compare their performance to store goals]
      
      SECTION 4: EXPECTATIONS & VALIDATION
      - Expectation of results: [SMART goal targets]
      - How we will validate: [How leader will observe or check dashboard]
      
      You must reply strictly in a structured JSON format matching this schema:
      {
        "what": "string",
        "how": "string",
        "why": "string",
        "strengths": "string",
        "metricGap": "string",
        "expectation": "string",
        "validation": "string"
      }
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    
    return JSON.parse(result.response.text());
  } catch (e) {
    console.error('Gemini Coaching Log generation error:', e);
    return null;
  }
}

