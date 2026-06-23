# Major Component Refactoring Plan

This plan aims to execute the "do all of this" request by breaking down the remaining four largest components (`CustomScenariosTab`, `StoreRoster`, `ShiftTrackerSidebar`, and `AssociateProfileModal`) into smaller, more discrete sub-components. This will significantly reduce their line counts and adhere strictly to the anti-God Object rules.

## User Review Required
These are structural React component changes. No application behavior will change, but multiple files will be created and modified.

## Open Questions
None.

## Proposed Changes

### 1. `CustomScenariosTab.tsx`
This component currently holds over 15 `useState` hooks solely for the custom scenario creation form.
- **[NEW] `src/components/Playbook/CustomScenarioForm.tsx`**: Create a new component to house the entire `form onSubmit={handleCreateScenario}` UI, including all of its local state variables (`scenTitle`, `scenName`, etc.) and the `handleCreateScenario` logic.
- **[MODIFY] `src/components/Playbook/CustomScenariosTab.tsx`**: Remove the inline form and its associated state. Render `<CustomScenarioForm onAddCustomScenario={onAddCustomScenario} />`.

### 2. `StoreRoster.tsx`
This container has several large inline UI blocks for starting new periods and adjusting display settings.
- **[NEW] `src/components/StoreRoster/StartNewPeriodForm.tsx`**: Extract the 60-line collapsible "Start New Performance Period" card.
- **[NEW] `src/components/StoreRoster/RosterDisplaySettings.tsx`**: Extract the "Roster Display Settings" drawer.
- **[MODIFY] `src/components/StoreRoster.tsx`**: Replace those inline blocks with the newly created components, passing the necessary state handlers as props.

### 3. `ShiftTrackerSidebar.tsx`
This sidebar handles multiple distinct responsibilities (logging wins, OCV observations, leaderboard).
- **[NEW] `src/components/FloorLeader/QuickLogWinForm.tsx`**: Extract the "Quick Log Floor Win" card.
- **[NEW] `src/components/FloorLeader/OcvObservationForm.tsx`**: Extract the "30-Second OCV Floor Observation" card.
- **[MODIFY] `src/components/FloorLeader/ShiftTrackerSidebar.tsx`**: Render these two new sub-components instead of the inline HTML.

### 4. `AssociateProfileModal.tsx`
The modal has a massive, complex header displaying CVI, badges, and Focus 5 tags.
- **[NEW] `src/components/AssociateProfile/AssociateProfileHeader.tsx`**: Extract the header section (the employee name, ID, CVI pill calculation, and Focus 5 rendering).
- **[MODIFY] `src/components/AssociateProfileModal.tsx`**: Render `<AssociateProfileHeader employee={employee} rosterHistory={rosterHistory} activePeriod={activePeriod} onClose={onClose} />` to trim the modal container size.

## Verification Plan
### Automated Tests
- Run `npx tsc --noEmit` and `npm run build` to verify that all prop types and imports were moved successfully without any missing references.
### Manual Verification
- The user can open the app and verify that the Playbook Custom Scenarios form still works, the Shift Tracker sidebars render correctly, and the Store Roster menus toggle properly.
