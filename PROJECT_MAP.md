# Best Buy Coaching and Certifications - Architectural Map

This document provides a holistic, high-level map of the entire Best Buy Coaching and Certifications application, detailing its underlying tech stack, routing structure, component architecture, and data flow pipelines.

## 1. App Core (Tech Stack)

The application is built as a highly responsive, client-side Single Page Application (SPA) utilizing modern React tooling and a serverless backend.

* **Frontend Framework**: React 19 (managed via Vite)
* **Styling Engine**: TailwindCSS v4 with Lucide React for iconography
* **State Management**: Zustand v5 (acting as the centralized source of truth)
* **Routing**: React Router DOM v7
* **Database & Cloud Sync**: Firebase v12 (Firestore/Realtime Database)
* **AI Engine**: Google Generative AI SDK (direct client-side API integration)
* **Data Validation**: Zod (strict schema parsing for imports and state integrity)
* **Notifications**: React Hot Toast

## 2. Page & Route Registry

The application uses standard URL routing to manage distinct views. All routes are wrapped by the `AppContent` layout which provides sidebar and bottom navigation depending on the viewport.

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `Dashboard` | The central hub displaying high-level metrics, active shifts, and recent coaching activity. |
| `/roster` | `StoreRoster` | Employee management grid, metric tracking, CSV imports, and performance wizard. |
| `/shadow` | `LiveFloorShadow` | Live observation tracking and real-time behavioral logging on the sales floor. |
| `/floorLeader` | `FloorLeaderTracker` | Comprehensive shift management, OCV forms, zone assignments, and break scheduling. |
| `/roleplay` | `RoleplayCenter` | Interactive AI customer roleplay sandbox for advisors to practice pitching. |
| `/coach` | `CoachSimulator` | Interactive AI employee simulation for managers to practice delivering difficult coaching. |
| `/builder` | `CoachSimulator` (Builder Tab) | Generative tool for drafting perfectly structured GROW coaching logs from shorthand notes. |
| `/history` | `CoachingHistory` | The archive/database of all finalized coaching interactions and logs. |
| `/playbook` | `PlaybookStudio` | Admin settings, custom scenario definitions, AI model selection, and goal adjustments. |

## 3. Component Architecture

The `src/components/` directory is organized into main views, contextual modals, specific operational tools, and micro-components.

### Main Page Components
* `Dashboard.jsx`, `StoreRoster.jsx`, `LiveFloorShadow.jsx`, `FloorLeaderTracker.jsx`, `RoleplayCenter.jsx`, `CoachSimulator.jsx`, `PlaybookStudio.jsx`, `CoachingHistory.jsx`

### Advanced Modals & Forms
* `AddEmployeeModal.jsx`: Manual entry form for new roster additions.
* `AssociateProfileModal.jsx`: Deep-dive view into a specific employee's metrics and historical coaching.
* `PerformanceWizardModal.jsx`: Step-by-step wizard to document performance gaps.
* `ImportScheduleModal.jsx`: Advanced modal handling AI OCR parsing of schedule images.
* `RosterImporterModal.jsx`: Modal handling CSV parsing, fuzzy header mapping, and bulk data importing.

### Specialized Operational Tools
* `ZoneScheduler.jsx`: Drag-and-drop or grid-based floor zone assignments.
* `BreakRunSheet.jsx`: Automated or manual management of associate break times.
* `FloorAudit.jsx` & `FiveStarAuditor.jsx` & `RentsDueAuditor.jsx`: Specialized AI vision and text auditor tools.
* `ShiftSimulator.jsx`: Sandbox for simulating revenue and app generation over time.

### Utility & Layout Components
* `ErrorBoundary.jsx`: High-level wrapper that catches render failures and intelligently resets corrupted local storage.
* `MetricSparkline.jsx`: Reusable SVG micro-chart for displaying performance trends.
* `Login.jsx`: Pin-based authentication gate.

## 4. Data Flows

The application employs a robust "Local-First" data architecture, ensuring the app remains fully functional even in zero-connectivity environments (like the back of a warehouse).

### 1. Centralized State (Zustand + Zod)
All application state (`activePeriod`, `rosterHistory`, `coachingLogs`, etc.) lives inside `src/store/useStore.js`. When data enters the store (e.g., via CSV import), it is strictly validated against schemas defined in `src/schemas/index.js` (Zod) to prevent corruption.

### 2. Local Storage Cache (First-Paint & Offline Reliability)
Every time Zustand updates, it simultaneously writes a serialized backup to `localStorage` (e.g., `bby_roster_history`). Upon app load, `App.jsx` uses `safeJsonParse` to immediately pull this data into view, guaranteeing a sub-second load time and offline resilience.

### 3. Firebase Cloud Sync (The Backend)
`src/services/firebase.js` handles the persistent backend.
* **Write**: When Zustand alters state locally, it triggers an asynchronous "fire-and-forget" push to Firebase.
* **Read**: The app subscribes to real-time Firebase listeners on startup. If the cloud data is newer than the local cache, Zustand merges the cloud data, keeping all devices in sync.

### 4. AI Request Pipeline (Google Generative AI)
`src/services/ai.js` handles all LLM interactions.
* **No Server Proxy**: There is no Node.js/Redis proxy server. The application is entirely client-side.
* **Direct Execution**: When an AI task is triggered, the browser makes a direct HTTPS request to Google's API (`generativelanguage.googleapis.com`) using the API key stored locally by the user.
* **Fallback Routing**: If no API key is detected, or the user is offline, the routing logic seamlessly falls back to pre-defined branching dialogue trees (the offline sandbox).
