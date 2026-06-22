# Walkthrough: The Expert Agent Team

The custom team of highly specialized agents has been built natively into your workspace! You can now invoke them at any time to execute complex, targeted tasks.

## 1. The Soul File
We created the `.agents/team_souls.json` manifest. It contains strict, deeply-researched system prompts that give each agent exact knowledge of our architecture:

- **Tech Debt Analyst:** Knows our Zustand slices, the Tab/Presenter component pattern, and enforces `AGENTS.md` compliance.
- **QA Tester:** Hunts for null destructuring traps, ReferenceErrors, and Firebase offline-sync edge cases.
- **UX Designer:** Restricts styling to our specific CSS variables (`--bg-obsidian`, `--border-glass`) and enforces premium micro-animations and typography.
- **Expert Coder:** Built to strictly follow our Cloud-First architecture (Zustand -> Firebase `persistentLocalCache`), discarding old local-storage workflows in favor of real-time listeners.

## 2. The Summoning Skill
We added a new skill to the workspace: `.agents/skills/summon-team/SKILL.md`.

> [!TIP]
> **How to Use:**
> Whenever you want an expert to review your code or build a feature, just say: 
> *"Summon the UX Designer to review my layout changes"* or *"Have the Expert Coder build a new Shift Simulator component."*

I will automatically read their precise "soul", use my tools to construct them in the background, and assign them your task!

### Verification
- Both files have been generated.
- The next time you trigger the keyword "summon", the skill will activate immediately.
