# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: zone-scheduler.spec.js >> Zone Scheduler E2E >> Drag-and-drop mechanism moves associate to zone
- Location: tests\zone-scheduler.spec.js:79:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('droppable-zone-computing').locator('[data-testid="draggable-associate-avneet"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('droppable-zone-computing').locator('[data-testid="draggable-associate-avneet"]')

```

```yaml
- navigation:
  - img: BEST BUY
  - text: FloorVision Logged in as James H
  - button "Log Out"
  - text: Experience Supervisor Sales and Front End
  - list:
    - listitem: Overview
    - listitem: Dashboard
    - listitem: Floor Operations
    - listitem: Store Roster
    - listitem: Floor Shadowing
    - listitem: Aura Radar
    - listitem: Daily Lineup
    - listitem: Floor Leader
    - listitem: Trend Reporting
    - listitem: Breakroom TV (Kiosk)
    - listitem: Coaching & Practice
    - listitem: Consult Arena
    - listitem: Coach Simulator
    - listitem: Records & Setup
    - listitem: Coaching Generator
    - listitem: History Hub
    - listitem: Playbook Studio
  - text: Cloud Database Synced Gemini Free Mode Active
- main:
  - heading "Floor Leader Tracker" [level=1]
  - paragraph: Track hourly credit cards (Apps) and memberships (PMs) targets in real-time during your floor-leading shift.
  - text: Active Shift Leader
  - heading "Playwright Test Leader" [level=3]
  - text: Weekday Targets (2/2) Total Revenue $0.00 Accumulated across shift Total PMs (Memberships) 0 Accumulated across shift Total Apps (Credit Cards) 0 Accumulated across shift Shift On-Track Rate 0% 0 of 1 hours meeting target
  - button "Hourly Tracker"
  - button "Zones & Breaks Run Sheet"
  - button "Floor Audit (Vision)"
  - button "Shift Simulator"
  - button "5-Star Detractor Coach"
  - button "Generate Handoff"
  - button "End Shift"
  - button "Import Floor Schedule"
  - heading "Sales Floor Zone Assignments" [level=3]
  - paragraph: "Zoning sheet scheduler: visually drag and drop associates or auto-deploy."
  - button "Auto-Deploy (AI)"
  - button "Zones"
  - button "Timeline"
  - heading "Unassigned (Roster)" [level=4]
  - text: 46 active
  - 'button "Andrew Nash Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Andrew Nash Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Anish Patel Membs: 27 CCs: 20 GSP: 5.1% Send on: ☕ 15m 🍔 30m"':
    - text: "Anish Patel Membs: 27 CCs: 20 GSP: 5.1% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Avneet Aurora Membs: 3 CCs: 1 GSP: 7.4% Send on: ☕ 15m 🍔 30m"':
    - text: "Avneet Aurora Membs: 3 CCs: 1 GSP: 7.4% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Breanna Tate Membs: 21 CCs: 17 GSP: 17.5% Send on: ☕ 15m 🍔 30m"':
    - text: "Breanna Tate Membs: 21 CCs: 17 GSP: 17.5% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Brian Martinez Membs: 3 CCs: 2 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Brian Martinez Membs: 3 CCs: 2 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Camryn Martinez Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Camryn Martinez Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Carlos Salamancia Membs: 0 CCs: 0 GSP: 6.7% Send on: ☕ 15m 🍔 30m"':
    - text: "Carlos Salamancia Membs: 0 CCs: 0 GSP: 6.7% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Charli Vansteenwijk Membs: 7 CCs: 6 GSP: 18.2% Send on: ☕ 15m 🍔 30m"':
    - text: "Charli Vansteenwijk Membs: 7 CCs: 6 GSP: 18.2% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Chibueze Nwosu Membs: 4 CCs: 4 GSP: 14.6% Send on: ☕ 15m 🍔 30m"':
    - text: "Chibueze Nwosu Membs: 4 CCs: 4 GSP: 14.6% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Dale McClain Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Dale McClain Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Daniel Thompson Membs: 0 CCs: 0 GSP: 6% Send on: ☕ 15m 🍔 30m"':
    - text: "Daniel Thompson Membs: 0 CCs: 0 GSP: 6% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "David Welter Membs: 8 CCs: 9 GSP: 19% Send on: ☕ 15m 🍔 30m"':
    - text: "David Welter Membs: 8 CCs: 9 GSP: 19% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Daymeire Jones Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Daymeire Jones Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Devlin Lamour Membs: 1 CCs: 1 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Devlin Lamour Membs: 1 CCs: 1 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Diana Miller Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Diana Miller Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Ethan Baechtel Membs: 25 CCs: 18 GSP: 5.9% Send on: ☕ 15m 🍔 30m"':
    - text: "Ethan Baechtel Membs: 25 CCs: 18 GSP: 5.9% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Gj Parkstone Membs: 3 CCs: 2 GSP: 8.1% Send on: ☕ 15m 🍔 30m"':
    - text: "Gj Parkstone Membs: 3 CCs: 2 GSP: 8.1% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Heba Aljammazi Membs: 6 CCs: 12 GSP: 5.9% Send on: ☕ 15m 🍔 30m"':
    - text: "Heba Aljammazi Membs: 6 CCs: 12 GSP: 5.9% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Hemish Patel Membs: 7 CCs: 10 GSP: 6.3% Send on: ☕ 15m 🍔 30m"':
    - text: "Hemish Patel Membs: 7 CCs: 10 GSP: 6.3% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Ivan Holden Membs: 3 CCs: 2 GSP: 19.2% Send on: ☕ 15m 🍔 30m"':
    - text: "Ivan Holden Membs: 3 CCs: 2 GSP: 19.2% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Jeffrey Dorso Membs: 5 CCs: 8 GSP: 4.6% Send on: ☕ 15m 🍔 30m"':
    - text: "Jeffrey Dorso Membs: 5 CCs: 8 GSP: 4.6% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "John Avera Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "John Avera Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Josh Iubatti Membs: 25 CCs: 14 GSP: 7.5% Send on: ☕ 15m 🍔 30m"':
    - text: "Josh Iubatti Membs: 25 CCs: 14 GSP: 7.5% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Joshua Hurns Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Joshua Hurns Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Julian Myers Membs: 11 CCs: 7 GSP: 14.8% Send on: ☕ 15m 🍔 30m"':
    - text: "Julian Myers Membs: 11 CCs: 7 GSP: 14.8% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Juliana Mulrooney Membs: 5 CCs: 3 GSP: 12.7% Send on: ☕ 15m 🍔 30m"':
    - text: "Juliana Mulrooney Membs: 5 CCs: 3 GSP: 12.7% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Kevin Quezada-Alvarez Membs: 0 CCs: 2 GSP: 5.4% Send on: ☕ 15m 🍔 30m"':
    - text: "Kevin Quezada-Alvarez Membs: 0 CCs: 2 GSP: 5.4% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Kyle HarperJr Membs: 30 CCs: 9 GSP: 6.6% Send on: ☕ 15m 🍔 30m"':
    - text: "Kyle HarperJr Membs: 30 CCs: 9 GSP: 6.6% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Lawrence Staples Membs: 1 CCs: 1 GSP: 14.4% Send on: ☕ 15m 🍔 30m"':
    - text: "Lawrence Staples Membs: 1 CCs: 1 GSP: 14.4% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Marwan Jaffery Membs: 0 CCs: 0 GSP: 9.4% Send on: ☕ 15m 🍔 30m"':
    - text: "Marwan Jaffery Membs: 0 CCs: 0 GSP: 9.4% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Maryjane Hurst Membs: 2 CCs: 5 GSP: 1.6% Send on: ☕ 15m 🍔 30m"':
    - text: "Maryjane Hurst Membs: 2 CCs: 5 GSP: 1.6% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Montclair Barker Jr Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Montclair Barker Jr Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Muntarin Choudhury Membs: 1 CCs: 1 GSP: 17.3% Send on: ☕ 15m 🍔 30m"':
    - text: "Muntarin Choudhury Membs: 1 CCs: 1 GSP: 17.3% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Paul Novakofski Membs: 2 CCs: 1 GSP: 14.8% Send on: ☕ 15m 🍔 30m"':
    - text: "Paul Novakofski Membs: 2 CCs: 1 GSP: 14.8% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Pete Rodriguez Membs: 3 CCs: 6 GSP: 6.8% Send on: ☕ 15m 🍔 30m"':
    - text: "Pete Rodriguez Membs: 3 CCs: 6 GSP: 6.8% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Ricky Singh Membs: 2 CCs: 3 GSP: 5.4% Send on: ☕ 15m 🍔 30m"':
    - text: "Ricky Singh Membs: 2 CCs: 3 GSP: 5.4% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Riley Neyra Membs: 1 CCs: 3 GSP: 1.9% Send on: ☕ 15m 🍔 30m"':
    - text: "Riley Neyra Membs: 1 CCs: 3 GSP: 1.9% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Rob Dempsey Membs: 1 CCs: 2 GSP: 16.7% Send on: ☕ 15m 🍔 30m"':
    - text: "Rob Dempsey Membs: 1 CCs: 2 GSP: 16.7% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Rocky Lones Membs: 10 CCs: 2 GSP: 6.3% Send on: ☕ 15m 🍔 30m"':
    - text: "Rocky Lones Membs: 10 CCs: 2 GSP: 6.3% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Tim McMahon Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Tim McMahon Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Timothy Lehr Membs: 13 CCs: 6 GSP: 4.1% Send on: ☕ 15m 🍔 30m"':
    - text: "Timothy Lehr Membs: 13 CCs: 6 GSP: 4.1% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Victor Alcantara Membs: 11 CCs: 11 GSP: 3.2% Send on: ☕ 15m 🍔 30m"':
    - text: "Victor Alcantara Membs: 11 CCs: 11 GSP: 3.2% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Webster Jean Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Webster Jean Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Will Slade Membs: 0 CCs: 0 GSP: 0% Send on: ☕ 15m 🍔 30m"':
    - text: "Will Slade Membs: 0 CCs: 0 GSP: 0% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Yinel Gonzalez Membs: 2 CCs: 2 GSP: 19% Send on: ☕ 15m 🍔 30m"':
    - text: "Yinel Gonzalez Membs: 2 CCs: 2 GSP: 19% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - 'button "Zach Jones Membs: 4 CCs: 0 GSP: 16.7% Send on: ☕ 15m 🍔 30m"':
    - text: "Zach Jones Membs: 4 CCs: 0 GSP: 16.7% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - heading "Computing" [level=4]
  - text: 0 active Zone unstaffed
  - heading "Mobile" [level=4]
  - text: 1 active
  - 'button "Abhi Parmar Remove Membs: 37 CCs: 13 GSP: 8% Send on: ☕ 15m 🍔 30m"':
    - text: Abhi Parmar
    - button "Remove"
    - text: "Membs: 37 CCs: 13 GSP: 8% Send on:"
    - button "☕ 15m"
    - button "🍔 30m"
  - heading "Home Theatre" [level=4]
  - text: 0 active Zone unstaffed
  - heading "Front End" [level=4]
  - text: 0 active Zone unstaffed
  - heading "Geek Squad" [level=4]
  - text: 0 active Zone unstaffed
  - heading "Appliances" [level=4]
  - text: 0 active Zone unstaffed
  - status: Draggable item emp_ws877bndg was dropped over droppable area Mobile
  - heading "Breaks & Lunches Run Sheet" [level=3]
  - paragraph: "Timetable run sheet: coordinate scheduled breaks and lunches to prevent sales floor coverage gaps."
  - heading "Schedule Break" [level=4]
  - text: "Select Associate:"
  - combobox:
    - option "-- Choose Associate --" [selected]
    - option "Abhi Parmar (General Sales)"
    - option "Andrew Nash (General Sales)"
    - option "Anish Patel (General Sales)"
    - option "Avneet Aurora (General Sales)"
    - option "Breanna Tate (General Sales)"
    - option "Brian Martinez (General Sales)"
    - option "Camryn Martinez (General Sales)"
    - option "Carlos Salamancia (General Sales)"
    - option "Charli Vansteenwijk (General Sales)"
    - option "Chibueze Nwosu (General Sales)"
    - option "Dale McClain (General Sales)"
    - option "Daniel Thompson (General Sales)"
    - option "David Welter (General Sales)"
    - option "Daymeire Jones (General Sales)"
    - option "Devlin Lamour (General Sales)"
    - option "Diana Miller (General Sales)"
    - option "Ethan Baechtel (General Sales)"
    - option "Gj Parkstone (General Sales)"
    - option "Heba Aljammazi (General Sales)"
    - option "Hemish Patel (General Sales)"
    - option "Ivan Holden (General Sales)"
    - option "Jeffrey Dorso (General Sales)"
    - option "John Avera (General Sales)"
    - option "Josh Iubatti (General Sales)"
    - option "Joshua Hurns (General Sales)"
    - option "Julian Myers (General Sales)"
    - option "Juliana Mulrooney (General Sales)"
    - option "Kevin Quezada-Alvarez (General Sales)"
    - option "Kyle HarperJr (General Sales)"
    - option "Lawrence Staples (General Sales)"
    - option "Marwan Jaffery (General Sales)"
    - option "Maryjane Hurst (General Sales)"
    - option "Montclair Barker Jr (General Sales)"
    - option "Muntarin Choudhury (General Sales)"
    - option "Paul Novakofski (General Sales)"
    - option "Pete Rodriguez (General Sales)"
    - option "Ricky Singh (General Sales)"
    - option "Riley Neyra (General Sales)"
    - option "Rob Dempsey (General Sales)"
    - option "Rocky Lones (General Sales)"
    - option "Tim McMahon (General Sales)"
    - option "Timothy Lehr (General Sales)"
    - option "Victor Alcantara (General Sales)"
    - option "Webster Jean (General Sales)"
    - option "Will Slade (General Sales)"
    - option "Yinel Gonzalez (General Sales)"
    - option "Zach Jones (General Sales)"
  - text: "Target Time:"
  - combobox:
    - option "10:00 AM"
    - option "10:30 AM"
    - option "11:00 AM"
    - option "11:30 AM"
    - option "12:00 PM" [selected]
    - option "12:30 PM"
    - option "1:00 PM"
    - option "1:30 PM"
    - option "2:00 PM"
    - option "2:30 PM"
    - option "3:00 PM"
    - option "3:30 PM"
    - option "4:00 PM"
    - option "4:30 PM"
    - option "5:00 PM"
    - option "5:30 PM"
    - option "6:00 PM"
    - option "6:30 PM"
    - option "7:00 PM"
    - option "7:30 PM"
  - text: "Break Type:"
  - combobox:
    - option "15 min Break" [selected]
    - option "30 min Lunch"
    - option "45 min Lunch"
  - button "+ Add Shift Break"
  - heading "Today's Break Run Sheet" [level=4]
  - text: No breaks scheduled yet for today's run sheet.
  - heading "Past Floor Leading Shifts Archive" [level=3]
  - text: No archived floor-leading shifts logged yet. Complete your first shift above.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Zone Scheduler E2E', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('/');
  7   | 
  8   |     // Select Supervisor persona
  9   |     await page.getByTestId('persona-supervisor-btn').click();
  10  | 
  11  |     // Enter backdoor PIN (1022)
  12  |     await page.getByTestId('keypad-1').click();
  13  |     await page.getByTestId('keypad-0').click();
  14  |     await page.getByTestId('keypad-2').click();
  15  |     await page.getByTestId('keypad-2').click();
  16  | 
  17  |     // Wait for the app to settle
  18  |     const dashboardNav = page.getByTestId('nav-dashboard');
  19  |     await expect(dashboardNav).toBeVisible({ timeout: 10000 });
  20  | 
  21  |     // Go to Floor Leader
  22  |     await page.getByTestId('nav-floor-leader').click();
  23  |     
  24  |     // Wait for either the setup form OR the tabs to appear
  25  |     await expect(page.locator('text=Start Shift Monitoring').or(page.locator('text=Zones & Breaks Run Sheet'))).toBeVisible({ timeout: 10000 });
  26  | 
  27  |     const startShiftBtn = page.getByRole('button', { name: 'Start Shift Monitoring' });
  28  |     if (await startShiftBtn.isVisible()) {
  29  |       await page.locator('input[type="text"]').first().fill('Playwright Test Leader');
  30  |       await startShiftBtn.click();
  31  |     }
  32  | 
  33  |     // Switch to 'Zones & Breaks Run Sheet' tab
  34  |     await page.getByText('Zones & Breaks Run Sheet').click();
  35  |   });
  36  | 
  37  |   test('Auto-Deploy (AI) button works and shows success toast', async ({ page }) => {
  38  |     // Mock the Firebase Cloud Function
  39  |     await page.route('**/*generateAIContent', async route => {
  40  |       // Simulate delay for disabled state testing
  41  |       await new Promise(resolve => setTimeout(resolve, 500));
  42  |       
  43  |       const payload = {
  44  |         data: {
  45  |           text: JSON.stringify({
  46  |             'Computing': ['emp-1'],
  47  |             'Mobile': ['emp-2']
  48  |           })
  49  |         }
  50  |       };
  51  |       await route.fulfill({
  52  |         status: 200,
  53  |         contentType: 'application/json',
  54  |         body: JSON.stringify(payload)
  55  |       });
  56  |     });
  57  | 
  58  |     const autoDeployBtn = page.getByTestId('auto-deploy-btn');
  59  |     
  60  |     // Initial state
  61  |     await expect(autoDeployBtn).toBeEnabled();
  62  |     
  63  |     // Click auto deploy
  64  |     await autoDeployBtn.click();
  65  | 
  66  |     // While fetching, it should be disabled and say "Optimizing..."
  67  |     await expect(autoDeployBtn).toBeDisabled();
  68  |     await expect(autoDeployBtn).toContainText('Optimizing...');
  69  | 
  70  |     // Wait for the success toast message
  71  |     const toastMessage = page.locator('.go3958317564'); // Default hot-toast class, but we can look for text
  72  |     await expect(page.getByText('Roster optimized and Auto-Deployed!')).toBeVisible({ timeout: 5000 });
  73  | 
  74  |     // Should return to enabled
  75  |     await expect(autoDeployBtn).toBeEnabled();
  76  |     await expect(autoDeployBtn).toContainText('Auto-Deploy (AI)');
  77  |   });
  78  | 
  79  |   test('Drag-and-drop mechanism moves associate to zone', async ({ page }) => {
  80  |     // Look for an unassigned associate. Draggable associates have data-testid="draggable-associate-<id>"
  81  |     // We don't know the exact ID, so we get the first one inside the unassigned zone
  82  |     const unassignedZone = page.getByTestId('droppable-zone-unassigned');
  83  |     const firstAssociate = unassignedZone.locator('[data-testid^="draggable-associate-"]').first();
  84  |     
  85  |     // Get the ID of the first associate
  86  |     const associateId = await firstAssociate.getAttribute('data-testid');
  87  |     
  88  |     // Drag to Computing zone using dispatchEvent for dnd-kit
  89  |     const computingZone = page.getByTestId('droppable-zone-computing');
  90  |     
  91  |     // Playwright dragTo is the most robust way to test drag-and-drop
  92  |     await firstAssociate.dragTo(computingZone, {
  93  |       force: true,
  94  |       targetPosition: { x: 50, y: 50 }, // Aim for center of computing zone
  95  |     });
  96  |     await page.waitForTimeout(500);
  97  | 
  98  |     // Verify the associate is now inside the Computing zone
> 99  |     await expect(computingZone.locator(`[data-testid="${associateId}"]`)).toBeVisible({ timeout: 5000 });
      |                                                                           ^ Error: expect(locator).toBeVisible() failed
  100 |     
  101 |     // Verify the unassigned zone no longer has this associate
  102 |     await expect(unassignedZone.locator(`[data-testid="${associateId}"]`)).not.toBeVisible();
  103 |   });
  104 | 
  105 |   test('UI correctly renders active break statuses on associate cards', async ({ page }) => {
  106 |     // Send the first associate on a break
  107 |     const unassignedZone = page.getByTestId('droppable-zone-unassigned');
  108 |     const firstAssociate = unassignedZone.locator('[data-testid^="draggable-associate-"]').first();
  109 |     const associateId = await firstAssociate.getAttribute('data-testid');
  110 |     const empId = associateId.replace('draggable-associate-', '');
  111 |     
  112 |     // Click the 15m break button on the associate
  113 |     const breakBtn = firstAssociate.locator('button', { hasText: '15m' }).first();
  114 |     
  115 |     // DND Kit cards intercept clicks, so dispatch pointerdown directly to bypass drag sensors
  116 |     await breakBtn.dispatchEvent('pointerdown');
  117 | 
  118 |     // Verify the break status shows
  119 |     const breakStatus = firstAssociate.getByTestId(`break-status-${empId}`);
  120 |     await expect(breakStatus).toBeVisible();
  121 |     await expect(breakStatus).toContainText('On 15m Break');
  122 |     
  123 |     // End the break
  124 |     const endBtn = firstAssociate.locator('button', { hasText: 'End Break' });
  125 |     await endBtn.dispatchEvent('pointerdown');
  126 |     
  127 |     // Verify the status is gone
  128 |     await expect(breakStatus).not.toBeVisible();
  129 |   });
  130 | 
  131 | });
  132 | 
```