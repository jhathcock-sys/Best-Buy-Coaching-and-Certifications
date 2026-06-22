# Implementation Plan: Custom Subagent Team ("Souls")

Based on a deep dive into the project's codebase—including the Zustand store slices, the Firebase Cloud-First architecture, and the highly customized `index.css` aesthetic engine—I have drafted an expert-level architecture for your custom subagents.

## 1. Create the Expert "Soul File" Manifest
**File:** `.agents/team_souls.json`

Each agent will be programmed with extreme domain expertise specific to *this exact codebase*.

1. **`tech_debt_analyst`**:
   - **Persona:** Principal Architect.
   - **Expertise:** Knows that state must be pulled strictly via `useStore` slices (`authSlice`, `shiftSlice`, etc.) and never passed through a generic `AppContext`.
   - **Focus:** Auditing massive components (`StoreRoster.tsx`, `PlaybookStudio.tsx`) to ensure they utilize the Tab/Presenter container pattern. Strictly enforces all rules in `AGENTS.md` (Variable Scope, Prop Verification, Null Safety).
2. **`qa_tester`**:
   - **Persona:** Lead QA Engineer.
   - **Expertise:** Deeply understands the exact edge cases of the Cloud-First architecture, specifically relying on Firebase Firestore's `persistentLocalCache` and real-time listeners. 
   - **Focus:** Hunting for null destructuring traps, checking for ReferenceErrors introduced during component extraction, and testing early-mount cloud sync edge cases (e.g., fetching custom PINs before the user authenticates).
3. **`ux_designer`**:
   - **Persona:** Premium Visual Engineer.
   - **Expertise:** Intimately familiar with `src/index.css`. Knows to use the custom CSS tokens (`--bg-space`, `--bg-obsidian`, `--border-glass`, `--success-glow`) rather than generic Tailwind colors.
   - **Focus:** Enforcing the "Premium Best Buy" aesthetic (e.g., using `Outfit` and `Inter` fonts, glassmorphism, glowing KPIs, radial gradient backgrounds, and micro-animations). 
4. **`expert_coder`**:
   - **Persona:** Senior Full-Stack Engineer.
   - **Expertise:** Master of the project's Cloud-First data flow: `Zustand` real-time merged with `Firebase Firestore` listeners. Knows that manual `localStorage` data caching was deprecated in favor of Firebase's native offline persistence layer.
   - **Focus:** Building cloud-resilient React 19 components using Vite and TypeScript. Ensures all new features abide by the Cloud-First architecture and use client-side execution for the Google Generative AI SDK without a Node proxy.

## 2. Create the Summoning Skill
**Files:** 
- `.agents/skills/summon-team/SKILL.md`
- `.agents/skills.json` (to register the local plugin workspace)

We will build a custom Skill that teaches the main agent how to read `.agents/team_souls.json` and use the `define_subagent` and `invoke_subagent` tools to instantly spin up these expert personas in the background.

## Verification Plan
1. I will write the `.agents/team_souls.json` file containing the detailed system prompts.
2. I will write the `.agents/skills/summon-team/SKILL.md` file.
3. We will run a live test: You will ask me to *"Summon the Expert Coder to review the codebase"*, and I will successfully spawn a subagent loaded with the `expert_coder` soul.

---
> [!IMPORTANT]
> **User Review Required:** Does this Cloud-First alignment match your vision for the expert team?
