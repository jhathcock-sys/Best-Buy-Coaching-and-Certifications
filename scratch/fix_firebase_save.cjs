const fs = require('fs');
const path = require('path');

const fbPath = path.join(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(fbPath, 'utf8');

// The functions that are failing to compile due to missing storeId in their signature
content = content.replace(/export const saveActivePeriodToCloud = async \(activePeriod: string\) => \{/g, 'export const saveActivePeriodToCloud = async (storeId: string, activePeriod: string) => {');
content = content.replace(/export const saveDailySnapshotToCloud = async \(dateKey: string, metrics: any\) => \{/g, 'export const saveDailySnapshotToCloud = async (storeId: string, dateKey: string, metrics: any) => {');
content = content.replace(/export const saveRosterHistoryToCloud = async \(roster: any, periodId: string\) => \{/g, 'export const saveRosterHistoryToCloud = async (storeId: string, roster: any, periodId: string) => {');
content = content.replace(/export const savePlaybookSettingsToCloud = async \(settings: any\) => \{/g, 'export const savePlaybookSettingsToCloud = async (storeId: string, settings: any) => {');
content = content.replace(/export const saveManagersToCloud = async \(managers: any\) => \{/g, 'export const saveManagersToCloud = async (storeId: string, managers: any) => {');
content = content.replace(/export const saveDeptGoalsToCloud = async \(goals: any\) => \{/g, 'export const saveDeptGoalsToCloud = async (storeId: string, goals: any) => {');
content = content.replace(/export const saveRecentSessionsToCloud = async \(sessions: any\) => \{/g, 'export const saveRecentSessionsToCloud = async (storeId: string, sessions: any) => {');

// Fix calls inside pushOfflineDataToCloud that were failing:
// The getStoreDocRef signature is getStoreDocRef(storeId: string, subpath: string)
content = content.replace(/getStoreDocRef\(storeId, 'activePeriod'\)/g, "getStoreDocRef(storeId, 'activePeriod')");

fs.writeFileSync(fbPath, content);
console.log('Fixed firebase save functions');
