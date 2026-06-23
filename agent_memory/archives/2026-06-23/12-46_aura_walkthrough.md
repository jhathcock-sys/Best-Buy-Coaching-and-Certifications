# Aura (The Live Floor Command HUD)

The Aura HUD has been fully implemented and integrated into FloorVision! 

This new view acts as the ultimate active "Radar" for Floor Leaders, shifting the app from a historical ledger into an AI-powered coaching companion.

## What Was Built

### 1. The Aura Engine (`auraEngine.ts`)
We created a specialized proxy wrapper around our existing Firebase Gemini Callable Function. This engine takes a snapshot of an employee's raw metrics (transactions, revenue, attachments) and instructs Gemini to return a strict JSON payload categorizing them into one of three behavioral profiles:
- `excellent`
- `needs_coaching`
- `steady`

### 2. The Radar Sweep (Staggered Loading)
As requested, we implemented a **Manual "Scan Floor" Button**. 
When triggered, the app sorts the active roster (prioritizing the lowest performing employees first) and feeds them into the Aura Engine sequentially. 
> [!TIP]
> This staggered approach prevents `429 Too Many Requests` rate limit errors from the Gemini API when scanning large rosters, ensuring stable behavior in production.

### 3. Premium Glassmorphic UI
The HUD itself represents the highest tier of our design system:
- **The Canvas:** A deep `--bg-obsidian` to `--bg-space` radial background.
- **The Cards:** Highly blurred, asymmetrical floating tiles (`AuraActionCard.tsx`).
- **Micro-animations:** 
  - Overperformers receive a 3-second breathing `--success-glow`.
  - Employees needing coaching receive an urgent, 2-second `--bby-yellow` warning pulse on their card borders.

### 4. Integration
- The `/aura` route has been added to the main router.
- You can access the HUD by clicking the new **Aura Radar** icon in the Sidebar under the *Floor Operations* tab.
- Every Action Card includes a "Coach Now" button that routes you instantly into the `CoachSimulatorPage` with the targeted employee pre-selected for the roleplay.

## Next Steps
You can deploy these changes to Firebase Hosting, or spin up the local dev server (`npm run dev`) to test the Radar sweep live! Let me know if you want to tweak the UI or move on to the next feature!
