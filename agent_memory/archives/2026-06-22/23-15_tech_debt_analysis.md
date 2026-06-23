# Technical Debt Analysis Report - Best Buy Coaching & Certifications
**Date:** June 22, 2026
**Analyst:** Principal Architect Subagent

## 1. State Management Compliance (Zustand over AppContext)
**Finding:** Major architectural violation detected and resolved.
The `src/context/AppContext.jsx` was being heavily imported across 13 major components (e.g., `StoreRoster`, `BreakroomTV`, `PlaybookStudio`, `RoleplayCenter`). While the context had been largely stripped down to just routing wrappers (`activeView`), it represented a persistent violation of the project rule: *"All application state must be pulled strictly via `useStore` slices... NEVER passed through a generic `AppContext`."*

**Resolution:**
- `AppContext.jsx` has been **completely deleted**.
- All dangling `import { useApp } from '../context/AppContext';` statements across the codebase were scrubbed.
- `App.tsx` and `RoleplayCenter.tsx` were refactored to utilize standard `react-router-dom` hooks (`useNavigate` and `useLocation`) exclusively, bypassing context overhead.

## 2. God Object Audits (`StoreRoster.tsx` & `PlaybookStudio.tsx`)
**Finding:** Containers are large but effectively using the Tab/Presenter pattern.
Both files were audited against the bloated God Object rule:
- `StoreRoster.tsx` is 425 lines but acts as an orchestrating presenter. It correctly offloads heavy rendering logic to `StoreRosterHeader`, `StoreRosterTable`, and `StoreRosterMobileCard`. 
- `PlaybookStudio.tsx` sits at 265 lines and correctly orchestrates specialized tabs (`AiEngineTab`, `SystemPromptsTab`, `SupervisorProfilesTab`, etc.). 

**Recommendation for Future Refactoring:** 
While `PlaybookStudio.tsx` handles tabs well, the manager array editing logic (`startEditingManager`, `handleAddManager`, etc.) and the complex diagnostics execution (`runDiagnostics`) are still in-lined. Pushing this state down directly into `SupervisorProfilesTab` and `SyncDiagnosticsTab` respectively would trim ~80 lines from the container.

## 3. Regression Checks on Recent Fixes
### Rents Due Schema
**Finding:** The "Rents Due" schema pipeline was fully validated.
- Parsing correctly sits in `src/services/ai/geminiDocumentParsers.ts`.
- Structured JSON output schemas securely demand properties (name, rph, revenue, etc.).
- Critical system prompt guardrails instruct the AI not to truncate arrays.
- Complies entirely with the `AGENTS.md` directive for model versioning: API calls correctly invoke the updated `gemini-3.5-pro` model instead of deprecated versions.

### `useFloorSetup` Removal
**Finding:** Clean removal verified.
- Deep searched the entire codebase for remaining `useFloorSetup` imports, destructured variables, or references. 
- Results came back entirely clean. Zero regression risks or scope issues identified from its deletion.

## Conclusion
The application architecture is significantly cleaner with the eradication of `AppContext`. The codebase strictly routes application data through Zustand slices (`useStore`) and standard router hooks.
