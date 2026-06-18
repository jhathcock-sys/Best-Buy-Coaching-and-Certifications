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
 
