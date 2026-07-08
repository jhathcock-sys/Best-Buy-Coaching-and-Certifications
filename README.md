# Best Buy Coaching & Certifications

A high-performance, client-side Single Page Application (SPA) designed to empower Best Buy store leaders. This application manages employee coaching, tracks performance metrics, simulates AI roleplays, and drives floor leadership, all while maintaining a robust "Local-First" architecture for offline reliability.

## 🚀 Key Features

* **Store Roster & Performance Matrix:** Manage employees, track goals vs pace (Memberships, Apps, GSP, etc.), and process bulk metrics through intuitive CSV imports.
* **Coaching & Roleplay Simulators:** Leverage Google Generative AI to simulate customer interactions for advisors, or run leadership coaching simulations for managers.
* **Live Floor Shadowing:** Conduct real-time observations with asynchronous tracking of positive behaviors and areas for opportunity.
* **Floor Leader Tracker:** Build daily lineups, assign store zones via drag-and-drop, and seamlessly manage breaks.
* **Aura HUD & Dashboard:** High-level executive views aggregating store health, trophies, and recent activity into beautiful, glassmorphic interfaces.

## 🏗️ Architecture & Tech Stack

This application is built with modern, strictly typed React and a serverless backend.

* **Frontend:** React 19 + TypeScript (Vite)
* **State Management:** Zustand v5 + Zod (Strict schema validation)
* **Routing:** React Router DOM v7
* **Styling:** Premium CSS Utility Tokens (TailwindCSS v4 structure) & Framer Motion
* **Database & Cloud:** Firebase v12 (Firestore, Realtime DB, Hosting)
* **AI Engine:** Google Generative AI (Client-side integration)
* **Testing Suite:** Vitest (Unit) + Playwright (E2E)

### Local-First Data Flow
To ensure the app remains functional in zero-connectivity environments (e.g., store warehouses), all Zustand state changes are instantly serialized to `localStorage`. Upon reconnection, Firebase synchronizes the local cache with the cloud database. 

## 🛠️ Getting Started

### Prerequisites
* Node.js (v18+)
* NPM or Yarn
* Firebase CLI (`npm install -g firebase-tools`)

### Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:5173`.*

## 🧪 Testing

We enforce a zero-regression, 100% success rate Quality Gate via strict TypeScript and automated testing.

* **Run Typechecking:** `npm run typecheck`
* **Run Unit Tests (Vitest):** `npm run test`
* **Run E2E Tests (Playwright):** `npx playwright test`

## ☁️ Deployment

This project uses Firebase for Cloud Functions and Hosting. To build and deploy manually:

```bash
npm run build
npx firebase deploy
```

> [!NOTE]  
> All API keys (Firebase config and Google Generative AI) must be configured in your environment variables (`.env`) or securely injected via the Command Center settings.

## 🗺️ Project Map
For a deeper dive into component hierarchies, specialized hooks, and domain responsibilities, please review our [PROJECT_MAP.md](PROJECT_MAP.md).
