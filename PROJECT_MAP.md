# Best Buy Coaching and Certifications - Architectural Map

This document provides a holistic, high-level map of the entire Best Buy Coaching and Certifications application, detailing its underlying tech stack, routing structure, component architecture, and data flow pipelines.

## 1. App Core (Tech Stack)

The application is built as a highly responsive, client-side Single Page Application (SPA) utilizing modern React tooling and a serverless backend.

* **Frontend Framework**: React 19 (managed via Vite) + TypeScript (`.tsx`)
* **Styling Engine**: Premium CSS Tokens (via `index.css`) + TailwindCSS v4 with Lucide React for iconography
* **State Management**: Zustand v5 (acting as the centralized source of truth with strict atomicity)
* **Routing**: React Router DOM v7
* **Database & Cloud Sync**: Firebase v12 (Firestore/Realtime Database/Hosting)
* **Backend API**: Firebase Cloud Functions (Node.js)
* **AI Engine**: Google Generative AI SDK (Strictly executed server-side via Firebase Functions RPC)
* **Data Validation**: Zod (strict schema parsing for imports and state integrity)
* **Testing Suite**: Vitest (Unit) + Playwright (E2E Tests)

## 2. Page & Route Registry

The application uses standard URL routing to manage distinct views. All routes are wrapped by the `AppContent` layout which provides sidebar and bottom navigation depending on the viewport.

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `DashboardPage` | The central hub displaying high-level metrics, active shifts, and recent coaching activity. |
| `/roster` | `StoreRosterPage` | Employee management grid, metric tracking, CSV imports, and performance wizard. |
| `/shadow` | `LiveFloorShadowPage` | Live observation tracking and real-time behavioral logging on the sales floor. |
| `/floorLeader` | `FloorLeaderTrackerPage` | Comprehensive shift management, OCV forms, zone assignments, and break scheduling. |
| `/roleplay` | `RoleplayCenterPage` | Interactive AI customer roleplay sandbox for advisors to practice pitching. |
| `/coach` | `CoachSimulatorPage` | Interactive AI employee simulation for managers to practice delivering difficult coaching. |
| `/history` | `CoachingHistoryPage` | The archive/database of all finalized coaching interactions and logs. |
| `/playbook` | `PlaybookStudioPage` | Admin settings, custom scenario definitions, AI model selection, and goal adjustments. |
| `/aura` | `AuraHUDPage` | Executive-level heads-up display aggregating store health. |
| `/command`| `CommandCenter` | System diagnostics and processing queues for background AI tasks. |

## 3. Component Architecture

The `src/components/` directory is heavily modularized to prevent God Objects, segmented into specific domains.

### Domain Specific Folders
* `src/components/Advisor/`: Components related to the Advisor Experience (e.g., `<DailyQuests />`, `<TrophyCase />`, `<AdvisorLeaderboard />`).
* `src/components/CommandCenter/`: System monitoring components (`<SystemStatusPanel />`, `<ProcessingQueue />`).
* `src/components/CoachingHistory/`: Historical viewing components (`<CoachingSessionCard />`).
* `src/components/PlaybookStudio/`: Administrative components and configurations.

### Advanced Modals & Forms
* `AssociateProfileModal.tsx`: Deep-dive view into a specific employee's metrics and historical coaching.
* `PerformanceWizardModal.tsx`: Step-by-step wizard to document performance gaps.
* `RosterImporterModal.tsx` & `RentsDueUploader.tsx`: Advanced modals handling CSV parsing and bulk data importing.

### Specialized Operational Tools
* `ZoneScheduler.tsx`: Drag-and-drop or grid-based floor zone assignments.
* `BreakRunSheet.tsx`: Automated or manual management of associate break times.
* `FloorAudit.tsx`: Specialized auditing tools.

### Utility & Layout Components
* `ErrorBoundary.tsx`: High-level wrapper that catches render failures and intelligently resets corrupted local storage.
* `Login.tsx` / `AdvisorLogin.tsx`: Pin-based authentication gates.

## 4. Data Flows

The application employs a robust "Local-First" data architecture, ensuring the app remains fully functional even in zero-connectivity environments (like the back of a warehouse).

### 1. Centralized State (Zustand)
All application state lives inside `src/store/useStore.ts`. Data is retrieved via strictly atomic selectors (e.g., `useStore(state => state.foo)`) to prevent infinite React rendering loops.

### 2. Local Storage Cache (First-Paint & Offline Reliability)
Every time Zustand updates, it simultaneously writes a serialized backup to `localStorage`. Upon app load, `App.tsx` uses a safe parse to immediately pull this data into view, guaranteeing a sub-second load time and offline resilience. Guards (`<Skeleton />`) are actively employed during hydration to prevent crashes.

### 3. Firebase Cloud Sync (The Backend)
`src/services/firebase.ts` handles the persistent backend.
* **Write**: When Zustand alters state locally, it triggers an asynchronous push to Firebase.
* **Read**: The app subscribes to real-time Firebase listeners.

### 4. AI Request Pipeline (Google Generative AI)
`src/services/ai/` handles all LLM interactions securely.
* **Server-Side Exclusivity**: Per Rule 26, the frontend *never* imports `@google/generative-ai` directly. All AI queries are packaged as JSON payloads and sent via Firebase `httpsCallable` endpoints.
* **Strict Schema Registration**: Expected structured outputs from the AI are securely registered in `functions/src/ai.js`. Unregistered schemas are immediately rejected at the backend gate.
* **Fallback Routing**: If the user is unauthenticated or offline, the system safely falls back to local offline simulators to maintain a seamless experience.
