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

// Pre-defined offline simulation dialogue database for standard scenarios
const OFFLINE_DIALOGUES = {
  'computing-college': {
    connect: {
      met: "Thanks for greeting me so nicely. Yes, my freshman is heading to college for engineering. We want something that will last him all four years, but honestly, it needs to be reliable. He's a bit clumsy, and I don't want to have to buy a new computer in a year. What do you recommend?",
      unmet: "Hello... yes, I just need a computer for my son. What computers do you have? (Tip: Build a connection, introduce yourself, ask his name or congrats on college!)"
    },
    discover: {
      met: "He'll be doing a lot of intensive coding, 3D modeling, and general coursework. He prefers something lighter so he can carry it between dorms and classes easily. Our budget is around $1,200, but we can stretch a bit if it really makes a difference. What's a good brand?",
      unmet: "Well, like I said, he is going to college. Do you have a list of required laptops? Or do you just pick one off the shelf? (Tip: Ask about his major, daily usage, screen size preferences, or budget!)"
    },
    recommend: {
      metMembership: "Oh, so the My Best Buy Total membership gives us free shipping, discounts, and tech support? That sounds useful, but $179 is a lot to add today on top of the laptop. Also, what happens if he drops the laptop and cracks the screen? Is that covered in the membership?",
      metNoMembership: "That laptop looks beautiful and extremely fast! But wow, $1,199 is right at our budget limit. Does this come with any setup help or tech support? Or any discounts?",
      unmet: "I'm not sure about these laptops. Why should I buy this one instead of just ordering something online? (Tip: Propose a specific laptop model like a MacBook or Premium Windows device, and introduce My Best Buy Plus/Total membership!)"
    },
    protect: {
      met: "Wow, Geek Squad Protection covering accidental drops and spills is huge! Especially since it's included or discounted with the Total membership. That gives me real peace of mind. Okay, we should definitely do that laptop, the protection, and the membership. Is there any way to split up this total cost over time?",
      unmet: "I am really worried about him dropping it, but adding even more money for protection is hard. Is there no other way to get it covered? (Tip: Recommend Geek Squad Protection (GSP) or AppleCare+, highlighting drop/spill protection!)"
    },
    close: {
      met: "Really? 12 months interest-free financing or 10% back in rewards on our first purchase today with the Best Buy Card? That is perfect! That completely solves the budget stretch. Let's do the application and get everything rung up today. Thank you so much, you made this so easy and human!",
      unmet: "Okay, so the total is pretty high. I guess I'll just put it on my debit card, unless there are any special payment programs or rewards we get for spending this much today? (Tip: Propose the Best Buy Credit Card, explaining the 12-month interest-free financing or 10% back in rewards!)"
    }
  },
  'ht-gaming': {
    connect: {
      met: "Yeah, I just got the PS5 Pro, and I want a TV that can actually support its full graphical capabilities. I've heard OLED has the best picture quality and low input lag, but they seem pretty pricey. What do you recommend?",
      unmet: "Hello. I am looking for a TV. I heard OLED is good. What do you have? (Tip: Ask his name, build a connection, and congratulate him or ask about his gaming setup!)"
    },
    discover: {
      met: "I'll be setting this up in my bedroom, which gets a moderate amount of light. I want something around 55 or 65 inches, and it needs to support 120Hz refresh rates and HDMI 2.1 for the PS5 Pro. I'll also be wall-mounting it. What models should I look at?",
      unmet: "Well, I just want a TV that looks good. What features should I care about for gaming? (Tip: Ask about his room light levels, TV size preference, wall-mounting plans, or audio setup!)"
    },
    recommend: {
      metMembership: "The LG OLED C4 sounds awesome for gaming! But you mentioned the My Best Buy Total membership for $179. I only buy a TV once every few years, so I don't see why a membership makes sense for me. Does it include mounting/installation help?",
      metNoMembership: "The LG OLED C4 looks absolutely gorgeous! But $1,599 is a big investment. Does this include any delivery, setup help, or technical support? Or is there any membership discount?",
      unmet: "I'm not sure which TV to choose. Why should I buy an OLED here instead of just looking online? (Tip: Propose a specific OLED model like the LG C4, and introduce My Best Buy Plus/Total membership!)"
    },
    protect: {
      met: "Oh, so Geek Squad Protection covers screen burn-in and panel degradation? That's actually my biggest fear with OLEDs. And getting it discounted with the membership is a nice touch. I'll definitely add the protection plan.",
      unmet: "Doesn't it already come with a manufacturer warranty? Why pay extra for Geek Squad protection? (Tip: Recommend Geek Squad Protection (GSP), highlighting screen burn-in coverage!)"
    },
    close: {
      met: "Wow, 12 months interest-free financing or 10% back in rewards on this purchase with the Best Buy Card? That makes a $1,600 TV purchase a lot easier to manage. Let's do the credit card application and get the TV and mounting set up!",
      unmet: "I'm ready to buy, but paying $1,600 out of pocket all at once is a bit steep. (Tip: Close by offering Best Buy Card financing options or 10% back in rewards!)"
    }
  },
  'geek-repair': {
    connect: {
      met: "Thank you for being so kind. I get so nervous with technology. Every time I open the computer, these loud red screens pop up saying my bank details are stolen. I haven't clicked anything, but I am terrified. Can you help me clean this computer?",
      unmet: "Hello, my computer is acting up. It has warning popups. Can you fix it? (Tip: Build rapport, reassure her, let her know it's a common scam, and ask her name!)"
    },
    discover: {
      met: "The computer is about three years old. I mostly use it to look at pictures of my grandchildren, send emails, and check my news. I have all my family photos saved on there, and I don't want to lose them. Is there any way to back them up?",
      unmet: "Well, I don't know much about computers. What do you need to know to fix it? (Tip: Ask about her computer's age, whether she has important backups/photos, and what she uses it for!)"
    },
    recommend: {
      metMembership: "So this My Best Buy Total membership for $179 includes the virus clean-up and a year of unlimited support? That sounds nice, but I only need this fixed once. Why should I pay for a whole year?",
      metNoMembership: "So you can clean it up for me? That's wonderful. But what does it cost to fix it and make sure it doesn't happen again? Do you have any support plans?",
      unmet: "I don't know if I should just buy a new computer or try to fix this one. What do you recommend? (Tip: Propose a professional Geek Squad diagnostic/cleanup, and introduce My Best Buy Total for support!)"
    },
    protect: {
      met: "Having 24/7 support and security software like Webroot included makes me feel much safer. If another popup appears, I can just call you or bring it in. That really gives me peace of mind. Let's do the membership and cleanup.",
      unmet: "How do I know this won't happen again next week? Is there some software or extra help? (Tip: Recommend security software and ongoing support options to give her peace of mind!)"
    },
    close: {
      met: "Thank you so much! You made this so easy and pleasant. Let's write up the work order, set up the appointment, and get this taken care of.",
      unmet: "Okay, let's get it set up, what are the next steps to get it checked in? (Tip: Close the session by finalizing the service order and setting up her check-in appointment!)"
    }
  }
};

