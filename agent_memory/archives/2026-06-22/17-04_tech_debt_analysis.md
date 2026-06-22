# System Health Check & Technical Debt Analysis (Round 2)

Following the successful execution of our initial tech debt remediation (extracting Zustand from Context and removing TypeScript overrides), I have conducted another deep scan of the codebase. 

While the application is highly functional, several architectural patterns are limiting its scalability and user experience. Below are the core issues identified and a proposed remediation plan.

## 🚨 Critical Technical Debt Identified

### 1. The Routing Architecture is Hardcoded (The "Single URL" Problem)
**The Issue:** Despite having `react-router-dom` installed, `App.tsx` manually orchestrates navigation using local React state (`activeView === 'dashboard'`, `activeView === 'roster'`, etc.). 
**The Impact:** 
- The browser's back and forward buttons do not work.
- You cannot bookmark or share a direct link to a specific page (e.g., sending a manager a link to the `dailyLineup` view).
- `App.tsx` is forced to import and conditionally render every single top-level module in the system.

### 2. TypeScript Compilation Errors (200+ Warnings)
**The Issue:** We successfully removed all `// @ts-nocheck` directives, which allowed the app to build via Vite (since esbuild strips types). However, running a strict `npm run typecheck` reveals roughly 200 latent type mismatches and missing interfaces.
**The Impact:** 
- Developers will see a sea of red squiggles in their IDEs.
- `any` types are masking potential runtime bugs where component props or state objects don't match their expected shapes (e.g., `DeptGoal` lacking optional properties, or `Employee` missing a `basket` metric).

### 3. Silent Failures in Cloud Operations
**The Issue:** Inside `firebase.ts`, almost all database operations wrap their logic in `try/catch` blocks that simply execute `console.error` and `return false` upon failure.
**The Impact:** When a network drop or permission error occurs, the UI does not consistently notify the user. The app silently fails to save data, which can lead to distrust if a manager thinks their lineup or coaching log was saved but it wasn't.

### 4. Custom Hook Refactoring for Heavy Components
**The Issue:** `ZoneScheduler.tsx` (17KB) and `ShiftTrackerHourlyLog.tsx` (18KB) contain dense matrices of business logic mixed with heavy JSX rendering. 
**The Impact:** They are difficult to test and prone to regression. We should separate their "thinking" from their "rendering."

---

## 🛠️ Proposed Remediation Plan

I propose we tackle these issues in the following order. 

> [!WARNING]
> Phase 1 (Routing) will touch almost every navigational component. I will ensure we don't break existing `onNavigate` flows by gradually shifting them to `<Link>` components or `useNavigate`.

### Phase 1: Implement React Router
- Wrap the app in `<BrowserRouter>`
- Replace the `activeView` state in `App.tsx` with proper `<Routes>` and `<Route>` mappings (e.g., `/dashboard`, `/roster`, `/playbook`).
- Update the `Sidebar` and internal `onNavigate` props to use the `useNavigate()` hook.

### Phase 2: Fix TypeScript Errors (The "Squiggle" Cleanup)
- Add missing properties to our global interfaces (`DeptGoal`, `ShiftEvent`, `PlaybookSettings`).
- Strongly type all functional component props (e.g., replacing `({ isOpen, onClose }: any)` with `({ isOpen, onClose }: ModalProps)`).
- Ensure `npm run typecheck` returns 0 errors.

### Phase 3: Centralized Error Notification
- Refactor `firebase.ts` to throw errors instead of swallowing them, or integrate `react-hot-toast` directly into the data layer to alert the user when a save operation fails or succeeds.

### Phase 4: Hook Extraction
- Extract the complex grid and assignment logic out of `ZoneScheduler.tsx` into a `useZoneScheduler.ts` hook.
- Do the same for `ShiftTrackerHourlyLog.tsx` (`useHourlyLog.ts`).

---

## Open Questions

> [!IMPORTANT]
> **Routing Question**: If we implement real URLs, what should the default route `/` be? Currently, if you are a manager, you go to the `Dashboard`. If you are an advisor, you go to the `AdvisorDashboard`. I plan to use a smart routing wrapper that checks your role and redirects you automatically. Does this sound good?

If you approve this plan, I will create the `task.md` checklist and begin executing Phase 1 immediately.
