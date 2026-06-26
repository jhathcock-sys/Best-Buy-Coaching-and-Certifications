# Generative Dashboard UI (Conversational Analytics)

This plan outlines the implementation of a cutting-edge conversational analytics engine for the Trend Reporting page. Instead of relying on static, predefined charts, leaders will be able to ask natural language questions (e.g., "Who has the best Basket Size in Computing this month?"), and the AI will dynamically generate the appropriate UI components and narrative analysis in real-time.

## User Review Required

> [!IMPORTANT]
> **Data Transmission & Latency:** We will need to pass the `dailySnapshots` data to Gemini so it can calculate the answers. Gemini 3.5 Pro has a massive 2 million token context window, so it can easily handle the data, but sending the entire history might take a few seconds to process. 
> **Decision Needed:** Should we send the *entire* historical dataset to the AI, or artificially cap it (e.g., the last 30/60 days) to ensure snappy UI responses?

## Open Questions

> [!QUESTION]
> **Fallback UI:** Should we completely replace the existing static charts (Revenue, Memberships, etc.) with this chat interface, or should we keep the static charts visible by default until the user types a question?

## Proposed Changes

---

### `src/services/ai/geminiAnalytics.ts`
[NEW] `src/services/ai/geminiAnalytics.ts`
We will create a new frontend service wrapper that utilizes the existing `generateAIContent` Firebase Cloud Function.
- It will take the user's natural language question and the raw `dailySnapshots` state.
- It will inject a strict JSON schema (`responseSchema`) instructing Gemini to return:
  ```json
  {
    "chartType": "bar" | "metric",
    "title": "Chart Title",
    "narrativeSummary": "A brief explanation of the findings.",
    "dataPoints": [
      { "label": "John Doe", "value": 1500, "colorAccent": "success" }
    ],
    "format": "currency" | "number"
  }
  ```

### `src/components/Analytics/DynamicChartRenderer.tsx`
[NEW] `src/components/Analytics/DynamicChartRenderer.tsx`
A polymorphic React component that takes the Gemini JSON output and renders the appropriate UI (e.g., mapping `"bar"` to a styled CSS bar chart, or `"metric"` to a large statistic card). It will heavily utilize our existing glassmorphic design tokens.

### `src/pages/TrendReportingPage.tsx`
[MODIFY] `src/pages/TrendReportingPage.tsx`
- Add a prominent, glowing chat input at the top of the page for conversational analytics.
- Integrate a loading state with our cyberpunk spinner while the AI processes the data.
- Conditionally render the `DynamicChartRenderer` below the input when the AI returns a response.

## Verification Plan

### Automated Tests
- Run the full suite via PowerShell (`npm run typecheck ; npm run test`) to ensure no regressions in existing Zustand hooks or Firebase calls.

### Manual Verification
- Log in as a Manager.
- Navigate to Trend Reporting.
- Type complex queries like "Which 3 employees had the highest credit cards last week?" and verify the dynamically generated UI accurately reflects the mocked `dailySnapshots` data in the Zustand store.
