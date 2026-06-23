# AI Integration Analysis: Blunt & No-BS Evaluation

## 1. The "Newly Implemented" Hybrid CSV Parsing (Rents Due) is Critically Flawed
The Rents Due parsing pipeline in `src/services/ai/geminiDocumentParsers.ts` (`parseRentsDueDocumentGemini`) is currently a ticking time bomb for production.

*   **Violates Rate Limiting (Instant 429s):** The function splits text into 30-line chunks and then maps them into an array of Promises, firing `Promise.all(chunkPromises)`. It completely bypasses the `executeWithRetry` wrapper defined in `core.ts`. For a typical store roster of 120 employees, this fires 4 concurrent requests to Gemini instantly, resulting in an immediate 429 Rate Limit error, breaking the feature and falling back to offline mocks.
*   **Destructive Chunking Logic:** The input text is naively split by `\n` and chunked by 30 lines. This means chunk 1 gets the CSV headers, but chunks 2, 3, etc., receive raw comma-separated numbers with absolutely no column context. The LLM will hallucinate or fail to map the data to the JSON schema because it doesn't know what the columns represent.
*   **Token Inefficiency (Wrong Model):** It hardcodes `gemini-3.5-pro` for simple structured text chunk parsing. `gemini-3.5-flash` is vastly cheaper, faster, and perfectly capable of basic structured extraction. Pro should be reserved for the image parsing route.

## 2. Gemini Prompts & Token Bloat
*   **Unbounded Context Injection:** In `geminiCoaching.ts` (`generateCoachingLogGemini`), the prompt injects `playbookSettings.trainingLogs.map(log => ...).join('\n\n')`. There is no limit enforced on how many training logs are passed. If a manager pastes 10 lengthy exemplar logs into the playbook, the token usage will skyrocket, leading to high latency and potential context window overflow. This needs a hard slice (e.g., max 2-3 logs).
*   **Yelling at the AI:** The prompt in Rents Due parsing yells: *"CRITICAL INSTRUCTION: You MUST extract every single employee... DO NOT STOP... Truncating this list is a catastrophic failure."* This is an amateur prompt engineering tactic. Instead of yelling, the system should use temperature controls (`temperature: 0.1`), strict schema definitions, and proper data chunking (with headers included in each chunk).

## 3. Total Lack of AI Caching
*   **Zero Memoization:** There is no local caching layer for AI responses. If a user uploads the exact same schedule image twice, or clicks "Generate 1-on-1" for the same employee data, the system fires a fresh API request, wasting tokens and bandwidth. 

## 4. Inconsistent Architectural Implementation
*   **Bypassing the Core Service:** `generateMonthlyOneOnOne` in `geminiCoaching.ts` instantiates `GoogleGenerativeAI` directly and hardcodes `gemini-3.5-pro`, bypassing the centralized `getGeminiModel` helper from `core.ts`. It also ignores `executeWithRetry`, leaving it vulnerable to transient failures and rate limits.

---

## Proposed AI Functionality Additions

To elevate the app from a basic AI wrapper to a genuine retail management co-pilot, consider the following:

1.  **AI-Driven Floor Optimization (Smart Zoning):**
    *   **Concept:** Cross-reference the uploaded daily schedule with the historical performance database. 
    *   **Action:** The AI suggests the optimal zone placements for the day (e.g., placing the highest RPH/Credit Card performers in the highest traffic zones during peak hours, and pairing new hires with top performers).
2.  **Automated Pre-Shift Gap Analysis (Nightly Batch):**
    *   **Concept:** Background worker that aggregates the entire store's metrics.
    *   **Action:** Pre-generates the "Top 3 Employees to Coach Today" and their specific gap analysis (using `generatePerformanceGap`) before the floor leader even logs in. This eliminates the wait time for AI generation during the hectic morning shift huddle.
3.  **Real-Time "Objection Handling" Walkie-Talkie (Roleplay Mode):**
    *   **Concept:** Enhance the `RoleplayCenter` with speech-to-text.
    *   **Action:** Associates can literally speak their pitch into their phone/tablet, and the AI immediately responds via text-to-speech with a difficult customer objection ("I don't want another credit card...").
