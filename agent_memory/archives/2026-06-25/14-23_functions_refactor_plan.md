# Amended Execution Plan: `functions/index.js`

During **Phase 2 (The Multi-Agent Round-Table Debate)**, the proposed state of `functions/index.js` received three `[VETO]` declarations from the `tech_debt_analyst`, `qa_tester`, and `security_engineer`. Per the Parliamentary Rule, I have halted execution and generated this modified plan to systematically satisfy all veto constraints.

## User Review Required

> [!CAUTION]
> **VETO: Security Flaw in Account Provisioning**
> The `provisionTenantAccount` function currently trusts the client completely, allowing anyone to generate `{ role: 'manager' }` claims. We will implement a strict server-side validation using a dedicated Firebase Environment configuration (`functions.config().bby.provisioning_secret`) to lock this down.

> [!WARNING]
> **VETO: Architectural God Object**
> The current 440-line `index.js` tightly couples API routing, cryptographic checks, AI generation, and CSV parsing. Furthermore, the global `jsdom` initialization is causing severe cold-start latency for all endpoints. We will modularize the backend into `src/ai.js`, `src/csv.js`, and `src/auth.js`.

> [!IMPORTANT]
> **VETO: Reliability & Timing Leaks**
> The older Gemini implementations (`generateCoaching`, `auditDialogue`) lack timeouts and are exposed to unhandled exceptions when destructuring nested payloads. We will add a strict `30000ms` `timeout` parameter and wrap `playbookSettings` in safe coalescing operators (`?.`).

## Proposed Changes

### [MODIFY] `functions/index.js`
- Deconstruct the file. `index.js` will now act strictly as an export hub.
- Remove the global `jsdom` and `dompurify` declarations.

### [NEW] `functions/src/ai.js`
- Extract `generateCoaching`, `auditDialogue`, and `generateAIContent`.
- Enforce strict `context.auth` checks for `onCall` and verify Firebase ID tokens for HTTP triggers.
- Apply `timeout: 30000` to all model generation calls.
- Apply null-safety fallback logic (`playbookSettings?.allowedPhrases || []`).

### [NEW] `functions/src/csv.js`
- Extract `parseRentsDueCSV`.
- Move the `jsdom` and `dompurify` initialization *inside* the function scope to prevent global cold-start bloat.
- Enforce `context.auth` validation.

### [NEW] `functions/src/auth.js`
- Extract `provisionTenantAccount` and `verifyCertification`.
- Patch the provisioning failure state to verify the claim actually attached.
- Replace the fallback `GEMINI_API_KEY` in `verifyCertification` with a dedicated `CERT_SIGNING_SECRET`.

## Dual-File Execution Gate

If you approve this amended plan, I will trigger **Phase 3**. The `expert_coder` will execute the modularization, while the `automation_tester` will draft `.spec.ts` files to test the new HTTP trigger auth requirements. Following this, I will run the **Automated Quality Gate** (Phase 4).
