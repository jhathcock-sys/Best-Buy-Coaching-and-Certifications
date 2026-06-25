# Agent Memory Rules

These rules apply to all AI agents working in this workspace.

## Memory Logging
You must maintain a "single source of truth" memory log of all actions taken and completed tasks.
1. All logs are stored in the `agent_memory/` directory at the root of the project.
2. The logs are split into daily markdown files, named `YYYY-MM-DD.md` (e.g., `2026-06-22.md`).
3. Whenever you complete a significant task, implement a feature, fix a bug, or have a significant technical discussion, you must append an entry to the current day's log file.
4. If the daily file does not exist, create it.
5. Format your entries with a timestamp, the task or conversation ID, and a brief description of the actions taken and items completed.

Example entry:
### [14:30:00] Refactored Navigation Component
- **Actions Taken**: Extracted `Sidebar` from `App.jsx`, applied premium glassmorphism tokens.
- **Debate/Consensus**: `ux_designer` vetoed original layout due to padding asymmetry; resolved by wrapping metrics in a custom `--border-glass` grid.
- **Completed**: The main app layout is now modular and meets aesthetic guidelines.

Ensure you update the memory log before ending your turn on major tasks.

## Artifact Archiving
To maintain a permanent history of our technical planning and analysis, all agents must archive their final planning artifacts into the project repository before ending their turn on major tasks.
1. Create a directory for the current day if it doesn't exist: `agent_memory/archives/YYYY-MM-DD/`.
2. Copy your final artifacts (e.g., `implementation_plan.md`, `task.md`, `walkthrough.md`, `tech_debt_analysis.md`, `health_check.md`) into this directory.
3. Rename the copied files to include a descriptive prefix or timestamp (e.g., `agent_memory/archives/2026-06-22/14-30_tech_debt_analysis.md` or `feature_x_implementation_plan.md`).
4. Commit and push these archives along with your other code changes.

## Deployment & Version Control
After every significant upgrade, change, or feature completion, you must:
1. Commit the changes to version control using Git (`git add`, `git commit`).
2. Push the changes to the remote GitHub repository.
3. Deploy the updated application to the hosting environment (e.g., via `npm run build` and `firebase deploy`, or the appropriate deployment commands for this project).
4. Log these deployment actions in the daily memory log.

## Multi-Agent Debate, Collaboration & Consensus Gates
1. **Cross-Agent Communication Mandate**: When working as part of a summoned team, agents MUST actively communicate with one another using the `send_message` tool. You are not working in a silo. Share your findings, ask the Architect for approval on structural changes, and request the QA Tester to review your logic *before* finalizing it.
2. **Honor the Veto**: If another sub-agent has issued an explicit `VETO` on a proposed change or architecture in the current thread, you are FORBIDDEN from executing any write or edit tools on that file until you have explicitly addressed their critique and proposed a compromise.
3. **Contextual Awareness**: Before executing a tool, read the last 3-4 agent turns to see if your peer (e.g., the BI Analyst on math, or the QA Tester on null-safety) has raised a blocker.
4. **Mandatory Peer Review**: An Expert Coder may not declare a major feature refactor complete until the Lead QA Engineer has actively reviewed the code and confirmed there are no null traps or async race conditions.
5. **Consensus Logging**: When writing code after a debate, include a brief 1-line comment above the refactored block noting the compromise (e.g., `// Consolidated per QA Veto on sync lifecycle`).

## Refactoring & Component Extraction Safeguards
1. **Verify Hook Signatures**: Always double-check the interface of custom hooks (e.g., `useApp()` vs `useStore()`) before destructing variables from them. Do not assume all global variables reside in the same hook.
2. **Variable Scope & References**: Identify all variables, functions, and state referenced in the extracted block. Ensure every single one is explicitly passed as a prop, re-imported, or redefined in the new component to prevent `ReferenceError`s.
3. **Props Verification**: Double-check that the parent component actually passes every prop that the new child component expects. Watch out for prop name mismatches.
4. **Import Completeness**: Verify all required hooks, types, utilities, and external components are imported into the newly created file.
5. **Initialization & Fallback Logic**: Preserve initial state logic, especially local storage or cached fallbacks. Do not silently drop caching logic or overwrite it with hardcoded defaults.
6. **Null Safety**: When moving state or props, ensure you maintain optional chaining (`?.`) and fallback values to prevent null destructuring crashes.