// Offline Sandbox Dialogue Simulation Engine
export function runOfflineSimulationStep(message, history, scenario, guidelines) {
  const lowercaseMsg = message.toLowerCase();
  
  // Create a tracking object based on what keywords are found
  const completedSteps = { ...history.completedSteps };
  let currentActiveStep = history.currentActiveStep || 'connect';
  let responseText = "";
  
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
function getGeminiModel(apiKey, playbookSettings) {
  const aiInstance = new GoogleGenerativeAI(apiKey);
  const isProMode = playbookSettings?.aiMode === 'pro';
  // Use official stable Google AI Studio models: gemini-1.5-pro for complex auditing and GROW coaching logs, gemini-1.5-flash for fast simulation
  const modelName = isProMode ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
  return aiInstance.getGenerativeModel({ model: modelName });
}

// Run a Generative simulation step using Gemini
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
export async function generateCoachingLogGemini(apiKey, name, gapType, gapDetails, positives, rawObservation, playbookSettings, selectedDiscSteps) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    let fewShotTrainingText = '';
    if (playbookSettings && playbookSettings.trainingLogs && playbookSettings.trainingLogs.length > 0) {
      fewShotTrainingText = `
        MATCH THESE EXEMPLARY COACHING LOGS EXACTLY:
        Below are actual examples of high-quality coaching logs previously written by this store's leadership. You must replicate their exact tone of voice, formatting structures, depth of explanation, Best Buy terminology (like "human" and "make it easy"), and overall layout:
        
        ${playbookSettings.trainingLogs.map((log, idx) => `EXEMPLAR LOG #${idx + 1}:\n${log}`).join('\n\n')}
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

      ${playbookSettings && playbookSettings.customSystemPrompt ? `ADDITIONAL CUSTOM COACHING GUIDELINES:\n${playbookSettings.customSystemPrompt}` : ''}
      
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

// Parse daily schedule image using Gemini Flash Vision
export async function parseScheduleImage(base64Data, mimeType, apiKey) {
  try {
    const aiInstance = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for fast vision processing
    const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
      You are an administrative assistant for a Best Buy store.
      Analyze the uploaded image, which is a screenshot or photo of a daily store floor schedule or TLC schedule printout.
      
      Extract the list of scheduled employees. For each employee, identify:
      1. Their Name (e.g. "Julianna", "Ricky", "Corey T.", "Joey Z").
      2. Their scheduled Shift Time Range (e.g. "9:00 AM - 5:30 PM", "12:00 PM - 8:30 PM", or similar format). Ensure you capture the start and end times clearly with AM/PM or in a 24-hour format if printed that way.
      3. Their assigned Department or Zone (e.g. "Computing", "Mobile", "Home Theatre", "Front End", "Geek Squad", "Appliances", "Customer Service", "Warehouse"). If not printed or clear, make an educated guess or leave it as "General Sales".
      
      You must reply strictly in a structured JSON format.
      The output must be a JSON array of objects, where each object matches this schema:
      {
        "name": "string",
        "shift": "string",
        "zone": "string"
      }
      Do not include any explanation or markdown formatting outside of the JSON block. Return only the raw JSON.
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }, imagePart] }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Vision Parse Error:', error);
    throw error;
  }
}

