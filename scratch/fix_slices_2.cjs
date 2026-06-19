const fs = require('fs');
const path = require('path');

// 1. Fix useStore.ts
const useStoreFile = path.join(__dirname, '../src/store/useStore.ts');
let useStoreContent = fs.readFileSync(useStoreFile, 'utf8');
useStoreContent = useStoreContent.replace(/export const useStore = create<StoreState>\(\(set, get\) => \(\{/g, 'export const useStore = create<StoreState>((...a) => ({');
useStoreContent = useStoreContent.replace(/\(set, get\)/g, '(...a)');
fs.writeFileSync(useStoreFile, useStoreContent);

// 2. Fix constants.ts
const constantsFile = path.join(__dirname, '../src/store/slices/constants.ts');
let constantsContent = fs.readFileSync(constantsFile, 'utf8');
constantsContent = constantsContent.replace(/\(str, fallback = 0\)/g, '(str: any, fallback: number = 0)');
fs.writeFileSync(constantsFile, constantsContent);

// 3. Fix playbookSlice.ts
const playbookFile = path.join(__dirname, '../src/store/slices/playbookSlice.ts');
let playbookContent = fs.readFileSync(playbookFile, 'utf8');
playbookContent = playbookContent.replace(/export const createPlaybookSlice: StateCreator<StoreState, \[\], \[\], PlaybookSlice> = \(set, get\) => \(\{/g, 'export const createPlaybookSlice: StateCreator<StoreState, [], [], PlaybookSlice> = (set, get, api) => ({');
playbookContent = playbookContent.replace(/task\.id === taskId/g, 'String(task.id) === String(taskId)');
fs.writeFileSync(playbookFile, playbookContent);

// 4. Fix shiftSlice.ts
const shiftFile = path.join(__dirname, '../src/store/slices/shiftSlice.ts');
let shiftContent = fs.readFileSync(shiftFile, 'utf8');
shiftContent = shiftContent.replace(/export const createShiftSlice: StateCreator<StoreState, \[\], \[\], ShiftSlice> = \(set, get\) => \(\{/g, 'export const createShiftSlice: StateCreator<StoreState, [], [], ShiftSlice> = (set, get, api) => ({');
shiftContent = shiftContent.replace(/activeShift: \{/g, 'activeShift: { type: "floor_leader", manager: "",');
fs.writeFileSync(shiftFile, shiftContent);

// 5. Fix authSlice.ts
const authFile = path.join(__dirname, '../src/store/slices/authSlice.ts');
let authContent = fs.readFileSync(authFile, 'utf8');
authContent = authContent.replace(/export const createAuthSlice: StateCreator<StoreState, \[\], \[\], AuthSlice> = \(set, get\) => \(\{/g, 'export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get, api) => ({');
fs.writeFileSync(authFile, authContent);

// 6. Fix metricsSlice.ts
const metricsFile = path.join(__dirname, '../src/store/slices/metricsSlice.ts');
let metricsContent = fs.readFileSync(metricsFile, 'utf8');
metricsContent = metricsContent.replace(/export const createMetricsSlice: StateCreator<StoreState, \[\], \[\], MetricsSlice> = \(set, get\) => \(\{/g, 'export const createMetricsSlice: StateCreator<StoreState, [], [], MetricsSlice> = (set, get, api) => ({');
metricsContent = metricsContent.replace(/membershipsType: 'Hours',/g, '');
metricsContent = metricsContent.replace(/creditCardsType: 'Hours',/g, '');
metricsContent = metricsContent.replace(/\(n\) =>/g, '(n: any) =>');
metricsContent = metricsContent.replace(/let newRoster = \[\];/g, 'let newRoster: any[] = [];');
metricsContent = metricsContent.replace(/const safeHistory = \{ \.\.\.history \};/g, 'const safeHistory: any = { ...history };');
metricsContent = metricsContent.replace(/const updateData = updatedFields;/, 'const updateData: any = updatedFields;');
metricsContent = metricsContent.replace(/id: id,/, ''); // Fix TS2783 'id' is specified more than once
// Add any to implicit any elements
metricsContent = metricsContent.replace(/rosterHistory\[newPeriodName\] = \[\.\.\.\(rosterHistory\[copyOption\] \|\| \[\]\)\];/g, '(rosterHistory as any)[newPeriodName] = [...((rosterHistory as any)[copyOption] || [])];');
metricsContent = metricsContent.replace(/rosterHistory\[state\.activePeriod\]/g, '(rosterHistory as any)[state.activePeriod]');
fs.writeFileSync(metricsFile, metricsContent);

console.log('Fixed slices!');
