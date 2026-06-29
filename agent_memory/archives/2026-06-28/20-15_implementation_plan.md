# Implementation Plan: Fortifications (Phases 2, 3, and 4)

We will build the three high-impact fortifications identified by the Research Agent. These will all rely strictly on offline data and state.

## Proposed Changes

---

### Phase 2: Automated "Rent's Due" Recovery Plans
We will upgrade the `RentsDueAuditor` so that managers can instantly generate AI coaching tasks for "Off-Track" employees.

#### [NEW] `src/services/ai/geminiRentRecovery.ts`
- Create `generateRentRecoveryPlan(employee, playbookSettings)`.
- Instructs Gemini to evaluate the specific missing metrics (e.g., missed Apps or PMs) and generate a targeted roleplay scenario or coaching action. Returns a `FollowUpTask` object.

#### [MODIFY] `src/components/RentsDueAuditor/RentsDueLedger.tsx`
- For employees marked "Off-Track", add a "Generate AI Recovery Plan" button (`<Wand2 />` icon).
- When clicked, invoke `generateRentRecoveryPlan` and save the result into Zustand via `addFollowUpTask`.

---

### Phase 3: Coaching Impact Correlator
We will add an autonomous layer of analytics to the Coaching History page to determine if past coaching actually improved performance.

#### [NEW] `src/utils/coachingImpact.ts`
- Create a utility function `calculateCoachingImpact(employeeId, coachingDate, dailySnapshots)`.
- It will average the employee's `rph`, `memberships`, etc. for the 7 days *before* the coaching date, and compare it to the 7 days *after*.
- Returns an impact tag: `HIGH_IMPACT`, `NEUTRAL`, or `NEEDS_FOLLOW_UP`.

#### [MODIFY] `src/pages/CoachingHistoryPage.tsx`
- Inject the `calculateCoachingImpact` utility into the render loop for each coaching log.
- Display a dynamic visual badge (e.g., "High Impact 🟢" or "Needs Follow-up 🔴") based on the historical data comparison.

---

### Phase 4: Smart Shift Handoff Summaries
We will enhance the Floor Leader capabilities by automatically generating shift handoff briefings for incoming managers.

#### [NEW] `src/services/ai/geminiHandoff.ts`
- Create `generateHandoffBriefing(activeShift, dailySnapshots)`.
- Instructs Gemini to write a concise, professional handoff briefing highlighting which zones are struggling, who missed breaks, and who needs an immediate check-in.

#### [NEW] `src/components/FloorLeader/ShiftHandoffModal.tsx`
- A glassmorphic modal containing a "Generate AI Handoff" button.
- Displays the generated briefing text.

#### [MODIFY] `src/pages/FloorLeaderTrackerPage.tsx`
- Add a "Shift Handoff" button near the top controls to trigger the `ShiftHandoffModal`.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure strict typings (No `any` types).
- Run `npm run test` to verify zero regressions.

### Multi-Agent Subroutines
- The `expert_coder` will implement the features sequentially.
- The `qa_tester` will verify data-testids, rate limits, and null traps.
- The `tech_debt_analyst` will ensure strict state hydration (no duplicate offline states).
- The `ux_designer` will ensure all new UI components adhere to the premium cyberpunk aesthetic (`.glass-card`, `--bg-obsidian`).

> [!NOTE]
> All AI payloads will strictly adhere to Rule 15 (AI Data Batching) and will use the `getGeminiModel` service wrapper.

## User Review Required
Does this plan look good to proceed with?
