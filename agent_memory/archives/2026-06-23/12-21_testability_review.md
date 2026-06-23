# Automation Testability Review - FloorVision

> [!WARNING]
> This codebase is currently hostile to robust automated testing. If we ship this as-is and attempt to write Playwright regression suites, we will spend 90% of our time fixing flaky tests.

## 1. Zero Semantic Locators (`data-testid`)
**The Problem:** There is not a single `data-testid` attribute in the entire React component library. Currently, `autonomous-audit.spec.js` relies on `page.locator('button')` and blind indexing. 
**The Risk:** The moment a UI/UX designer changes a class from `.btn` to `.glass-button`, or alters button ordering, all tests will instantly fail. Tests should not be coupled to CSS classes or text content (which changes with i18n or copywriting).
**The Fix:** Inject `data-testid` into all navigational anchors, form inputs, and state-critical buttons. E.g., `<button data-testid="login-supervisor-btn">`.

## 2. Brittle Auth Bypassing
**The Problem:** In `tests/autonomous-audit.spec.js`, authentication is bypassed via `sessionStorage.setItem('bby_authenticated', 'true')`.
**The Risk:** The application state is actually managed by Zustand and hydrated via Firebase. Bypassing login through naive storage injection means we aren't testing the real authentication flow, and if `LoginGate` implements strict Firebase verification, the tests will hang or crash.
**The Fix:** Create a dedicated `auth.setup.ts` in Playwright that performs a real login (or uses proper mocking) and saves the `storageState`. All tests should then inherit this state.

## 3. Asynchronous Race Conditions Not Accounted For
**The Problem:** `LoginGate` conditionally blocks rendering with `isHydrating` when waiting for Firebase store configuration (`dbConnected && !playbookSettings`).
**The Risk:** Playwright's auto-waiting will fail if it tries to interact with elements before the "Syncing Store Configuration" spinner disappears. The current crawler just hard-waits for 2000ms (`await page.waitForTimeout(2000)`), which causes race conditions on slow CI environments and wastes time on fast local environments.
**The Fix:** Use explicit state waiting in Playwright: `await page.getByTestId('dashboard-container').waitFor({ state: 'visible' })`.

## 4. Third-Party Mock Fragility
**The Problem:** Vitest mocks for `@google/generative-ai` were written manually and lacked critical exports like `SchemaType`. I have hotfixed this, but it highlights a recurring issue with manual mocks.
**The Risk:** If we update the Gemini SDK, our tests might pass while the app crashes in production because our mock interface doesn't match the real SDK.
**The Fix:** Centralize all SDK mocks in `__mocks__` and enforce type parity.

## 5. E2E "Tests" Are Just Crawlers
**The Problem:** `autonomous-audit.spec.js` asserts nothing. It clicks a random button and takes a screenshot.
**The Risk:** This provides a false sense of security. It will not catch logic regressions (e.g., "Does the coaching log actually save?").
**The Fix:** Implement role-based, scenario-driven test suites (Advisor View vs Leader View) with explicit assertions on DOM state.

---

### Immediate Action Plan for Expert Coder & Tech Debt Analyst
1. **Component Tagging:** Add `data-testid` attributes to `LoginGate.tsx`, `Sidebar.tsx`, and `App.tsx` routing boundaries.
2. **Playwright Config Upgrade:** Implement `globalSetup` for auth generation and `use: { storageState: 'playwright/.auth/user.json' }`.
3. **Zustand Mocking Hook:** Expose a `window.__ZUSTAND_STORE__` explicitly for Playwright to forcefully inject mock tenant settings, avoiding UI race conditions.
