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

## Deployment & Version Control
After every significant upgrade, change, or feature completion, you must:
1. Commit the changes to version control using Git (`git add`, `git commit`).
2. Push the changes to the remote GitHub repository.
3. Deploy the updated application to the hosting environment (e.g., via `npm run build` and `firebase deploy`, or the appropriate deployment commands for this project).
4. Log these deployment actions in the daily memory log.
