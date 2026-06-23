# QA Health Check Report: Critical Production Risks

**Date:** June 23, 2026
**Analyst:** QA Team

Based on the latest comprehensive code analysis, the application contains significant production risks spanning security, state persistence, and data integrity. Below are the critical findings that will break the app or compromise data if deployed as-is.

## 1. High-Severity Security: Form Input Sanitization (XSS)
The application is currently vulnerable to Cross-Site Scripting (XSS) via unsanitized Markdown rendering. 
* **Location:** `src/pages/AdvisorDashboardPage.tsx` and `src/components/AssociateProfile/ProfileTrophiesTab.tsx`
* **Trigger:** The UI uses React's `dangerouslySetInnerHTML={{ __html: renderMarkdown(...) }}` and `<div dangerouslySetInnerHTML={{ __html: log.coachingPlanMd }}>` directly on AI-generated and user-submitted notes.
* **Impact:** `src/utils/profileUtils.tsx`'s `renderMarkdown` function does not sanitize input using DOMPurify (which isn't even installed). A malicious manager could inject `<script>` tags into a `coachingPlanMd` or custom AI persona note. When an Advisor views their dashboard, the script executes, potentially stealing their local storage tokens or manipulating their UI.

## 2. High-Severity Logic: Firebase Offline Persistence & Logout Cache Poisoning
The application fails to clear globally cached configurations when a Store Leader logs out. This directly corrupts multi-tenant login flows.
* **Location:** `src/store/slices/authSlice.ts` (`logout` function) and `src/components/SyncManager.tsx`
* **Trigger:** The `logout` function only nulls out `isAuthenticated`, `activeManager`, `activeAdvisor`, and `storeId`. It intentionally *fails* to clear `playbookSettings`, `rosterHistory`, or `managers`.
* **Impact:**
  1. A Store Leader for Store 1480 logs out.
  2. The `LoginGate` component uses `playbookSettings?.storePin` for authentication.
  3. Because `playbookSettings` is not cleared, the login gate still enforces Store 1480's custom PIN.
  4. Even worse, if the network drops and the next user attempts to log into Store 999, `SyncManager` will fail to fetch Store 999's data. The offline cache will surface Store 1480's `rosterHistory` and configuration, exposing employee performance data to the wrong tenant.

## 3. Moderate-Severity Null Traps: Global Roster State Reads
There are remaining component initialization traps where custom Zustand hooks could throw `ReferenceError`s.
* **Location:** `src/components/AdvisorLogin.tsx` and `src/pages/DashboardPage.tsx`
* **Trigger:** `const _rawroster = useStore(state => state.rosterHistory[activePeriod] || {});` 
* **Impact:** If `state.rosterHistory` evaluates to `null` or `undefined` prior to the initial slice hydration, reading `[activePeriod]` throws a fatal `Cannot read properties of undefined` crash, blank-screening the Advisor Login form. The destructuring must safeguard against the parent object before accessing dynamic keys (`state.rosterHistory?.[activePeriod]`).

## Recommended Immediate Actions
1. **Sanitize Markdown:** Run `npm install dompurify @types/dompurify`. Wrap all `dangerouslySetInnerHTML` objects with `DOMPurify.sanitize(html)`.
2. **Hard-Clear Zustand:** Update the `logout()` method in `authSlice.ts` to fully reset `rosterHistory`, `playbookSettings`, `managers`, and `coachingLogs` to empty objects/arrays to prevent cross-store cache bleeding.
3. **Guard Dynamic State:** Inject optional chaining `?.` to all array/object lookups referencing dynamic keys from Zustand (like `activePeriod` indexing) during early-mount rendering.
