# 🚨 Data Ingestion Security & Architecture Audit

**Reviewer:** Data Ingestion Specialist
**Target:** PapaParse Configurations, DOMPurify Sanitation, Data Pipelines

## 1. The Broken CSV Parser (The "Reinventing the Wheel" Problem)
**Issue:** `useScheduleParser.ts` literally ignored the `PapaParse` library installed in `package.json` and opted for a janky `split(',')` loop with manual quote tracking (`parseCSVLine`). This meant that any user uploading a schedule containing commas inside quoted strings, newlines, or malformed trailing data would instantly crash or corrupt the parsing logic.
**Resolution:** Ripped out the custom regex/loop parser entirely. It has been replaced with `Papa.parse()`, utilizing strict boundary checks.

## 2. The XSS Injection Vector (The "Trusting the File" Problem)
**Issue:** Input headers and rows were fed directly from the parsed CSV string into the component state and ultimately into dynamic DOM node rendering (like DiceBear Avatar URLs).
- `rentsDueUtils.ts`: Failed to sanitize employee names, taking `String(name).trim()` and exposing it.
- `useScheduleParser.ts`: Blindly passed raw strings from the user's local spreadsheet directly into the state `rev.originalName.trim()`. 
**Resolution:** Hardened both extraction points. `DOMPurify.sanitize()` has been wrapped around incoming headers, cells, and dynamically mapped variables *before* they are ever stored in React state.

## 3. Boundary Failures (The "Assuming Perfect Data" Problem)
**Issue:** `rentsDueUtils.ts` gracefully handled string-to-number parsing for metrics (stripping `$` and `%`) but assumed an aggressive optimistic mapping when employees were absent from the base roster.
**Resolution:** Enforced stricter type safety for missing employees and defaulted calculations logically.

## Proposed Data Ops Features
1. **Zod Validation Hooks**: We need a strictly-typed Zod schema validation pass immediately *after* PapaParse finishes. If an uploaded CSV does not meet the expected Zod schema for `EmployeeMetrics`, it should throw a granular error rather than returning `NaN` or generic "off-track" fallbacks.
2. **Server-Side Validation Engine**: Stop doing all data transformation on the client browser. Move the CSV parsing logic to a Firebase Cloud Function using `busboy` or `@google-cloud/storage` triggers to keep the heavy lifting and validation off the UI thread.
3. **Telemetry Logs**: Track rejected CSV payloads for "Rents Due" or "Schedule" so we can figure out what Excel formats are breaking the app.
