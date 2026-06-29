# Proposed Application Fortifications

Based on a deep architectural review of the existing offline state—including `roster`, `rentsDue` ledgers, `coachingHistory`, `dailySnapshots`, and `playbookSettings`—the Research Agent has identified 4 high-impact opportunities to make the current application more robust, agentic, and dynamic without needing live APIs.

> [!NOTE]
> All of these proposals rely exclusively on the data we already have stored in Zustand or Firebase. No external API integration is required, honoring our core constraint.

### 1. Dynamic Breakroom TV (Data Aggregation & Gamification)
- **Current State:** `BreakroomTVPage.tsx` looks great but relies on a completely hardcoded `storeGoals` object (e.g., `revenue: 42500, goal: 50000`).
- **Fortification:** Wire the Breakroom TV to dynamically aggregate real-time metrics (Revenue, PMs, Apps) from the active `roster` and `dailySnapshots`, comparing them directly to `deptGoals`. Introduce a **"Rent Payer Leaderboard"** slide that automatically queries the `RentsDueLedger` state and publicly celebrates employees who have achieved "Paid Full Rent" status, increasing gamification and accountability.

### 2. Automated "Rent's Due" Recovery Plans (AI Coaching)
- **Current State:** `RentsDueAuditor.tsx` takes an uploaded CSV of metrics and highlights who is "Off-Track" vs "On-Track". It stops at auditing.
- **Fortification:** Transform this into an agentic workflow. When an employee is marked as "Off-Track", automatically trigger an AI sub-routine that reads their specific gap and the store's `playbookSettings` to generate a personalized **"Rent Recovery Action Plan"**. This plan would instantly populate the employee's `followUpTasks` with a custom Roleplay Scenario specifically designed to target their weakness (e.g., a Credit Card objection-handling scenario if they owe Apps).

### 3. Coaching Impact Correlator (Analytics)
- **Current State:** `CoachingHistoryPage.tsx` provides a static list of past coaching sessions and a text-to-speech reader. It does not measure if the coaching actually worked.
- **Fortification:** Build an **"Impact Score"** into the Coaching History hub. By comparing an employee's `dailySnapshots` metrics in the 7 days *before* a coaching session to the 7 days *after*, the app can autonomously tag coaching sessions as "High Impact 🟢" (if RPH or PMs improved) or "Needs Follow-up 🔴" (if metrics remained stagnant). This proactively prompts the manager to re-engage struggling associates based on historical data.

### 4. Smart Shift Handoff Summaries (Floor Leader)
- **Current State:** `FloorLeaderTrackerPage.tsx` tracks active shifts, breaks, and zones, but the shift handoff process heavily relies on the manager manually typing notes.
- **Fortification:** Enhance the Handoff Modal by feeding the `activeShift` state (break schedules, zone assignments, active gaps) and the day's `dailySnapshots` into the Gemini AI engine. The system will generate an **"Agentic Shift Handoff Briefing"** that instantly briefs the incoming Floor Leader on who missed their breaks, which zones are bleeding revenue, and which associates require an immediate check-in based on recent `coachingLogs`.

---

## User Review Required

Please review these 4 fortification proposals. Which of these features would you like to build out next? We can build them all sequentially, or pick one to start. Let me know how you would like to proceed!
