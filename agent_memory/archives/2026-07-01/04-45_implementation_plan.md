# Goal: Optimize CSV Uploads and AI Parsing

The user requested research into how we can improve the architecture for uploading and AI-parsing Rents Due CSVs. Currently, the architecture suffers from latency, cloud function timeouts, rate limits, and fragile regex heuristics.

## Open Questions

> [!WARNING]
> What is the typical maximum size of a Rents Due CSV? (e.g. 20 employees vs 500 employees). If the output exceeds 8192 tokens, the AI will truncate the response regardless of instructions.

## Proposed Changes

Based on my research, here are the architectural changes we should make to drastically improve the reliability and speed of CSV parsing:

### 1. Shift PapaParse to the Frontend (Client-Side)
**Problem**: We currently send raw CSV text to a Firebase Cloud Function (`parseRentsDueCSVCloud`), which then runs `PapaParse` and sends the JSON back. This adds unnecessary network latency, risk of timeouts, and wastes backend compute.
**Solution**: Move `PapaParse` execution entirely into the browser (`src/utils/rentsDueUtils.ts`). It is fully capable of running client-side, making standard CSV parsing instantaneous.

### 2. Implement an Interactive Column Mapping UI
**Problem**: The current PapaParse logic relies on fragile regex heuristics (e.g., looking for `rev/hr` or `revenue per hour`). If a manager uploads a sheet with a column named "Sales/Hr", the regex fails and it drops to the AI fallback.
**Solution**: Instead of instantly falling back to Gemini when regex fails, intercept the upload and present a simple UI dropdown asking the user: *"We couldn't identify the Revenue column. Which of these columns is Revenue?"*. 

### 3. AI Fallback: Structured Batching for Large Files
**Problem**: If the user uploads a large unstructured text block (copy/paste) or an image, it is sent to Gemini. If the output exceeds the 8,192 token limit, Gemini will truncate the JSON array, causing a `SyntaxError: Unexpected token` when we try to `JSON.parse()` it.
**Solution**: 
- **Chunked Processing**: We must split large text uploads into smaller chunks (e.g., 20 employees per chunk).
- **Rule 15 Compliance**: Since we cannot exceed 15 RPM, we will use a `Promise.all()` batching strategy only if the chunks are small enough, OR we use a single API call but instruct the AI to only extract the *missing* or *unmapped* fields rather than rewriting the entire schema. 
- *Actually, to comply with Rule 15 strictly, we must package the entire array into a single JSON prompt. To prevent truncation, we can slim down the requested JSON schema for the AI fallback to only return essential fields rather than verbose status strings (e.g., return `[name, rph, rev, apps]` and we calculate the `rphStatus`, `rphOwed` locally).*

---

### File Modifications

#### [MODIFY] `src/components/RentsDueAuditor.tsx`
- Remove the call to `parseRentsDueCSVCloud`.
- Implement client-side `Papa.parse()`.
- Add a state for `missingColumns` to trigger a manual column-mapping UI step before falling back to AI.

#### [MODIFY] `src/components/RentsDueAuditor/RentsDueUploader.tsx`
- Add UI dropdowns for users to manually map unidentified columns to our expected metrics (RPH, Revenue, Apps, Memberships, Warranty).

#### [MODIFY] `functions/src/csv.js`
- Deprecate or remove `parseRentsDueCSV` as it will no longer be needed backend-side.

#### [MODIFY] `src/services/ai/geminiDocumentParsers.ts`
- Simplify the JSON schema requested from Gemini to minimize output tokens (removing `rphStatus`, `rphOwed`, etc., since those can be calculated locally using the `playbookSettings` store).

## Verification Plan

### Automated Tests
- Run `npm run typecheck` and `npm run test`
- Summon `automation_tester` to update `tests/rents-due.spec.ts` to test the new client-side parsing and column mapping UI.

### Manual Verification
- Upload a poorly formatted CSV with weird column names.
- Verify the system prompts the user to map the columns rather than failing or timing out.
- Verify the AI fallback accurately parses a screenshot without hitting output token limits.
