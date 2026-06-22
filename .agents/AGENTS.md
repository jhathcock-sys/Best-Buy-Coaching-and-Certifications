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
- **Actions Taken**: Extracted `Sidebar` from `App.jsx`, created `Navigation.css`.
- **Completed**: The main app layout is now modular.

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

## Refactoring & Component Extraction Safeguards
When extracting components, splitting large files, or refactoring state logic:
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
