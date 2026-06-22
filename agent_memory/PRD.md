# Product Requirements Document (PRD)
**Project Name:** Best Buy Coaching and Certifications App
**Target Audience:** Best Buy Store Leaders, Floor Managers, and Coaches
**Platform:** Web (Responsive Desktop & Mobile), Local-First SPA

## 1. Executive Summary
This application is designed to be the ultimate operating system for a Best Buy store leader. It bridges the gap between raw data reporting, floor leadership execution, and associate coaching. Instead of relying on multiple disparate portals, leaders use this unified tool to track associate performance, observe behaviors on the sales floor, and utilize Google's Generative AI to simulate coaching conversations, build perfect GROW logs, and evaluate store health metrics.

## 2. Key Objectives
* **Consolidate Operations:** Bring scheduling, shift tracking, and roster management into one dashboard.
* **AI-Powered Coaching:** Provide leaders with AI simulations to practice difficult conversations and an AI builder to automatically draft formal coaching documentation from shorthand notes.
* **Real-time Observability:** Enable mobile-friendly "Live Floor Shadowing" to log behaviors as they happen.
* **Offline Resilience:** Ensure the app functions seamlessly in areas with poor Wi-Fi (e.g., store warehouse) using a Local-First architecture that syncs to the cloud when online.

## 3. Core Features & Requirements

### 3.1. Dashboard & Core Navigation
* **Overview Hub:** At-a-glance view of daily goals, hourly revenue tracking, active shifts, and coaching history.
* **Routing Structure:** Intuitive side navigation on desktop, shifting to a bottom tab bar on mobile devices.

### 3.2. Store Roster & Associate Management
* **Data Ingestion:** Ability to bulk import CSV files of store rosters, using fuzzy matching to align data columns.
* **Performance Tracking:** Matrix tracking pacing goals (hours worked vs. sales dollars) separated by departments (e.g., Front End vs. General Sales).
* **Associate Profiles:** Deep-dive views into individual historical metrics and past coaching interactions.

### 3.3. Floor Leadership Tools
* **Shift Management (FloorLeaderTracker):** Tools to manage the flow of the store during a shift, including break schedules and zone coverage.
* **Live Floor Shadowing:** Real-time behavioral tracker for leaders actively walking the sales floor.
* **Auditing:** Visual and text-based auditing tools (Floor Audit, 5-Star Auditor) to validate store standards.

### 3.4. Coaching & AI Integration (The "Playbook")
* **Roleplay Center:** A sandbox where AI acts as a customer so advisors can practice their sales pitch.
* **Coach Simulator:** A sandbox where AI acts as an employee, allowing managers to practice delivering constructive feedback.
* **GROW Log Builder:** An AI text-generation tool that turns brief, informal manager notes into formal, structured GROW coaching logs.
* **DISC Framework Integration:** Coaching templates aligned with Best Buy's official sales models and behavioral types.

## 4. Technical Requirements
* **Architecture:** React 19 (Vite) Single Page Application.
* **State Management:** Zustand (for centralized state) combined with Zod (for strict schema validation).
* **Storage & Sync:** 
  * Primary read/write to `localStorage` for instant load times (Zero latency).
  * Asynchronous background sync via Firebase Firestore for multi-device/multi-manager collaboration.
* **AI Execution:** Client-side execution utilizing the Google Generative AI SDK (API keys stored locally). No backend proxy servers are required for LLM processing.
* **Styling:** TailwindCSS v4 with a premium, dark-mode focused aesthetic featuring glowing KPIs and dynamic color badging.

## 5. Security & Access
* **Authentication:** Pin-based gatekeeping for supervisor/manager access.
* **Data Privacy:** API keys and sensitive PII are managed via secure local storage and restricted Firebase rules.
