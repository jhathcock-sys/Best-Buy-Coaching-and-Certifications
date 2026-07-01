// Pre-defined offline simulation dialogue database for standard scenarios
export const OFFLINE_DIALOGUES = {
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


export function runOfflineSimulationStep(message: string, history: Record<string, any>, scenario: Record<string, any>) {
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
    ...(history.messages || []),
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
export function evaluateSessionOffline(history: Record<string, any>) {
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

export function runOfflineEmployeeCoachingStep(message: string, history: Record<string, any>, scenario: Record<string, any>) {
  const lowercaseMsg = message.toLowerCase();
  let responseText;
  
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
    ...(history.messages || []),
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

export function evaluateCoachingSession(history: Record<string, any>) {
  const steps = history.completedCoachSteps || {};
  
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

export function generateCoachingLogLocal(name: string, gapType: string, gapDetails: string, positives: string, rawObservation: string, selectedDiscSteps: string | string[]) {
  const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');
  const formattedObs = rawObservation ? ` Based on observation: "${rawObservation}".` : '';

  let what;
  let how;
  let why;
  let strengths = positives || `Demonstrates high professionalism, warm customer connections, and maintains good checkout pace.`;
  let calculatedGapDetails = gapDetails || `Needs focused development in ${gapType} attachment/objection handling to meet standard benchmarks.`;
  let expectation;
  let validation;

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
 

