export const INITIAL_ROSTER = [
  { id: 'yinel', name: 'Yinel', dept: 'Front End', hours: 34.5, memberships: 10, creditCards: 1, warranty: 22.2, surveys: 2, rph: 744, gap: 'BBY Credit Cards (1 App)' },
  { id: 'julianna', name: 'Julianna', dept: 'Computing', hours: 78.0, memberships: 6, creditCards: 2, warranty: 11.2, surveys: 1, rph: 1049, gap: 'None' },
  { id: 'muntarin', name: 'Muntarin', dept: 'Home Theatre', hours: 51.4, memberships: 4, creditCards: 0, warranty: 17.1, surveys: 1, rph: 868, gap: 'BBY Credit Cards (0 Apps)' },
  { id: 'ricky', name: 'Ricky', dept: 'General Sales', hours: 59.9, memberships: 3, creditCards: 7, warranty: 11.5, surveys: 0, rph: 649, gap: '5 Star Surveys' },
  { id: 'paulie', name: 'Paul / Paulie', dept: 'Appliances', hours: 25.0, memberships: 3, creditCards: 2, warranty: 11.6, surveys: 0, rph: 1436, gap: '5 Star Surveys' },
  { id: 'daniel', name: 'Daniel', dept: 'Mobile', hours: 30.8, memberships: 3, creditCards: 2, warranty: 7.5, surveys: 1, rph: 1386, gap: 'GSP Attach (7.5% vs 12.0%)' },
  { id: 'kevin', name: 'Kevin', dept: 'Geek Squad', hours: 43.6, memberships: 2, creditCards: 5, warranty: 4.0, surveys: 0, rph: 1460, gap: 'GSP Attach (4.0% vs 12.0%)' },
  { id: 'victor', name: 'Victor', dept: 'Home Theatre', hours: 129.1, memberships: 11, creditCards: 13, warranty: 8.0, surveys: 0.2, rph: 629, gap: '5 Star Surveys' },
  { id: 'ivan', name: 'Ivan', dept: 'Computing', hours: 69.3, memberships: 2, creditCards: 1, warranty: 6.8, surveys: 1, rph: 792, gap: 'GSP Attach & Memberships' },
  { id: 'avneet', name: 'Avneet', dept: 'Mobile', hours: 26.7, memberships: 2, creditCards: 1, warranty: 3.7, surveys: 1, rph: 404, gap: 'Multiple Gaps (1 Category)' }
];

export const DEFAULT_DEPT_GOALS = {
  'Front End': { memberships: 8.0, membershipsType: 'Hours', creditCards: 12.5, creditCardsType: 'Hours', warranty: 11.0, surveys: 1.0, rph: 640 },
  'General Sales': { memberships: 5000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 640 },
  'Appliances': { memberships: 15000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 1200 },
  'Computing': { memberships: 8000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 900, basket: 150, m365: 60.0 },
  'Mobile': { memberships: 6000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 8.0, surveys: 1.0, rph: 700 },
  'Home Theatre': { memberships: 10000, membershipsType: 'Dollars', creditCards: 12000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 800, basket: 250, audio: 35.0 },
  'Geek Squad': { memberships: 5000, membershipsType: 'Dollars', creditCards: 15000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 500 }
};

export const DEFAULT_PLAYBOOK_SETTINGS = {
  useGemini: false,
  customSystemPrompt: '',
  allowedPhrases: ['My Best Buy Plus', 'My Best Buy Total', 'Geek Squad Protection', 'AppleCare+'],
  forbiddenPhrases: ['warranty', 'pushy', 'contract'],
  storePin: '1234',
  trainingLogs: [
    `## 📋 Coaching Plan: Ricky / 5-Star Surveys

* **What**: Deliver a warmer checkout experience and explicitly ask for 5-star survey feedback at checkout.
* **How**: Slow down, write your name on the receipt sleeve, make direct eye contact, and say: "I hope I made your shopping easy today. My name is Ricky; please take 30 seconds to let me know how I did on the 5-star survey!"
* **Why**: Ensures customer loyalty, measures our store service indices, and highlights excellent human work on the checkout floor.
* **Behavior**: Secure at least 2 five-star survey mentions this week and maintain a 4.8+ survey average.
* **Validation**: Leader will perform 3 checkout observations this week and review the Sunday 5 Star survey comment log.

---
### 🔍 Background & Performance Context
* **Observed Strengths**: Excellent transactional speeds, zero cashier queue backlog, and highly professional checkout processing.
* **Performance Gap / Metric Focus**: Ricky has 0 5 Star surveys this month (store standard is maintaining 2+ five-star survey mentions per week).
* **Coaching Date**: 6/6/2026`
  ]
};

export const MANAGERS = [
  { name: 'Corey T.', role: 'Experience Manager Sales Focused', pin: '2001' },
  { name: 'Joey Z', role: 'Experience Manager Ops Focused', pin: '2002' },
  { name: 'Sam E', role: 'Experience Manager Sales Focus', pin: '2003' },
  { name: 'Lee R', role: 'Experience Supervisor Sales', pin: '2004' },
  { name: 'James H', role: 'Experience Supervisor Sales and Front End', pin: '2005' },
  { name: 'Sackett', role: 'GM', pin: '2006' },
  { name: 'Will C.', role: 'GM', pin: '2007' }
];

export const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON parsing failed:', e);
    return fallback;
  }
};
