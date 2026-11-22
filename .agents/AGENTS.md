# Best-Buy-Coaching-and-Certifications — Repo Rules

Project-specific engineering guardrails for Store #1480 Leadership Coaching & Certifications (supplementing global rules and `REPO_MAP.md`).

> **Public Repository Firewall:** Keep commits free of internal hostnames, private LAN IPs, local workstation paths, and unrelated operational secrets.

## 1. State, Hydration & Store Sync
- **Single Zustand Store (`useStore`):** Pull application state strictly through `useStore` slices (`authSlice`, `metricsSlice`, `shiftSlice`, `playbookSlice`, `uiSlice`); never introduce parallel Contexts or competing manual `localStorage` sync managers alongside Firestore `persistentLocalCache`.
- **Selector Atomicity:** Never allocate new object or array literals (`|| {}`, `|| []`) inside `useStore` / `useShallow` selectors; default outside the selector or use shared empty sentinels (`EMPTY_ARR` / `EMPTY_OBJ`).
- **Pre-Auth & Hydration Guards:** Fetch custom PINs, store IDs, and tenant config prior to or outside the auth gate. Guard components against unhydrated store fields and disable async submissions (`disabled={isHydrating}`) until tenant data finishes loading.
- **Shallow Prop Drilling:** Limit extracted child components to 5–7 props; pull deeper shared state directly from `useStore`.

## 2. Store #1480 Metric & Coaching Math
- **Sum Raw Counts, Never Average Percentages:** Aggregate store-wide performance (`5-Star Surveys`, `PMs`, `Apps`, `Memberships`, `GSP`/`warranty` attach rates) by summing raw numerators and denominators across the roster before dividing — never average per-associate percentages.

## 3. UI Tokens, Styling & Mobile Ergonomics
- **Theme Tokens (`src/index.css`):** Use established CSS custom properties (`--bg-space`, `--bg-obsidian`, `--border-glass`, `--success-glow`, `--bby-yellow`, `--bby-blue`, `--transition-normal`) rather than sprawling `style={{...}}` blocks.
- **iOS / Tablet Touch Binding:** Include `cursor: pointer` on clickable interactive elements for reliable iOS Safari and tablet touch recognition.
- **Incremental Cleanup:** Refactor legacy inline styles to `src/index.css` utility classes opportunistically when editing a file.

## 4. Server-Side AI Exclusivity (`functions/src/ai.js`)
- **No Client-Side `@google/generative-ai`:** All Gemini AI calls must stay strictly server-side; never import `@google/generative-ai` in `src/`. Route all frontend AI requests exclusively via `callFirebaseAI` (`src/services/ai/core.ts`).
- **Single-Call Batching:** Never run `Promise.all()` or loop over rosters with individual AI requests; batch multi-employee prompts into one structured JSON request.
- **Strict `getSchemaForType` Registration:** Register every structured `schemaType` (or explicitly return `null` for intentional schema-less JSON prompts) inside `getSchemaForType` in `functions/src/ai.js`.
- **Structured `generationConfig`:** Merge runtime `temperature`, `topK`, `topP`, and `systemInstruction` into `generationConfig` cleanly rather than concatenating them into prompt text, and use current maintained Gemini aliases.

## 5. Verification Gate
- Keep Vitest mocks synchronized with `callFirebaseAI` payload contracts and test multi-persona and negative auth paths in E2E coverage.
- Run before commit/land:
  ```bash
  npm run typecheck && npx oxlint src && npm run test && npm run build
  ```