## Architectural & Implementation Guidelines
1. **Authentication Data Hydration**: Any data required for authentication, initialization, or tenant configuration (e.g., custom PINs, store IDs) must be fetched *outside* or *prior* to the authentication gate. Never place cloud sync logic for login credentials inside components that require the user to already be authenticated.
2. **Component Modularity (Anti-God Object)**: Prevent top-level files from becoming bloated God Objects. When adding significant new features, create discrete, modular child components rather than appending hundreds of lines of state and UI to an existing view.
3. **Decoupled Routing & Callbacks**: Decouple form submissions and authentication from hardcoded routing redirects. Use explicit callbacks (e.g., `onLoginSuccess`) to ensure state is synchronized and finalized *before* triggering navigation changes.
4. **Storage Hierarchy**: Prioritize Environment Variables (`.env`) for critical configuration and API keys. When hydrating state from `localStorage` on startup, implement explicit checks to ensure stale local data does not silently override `.env` values or required application defaults.
5. **Mobile/Tablet Touch Event Recognition**: Always include `cursor: 'pointer'` in the CSS styles or class list for `<button>` elements or clickable `<div>`s that use an `onClick` handler. This ensures that iOS Safari and other tablet browsers correctly recognize and bind touch events to the element.
6. **Gemini API Versioning**: Never hardcode deprecated AI models (like `gemini-1.5-pro`). Always use the most up-to-date stable model identifiers (e.g. `gemini-3.5-pro` or `gemini-3.5-flash`) across backend functions and frontend services to prevent 400 Invalid Model API rejections.
7. **Premium Design Tokens vs. Raw Tailwind/Inline Styles**: Avoid sprawling `style={{...}}` blocks. Furthermore, do not use generic Tailwind color utilities when custom tokens exist. All agents must strictly utilize the CSS theme variables defined in `src/index.css` via utility classes or arbitrary values matching:
   - Backgrounds: `--bg-space`, `--bg-obsidian`, `--border-glass`
   - Accents/States: `--success-glow`, `--bby-yellow`, `--bby-blue`
   - Typography & Motion: Font families `Outfit` (headings) / `Inter` (body), and `--transition-normal`.
   Incrementally refactor legacy inline styles to use these tokens whenever a file is opened.
8. **Aggregated Metric Calculations**: Be highly cautious of how raw counts (like 5-Star Surveys, Applications, or Memberships) are aggregated. Do not inadvertently calculate an *average* of a count metric across the roster when evaluating total store-wide performance; you must sum the counts instead to get an accurate total.
9. **PowerShell Compatibility**: The user's terminal environment uses Windows PowerShell. Use semicolons (`;`) instead of double ampersands (`&&`) when chaining terminal commands (e.g., `npm run build ; git add .`).
10. **The Boy Scout Rule (CSS Utilities)**: Do not perform global, app-wide eradications of inline `style={{...}}` blocks, as this introduces high risk of visual regressions. Instead, whenever you open a component to add a feature or fix a bug, incrementally refactor its inline styles to use `index.css` utility classes (e.g. `className="flex-center p-md"`). Leave the file cleaner than you found it.
11. **Zustand Selector Atomicity**: Never create new object or array references inside Zustand selectors (e.g., `useStore(useShallow(state => state.data || {}))`). This instantly destroys React's `useShallow` equality checks and causes infinite re-render loops. Default fallbacks must be handled *outside* the selector or at the component level.
12. **Single Source of Offline Sync**: If the project uses Firebase's native `persistentLocalCache`, you must never build competing, manual `localStorage` sync managers. You cannot have two different offline engines trying to hydrate the same state simultaneously.
13. **Strict Prop-Drilling Limits**: If an extracted child component requires more than 5-7 props to function, you must implement a scoped React `<Context.Provider>` or pull the data directly from the Zustand store instead of prop-drilling.
14. **Asynchronous Race Condition Prevention**: Never attach synchronous form submission handlers to states that are actively waiting on a background network fetch. Forms must be explicitly disabled (`disabled={isHydrating}`) or fully `await` the required tenant data before evaluating.
15. **AI Data Batching (Rate Limiting)**: The Gemini Free Tier has a strict limit of 15 Requests Per Minute (RPM). You are FORBIDDEN from using `Promise.all()` loops, `for` loops, or chunked delays to process rosters or large arrays through the AI. If you need to process multiple items (like a full staff roster), you MUST package the entire array into a single JSON prompt and request the AI to return an array of results in exactly **1 API call**.
16. **Type-Safe Destructuring**: Never forcefully cast states to `any` just to silence TypeScript when extracting nested keys (e.g., `(apiKey as any)?.gemini`). If the data shape is unknown, use `typeof` checks or Zod Schema validation before attempting to read nested properties to prevent silent `undefined` crashes.
17. **Multi-Persona Testing Mandate**: When writing E2E tests for authentication or role-based features, you must write test cases for at least two distinct personas (e.g., Guest Admin and a standard active Manager) to ensure authentication fallback arrays and loops process all users correctly, not just the backdoor override.
18. **Component Hydration Guards**: No component should assume that Zustand data like `managers` or `playbookSettings` is instantaneously available on first render. Always implement empty state checks (e.g., `if (!data) return <Skeleton />`) or use strictly typed default empty variables (`EMPTY_ARR`) before attempting to render nested UI.
19. **Test-Driven Mock Fidelity**: Whenever replacing a service layer (e.g., migrating from Google SDK to Firebase Cloud Functions), you MUST immediately update the corresponding `vitest` mocks to reflect the actual payload signature of the new service.
20. **Negative E2E Testing**: E2E tests must explicitly attempt to break the application (e.g., invalid passwords, navigating to protected routes while unauthenticated). Testing the "Happy Path" is no longer acceptable on its own.
21. **Root Cause Rigor (Deep Debugging)**: When investigating bugs, crashes, or user-reported issues, DO NOT settle for surface-level assumptions or "easy answers" (e.g., assuming a fallback message implies a rate limit without checking the stack trace). You MUST dig all the way into the network layer, console logs, environment variables, and backend function states to find the true technical culprit before proposing a fix.
22. **Subagent Delegation Mandate**: The primary agent must act as an orchestrator when dealing with specialized domains (e.g., AI integration, CSS design, testing, architectural deep dives). You must actively summon and delegate tasks to the appropriate specialized subagent (e.g., `ai_specialist`, `qa_tester`, `ux_designer`) rather than doing the specialized work yourself. This ensures domain-specific expertise and rigorous peer review are applied to every problem.
