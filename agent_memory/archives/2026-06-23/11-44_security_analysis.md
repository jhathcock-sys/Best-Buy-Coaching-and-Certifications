# Security & Authentication Analysis Report

## Executive Summary
This application's current security posture is fundamentally broken. It operates on a "client-side trust" model, meaning authentication is entirely spoofed via the frontend UI. There is zero actual server-side authentication, resulting in a critical failure state where **all database writes will fail in production**, while **all sensitive database reads are exposed to the public internet**.

---

## Critical Flaws Detected

### 1. Pseudo-Authentication (Client-Side Trust Model)
- **The Flaw**: The application fakes authentication. Users "log in" by entering a PIN, which the frontend matches against a locally stored array or a publicly queried Firestore document (`getUserByPin`). If matched, the frontend simply sets `sessionStorage.setItem('bby_authenticated', 'true')`. 
- **The Impact**: Any user can open the browser developer tools, type `sessionStorage.setItem('bby_authenticated', 'true')`, and instantly bypass the login screen to access the application. This is not authentication; this is a UI toggle.

### 2. Massive Offline Data Leakage
- **The Flaw**: `firestore.rules` contains `allow read: if true;` on virtually every collection (`/stores`, `/users`, `/coachingLogs`, `/periods`, etc.).
- **The Impact**: Anyone with the Firebase Project ID can query and download all employee PII, performance metrics, store goals, and coaching logs without a login. Your frontend "authentication" does nothing to protect the underlying database.

### 3. Non-Functional Database Writes (Broken RBAC)
- **The Flaw**: The Firestore rules explicitly demand `allow write: if request.auth != null && request.auth.token.role in ['gm', 'supervisor'];`. However, because the client application *never* implements the `firebase/auth` SDK, `request.auth` will **always be null**. 
- **The Impact**: In production, every single attempt to save a coaching log, update a roster, or alter metrics will fail with a "Missing or insufficient permissions" error. The application is completely locked in read-only mode because the backend expects an authentication token the frontend never generates.

### 4. Missing Custom Claims Infrastructure
- **The Flaw**: Even if `firebase/auth` were implemented, the `firestore.rules` expects a custom claim (`request.auth.token.role`). There are no Firebase Cloud Functions or Admin scripts written to actually inject these custom claims into user tokens upon account creation.
- **The Impact**: Even legitimate logins would be rejected for writes because the required RBAC roles do not exist in the token payload.

---

## Proposed Security Roadmap

To resolve these catastrophic flaws, the following functionality MUST be implemented:

1. **Rip Out Fake Authentication**
   Remove `sessionStorage.setItem('bby_authenticated', 'true')`. Import and implement real `firebase/auth` (e.g., Email/Password or SSO) for all GM and Supervisor accounts.

2. **Implement Custom Token Minting for PINs**
   If Advisors require a fast PIN login, implement a Firebase Cloud Function (`/verify-pin`) that accepts a PIN, validates it on the secure backend, and returns a Custom Auth Token (`admin.auth().createCustomToken()`). The client then authenticates using `signInWithCustomToken()`.

3. **Cloud Function Role Management**
   Create a dedicated Cloud Function that assigns Custom Claims (e.g., `role: 'supervisor'`) to the user's Auth Token when a GM promotes them. 

4. **Lock Down Firestore Reads**
   Immediately remove `allow read: if true;`. Implement strictly scoped reads:
   `allow read: if request.auth != null && request.auth.token.storeId == storeId;`
   This enforces Tenant Isolation, preventing a GM at Store A from reading data at Store B.