// Generate structured 4-Section Coaching Log Offline/Locally
export function generateCoachingLogLocal(name, gapType, gapDetails, positives, rawObservation, selectedDiscSteps) {
  const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');
  const formattedObs = rawObservation ? ` Based on observation: "${rawObservation}".` : '';

  let what = '';
  let how = '';
  let why = '';
  let strengths = positives || `Demonstrates high professionalism, warm customer connections, and maintains good checkout pace.`;
  let calculatedGapDetails = gapDetails || `Needs focused development in ${gapType} attachment/objection handling to meet standard benchmarks.`;
  let expectation = '';
  let validation = '';

  const cleanGapType = String(gapType).toLowerCase();

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
export async function auditStoreFloorGemini(apiKey, base64Image, mimeType, playbookSettings) {
  try {
    const aiInstance = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-pro for deep vision audits
    const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const systemPrompt = `
      You are a Best Buy Store General Manager.
      Analyze the uploaded image of the store sales floor. Look for:
      1. Customer traffic bottlenecks (e.g. queue lengths at checkout, clusters of unassisted shoppers).
      2. Code 1 Risks (register lines backing up beyond 3 customers).
      3. Visual Merchandising standards (cleanliness, stocked endcaps, display setups).
      4. Staffing levels and zone coverage.
      
      Respond strictly in a structured JSON format.
      JSON Format:
      {
        "status": "Green" | "Yellow" | "Red",
        "statusDetails": "A single sentence summarizing the overall floor state.",
        "observations": [
          "List 3-4 bullet points detailing specific things you see in the photo."
        ],
        "actionPlan": [
          "List 2-3 immediate action items for the Floor Leader to address."
        ]
      }
      Do not include any markdown fences or explanation outside the JSON block. Return only raw JSON.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }, imagePart] }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(result.response.text());
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
export async function auditPerformanceWorkbookGemini(apiKey, workbookText, playbookSettings) {
  try {
    const model = getGeminiModel(apiKey, playbookSettings);
    
    const systemPrompt = `
      You are a Store General Manager auditing employee performance metrics.
      Analyze the following CSV or tabular employee metrics data.
      Identify:
      1. Overall store performance trends.
      2. Groupings of employees sharing similar performance gaps (e.g., 'Membership Attachment opportunities', 'Low Credit Card attachment', 'CSAT/Survey struggles').
      3. Concrete floor actions and scripts to help each group.
      
      Respond strictly in a structured JSON format.
      JSON Format:
      {
        "overallSummary": "A concise paragraph summarizing store performance based on metrics.",
        "topPerformers": [
          "Name - Callout strength (e.g. Victor leading in Credit Cards)"
        ],
        "gapClusters": [
          {
            "name": "Cluster name (e.g. GSP / Protection Gaps)",
            "employees": ["Name 1", "Name 2"],
            "focusBehavior": "What behavior needs to change (e.g., pitching earlier in discovery).",
            "coachingTip": "Actionable script or floor exercise for this group."
          }
        ],
        "recommendedActionTimeline": "A timeline/plan for the leadership team this week."
      }
      Do not include markdown or explanations. Return only raw JSON.
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nData:\n' + workbookText }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(result.response.text());
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


