const fs = require('fs');
const path = require('path');

const fbPath = path.join(__dirname, '../src/services/firebase.ts');
let fbContent = fs.readFileSync(fbPath, 'utf8');

// The strategy is to update the function signatures to accept storeId as the first parameter.
// Example: export const subscribeToActivePeriod = (callback: (period: string) => void) => {
// Becomes: export const subscribeToActivePeriod = (storeId: string, callback: (period: string) => void) => {

// 1. Helper function
fbContent = fbContent.replace(/export const getStoreDocRef = \(subpath: string\) => \{/, 'export const getStoreDocRef = (storeId: string, subpath: string) => {');
fbContent = fbContent.replace(/return doc\(db, 'stores', 'store-1', 'data', subpath\);/, "return doc(db, 'stores', storeId, 'data', subpath);");

// 2. Subscriptions
fbContent = fbContent.replace(/export const subscribeToActivePeriod = \(callback: \(period: string\) => void\) => \{/, 'export const subscribeToActivePeriod = (storeId: string, callback: (period: string) => void) => {');
fbContent = fbContent.replace(/export const subscribeToRosterHistory = \(callback: \(history: Record<string, Employee\[\]>\) => void\) => \{/, 'export const subscribeToRosterHistory = (storeId: string, callback: (history: Record<string, Employee[]>) => void) => {');
fbContent = fbContent.replace(/export const subscribeToPlaybookSettings = \(callback: \(settings: PlaybookSettings\) => void\) => \{/, 'export const subscribeToPlaybookSettings = (storeId: string, callback: (settings: PlaybookSettings) => void) => {');
fbContent = fbContent.replace(/export const subscribeToDeptGoals = \(callback: \(goals: Record<string, DeptGoal>\) => void\) => \{/, 'export const subscribeToDeptGoals = (storeId: string, callback: (goals: Record<string, DeptGoal>) => void) => {');
fbContent = fbContent.replace(/export const subscribeToRecentSessions = \(callback: \(sessions: any\[\]\) => void\) => \{/, 'export const subscribeToRecentSessions = (storeId: string, callback: (sessions: any[]) => void) => {');
fbContent = fbContent.replace(/export const subscribeToMetrics = \(callback: \(metrics: any\) => void\) => \{/, 'export const subscribeToMetrics = (storeId: string, callback: (metrics: any) => void) => {');

// 3. Collection subscriptions
fbContent = fbContent.replace(/export const subscribeToFollowUpTasks = \(callback: \(tasks: any\[\]\) => void\) => \{/, 'export const subscribeToFollowUpTasks = (storeId: string, callback: (tasks: any[]) => void) => {');
fbContent = fbContent.replace(/export const subscribeToFloorLeaderShifts = \(callback: \(shifts: any\[\]\) => void\) => \{/, 'export const subscribeToFloorLeaderShifts = (storeId: string, callback: (shifts: any[]) => void) => {');
fbContent = fbContent.replace(/export const subscribeToCoachingLogs = \(callback: \(logs: CoachingLog\[\]\) => void\) => \{/, 'export const subscribeToCoachingLogs = (storeId: string, callback: (logs: CoachingLog[]) => void) => {');
fbContent = fbContent.replace(/export const subscribeToManagers = \(callback: \(managers: Manager\[\]\) => void\) => \{/, 'export const subscribeToManagers = (storeId: string, callback: (managers: Manager[]) => void) => {');
fbContent = fbContent.replace(/export const subscribeToDailySnapshots = \(callback: \(snapshots: any\[\]\) => void\) => \{/, 'export const subscribeToDailySnapshots = (storeId: string, callback: (snapshots: any[]) => void) => {');

// 4. Save functions
fbContent = fbContent.replace(/export const pushOfflineDataToCloud = async \(offlineData: any\) => \{/, 'export const pushOfflineDataToCloud = async (storeId: string, offlineData: any) => {');
fbContent = fbContent.replace(/export const saveActivePeriodToCloud = async \(period: string\) => \{/, 'export const saveActivePeriodToCloud = async (storeId: string, period: string) => {');
fbContent = fbContent.replace(/export const saveRosterHistoryToCloud = async \(history: Record<string, Employee\[\]>\) => \{/, 'export const saveRosterHistoryToCloud = async (storeId: string, history: Record<string, Employee[]>) => {');
fbContent = fbContent.replace(/export const savePlaybookSettingsToCloud = async \(settings: PlaybookSettings\) => \{/, 'export const savePlaybookSettingsToCloud = async (storeId: string, settings: PlaybookSettings) => {');
fbContent = fbContent.replace(/export const saveDeptGoalsToCloud = async \(goals: Record<string, DeptGoal>\) => \{/, 'export const saveDeptGoalsToCloud = async (storeId: string, goals: Record<string, DeptGoal>) => {');
fbContent = fbContent.replace(/export const saveMetricsToCloud = async \(metrics: any\) => \{/, 'export const saveMetricsToCloud = async (storeId: string, metrics: any) => {');
fbContent = fbContent.replace(/export const saveFollowUpTaskToCloud = async \(task: any\) => \{/, 'export const saveFollowUpTaskToCloud = async (storeId: string, task: any) => {');
fbContent = fbContent.replace(/export const deleteFollowUpTaskFromCloud = async \(taskId: string\) => \{/, 'export const deleteFollowUpTaskFromCloud = async (storeId: string, taskId: string) => {');
fbContent = fbContent.replace(/export const saveFloorLeaderShiftToCloud = async \(shift: any\) => \{/, 'export const saveFloorLeaderShiftToCloud = async (storeId: string, shift: any) => {');
fbContent = fbContent.replace(/export const deleteFloorLeaderShiftFromCloud = async \(shiftId: string\) => \{/, 'export const deleteFloorLeaderShiftFromCloud = async (storeId: string, shiftId: string) => {');
fbContent = fbContent.replace(/export const deletePeriodArchiveFromCloud = async \(periodId: string\) => \{/, 'export const deletePeriodArchiveFromCloud = async (storeId: string, periodId: string) => {');
fbContent = fbContent.replace(/export const saveCoachingLogToCloud = async \(log: CoachingLog\) => \{/, 'export const saveCoachingLogToCloud = async (storeId: string, log: CoachingLog) => {');
fbContent = fbContent.replace(/export const deleteCoachingLogFromCloud = async \(logId: string\) => \{/, 'export const deleteCoachingLogFromCloud = async (storeId: string, logId: string) => {');
fbContent = fbContent.replace(/export const saveManagersToCloud = async \(managers: Manager\[\]\) => \{/, 'export const saveManagersToCloud = async (storeId: string, managers: Manager[]) => {');
fbContent = fbContent.replace(/export const saveDailySnapshotToCloud = async \(snapshot: any\) => \{/, 'export const saveDailySnapshotToCloud = async (storeId: string, snapshot: any) => {');

// Replace all hardcoded 'store-1' strings inside the functions with storeId variable
fbContent = fbContent.replace(/'store-1'/g, 'storeId');
// But getStoreDocRef used getStoreDocRef(storeId, 'rosterHistory'), so the docRef calls in the first section need storeId.
fbContent = fbContent.replace(/getStoreDocRef\(/g, 'getStoreDocRef(storeId, ');

fs.writeFileSync(fbPath, fbContent);
console.log('Updated firebase.ts for multi-tenancy');
