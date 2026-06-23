# Aura HUD Task Checklist

## 1. Global Architecture & Routing
- `[x]` Modify `App.tsx` to include `/aura` route.
- `[x]` Modify `Sidebar.tsx` to include "Aura Radar" navigation link.

## 2. AI Engine Integration
- `[x]` Create `src/services/ai/auraEngine.ts` to fetch Gemini micro-insights.

## 3. Aura HUD Components
- `[x]` Create `AuraHUD.css` for deep background and pulse animations.
- `[x]` Create `AuraActionCard.tsx` using glassmorphic templates.
- `[x]` Create `AuraHUDPage.tsx` with staggered "Manual Scan" loading logic.

## 4. Verification
- `[ ]` Verify UI renders correctly without AI scanning.
- `[ ]` Verify Manual Scan button fires properly without hitting rate limits.
