# Technical Debt Analysis: Best Buy Coaching and Certifications

**Date**: 2026-06-23
**Analyst**: Principal Architect

This is a blunt, no-BS review of the current architectural health of the application, focusing on direct violations of the project's strict `.agents/AGENTS.md` guidelines.

## 1. God Objects and Component Bloat
- **`StoreRosterPage.tsx` (362 lines)**: This file acts as a massive orchestration component handling UI presentation, layout logic, and deeply nested modal/form states. It has been partially broken down into tabs but continues to suffer from high complexity and inline style bloat.
- **`PlaybookStudioPage.tsx` (177 lines)**: While broken out into sub-tabs (like `AiEngineTab` and `SystemPromptsTab`), the main presenter still manages far too many local states for `aiMode`, `firebaseConfig`, `localApiKey`, etc., making it a God Object for settings.

**Fix Action**: `StoreRosterPage.tsx` will be strictly refactored to a clean Tab/Presenter pattern. View logic will be fully delegated to child components, and excessive inline styling must be converted to CSS theme variables.

## 2. State Encapsulation Violations (The `AppContext` Rule)
- **Violation in `StoreRosterContext.tsx`**: A custom `StoreRosterProvider` was implemented to funnel states like `filteredRoster`, `deptGoals`, and `rosterHistory` down to `StoreRosterTable` and `StoreRosterMobileCard`.
- **Why this breaks the rules**: The `AGENTS.md` strictly dictates: *"all application state must be pulled strictly via `useStore` slices... and NEVER passed through a generic `AppContext`."* By wrapping the roster module in its own generic Context, the developer reinvented a local state container instead of relying on the existing Zustand implementation and standard React prop drilling.

**Fix Action**: I am completely deleting `StoreRosterContext.tsx` and refactoring `StoreRosterTable` and `StoreRosterMobileCard` to receive local view states as props and fetch global state directly from `useStore`.

## 3. Zustand Selector Risks
- While checking for `useShallow` violations, I observed that components frequently execute fallback logic outside the selector: `const rosterHistory = useStore(state => state.rosterHistory) || {};`.
- **Architectural Health**: This pattern is currently acceptable because it doesn't break React's object equality checks *during* the Zustand subscription phase. However, `DashboardPage` uses `useShallow` to extract 8 properties. This is clean, but any inline array/object creation inside that selector block would instantly trigger infinite re-render loops. Strict vigilance is required.

## 4. UI/UX "Boy Scout Rule" Violations
- **Inline Styling**: Files like `StoreRosterPage.tsx` are littered with raw inline styles: `style={{ fontSize: '2.25rem', marginBottom: '0.25rem', ... }}` instead of utilizing the mandated premium design tokens (e.g., `--bg-space`, `--text-secondary`, utility classes). 

**Fix Action**: As part of touching `StoreRosterPage.tsx`, I will aggressively migrate inline styles to CSS classes per the Boy Scout Rule.

## Proposed New Architectural Functionality
1. **Strict Context Ban enforcement**: Add linting rules to prevent `createContext` entirely, forcing all shared state through Zustand slices or explicit prop drilling.
2. **Offline-First Firebase Hook**: The current implementation has fragmented references to `dbConnected` and `firebaseConfig`. We need a unified `useSyncEngine()` custom hook that wraps Firebase operations, ensuring that state hydration occurs prior to `LoginGate` rendering.

---
**Next Steps**: I am immediately refactoring `StoreRosterPage.tsx`, `StoreRosterTable.tsx`, and `StoreRosterMobileCard.tsx` to eliminate the illegal `StoreRosterContext`.
