# REPO MAP // Best-Buy-Coaching-and-Certifications
> **Role:** Store #1480 Leadership Coaching, Certification Matrix & Skill Ladders
> **Stack:** React 19 + TypeScript + Zustand + TailwindCSS + Firebase Firestore

### Core Entrypoints
- `src/main.tsx`: React root & DOM initialization
- `src/App.tsx`: Application shell & primary navigation
- `src/index.css`: 2026 OKLCH color space, tabular numbers & 150ms motion
- `src/firebase.ts`: Firebase Firestore connection

### State Slices (`src/store/slices/`)
- `authSlice.ts`, `metricsSlice.ts`, `shiftSlice.ts`, `playbookSlice.ts`, `uiSlice.ts`

### Pages & Routes (`src/pages/`)
- `DashboardPage.tsx`: Bento grid KPI telemetry
- `FloorLeaderTrackerPage.tsx`: Floor coaching and hourly pacing
- `StoreRosterPage.tsx`: Employee skills, certifications & history
- `AdvisorDashboardPage.tsx`: Individual scorecard
- `DailyLineupBuilderPage.tsx`: Daily zoning and lineup
- `PlaybookStudioPage.tsx`: 70-20-10 coaching playbooks
- `CoachSimulatorPage.tsx`: Interactive coaching roleplay simulations

### Key Services (`src/services/`)
- `ai.ts`: AI feedback & scenario simulation
- `firebase.ts`: Firestore persistence & roster data

### Verification Commands
- Lint: `npx oxlint src` (0 errors)
- Test: `npm run test` (Vitest 82 files, 237 tests)
- Build: `npm run build` (Vite build <500ms)
