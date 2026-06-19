const fs = require('fs');
const path = require('path');

const fbPath = path.join(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(fbPath, 'utf8');

// The file was mangled. Let's do a clean regex replacement for any missing storeId arguments.

// Fix calls inside pushOfflineDataToCloud:
// e.g. await saveActivePeriodToCloud(activePeriod); -> await saveActivePeriodToCloud(storeId, activePeriod);
content = content.replace(/await saveActivePeriodToCloud\(activePeriod\)/g, 'await saveActivePeriodToCloud(storeId, activePeriod)');
content = content.replace(/await saveRosterHistoryToCloud\(rosterHistory\[periodId\], periodId\)/g, 'await saveRosterHistoryToCloud(storeId, rosterHistory[periodId], periodId)');
content = content.replace(/await savePlaybookSettingsToCloud\(playbookSettings\)/g, 'await savePlaybookSettingsToCloud(storeId, playbookSettings)');
content = content.replace(/await saveManagersToCloud\(managers\)/g, 'await saveManagersToCloud(storeId, managers)');
content = content.replace(/await saveDeptGoalsToCloud\(deptGoals\)/g, 'await saveDeptGoalsToCloud(storeId, deptGoals)');
content = content.replace(/await saveRecentSessionsToCloud\(recentSessions\)/g, 'await saveRecentSessionsToCloud(storeId, recentSessions)');
content = content.replace(/await saveMetricsToCloud\(metrics\)/g, 'await saveMetricsToCloud(storeId, metrics)');
content = content.replace(/await saveFollowUpTaskToCloud\(t\)/g, 'await saveFollowUpTaskToCloud(storeId, t)');
content = content.replace(/await saveFloorLeaderShiftToCloud\(s\)/g, 'await saveFloorLeaderShiftToCloud(storeId, s)');
content = content.replace(/await saveCoachingLogToCloud\(log\)/g, 'await saveCoachingLogToCloud(storeId, log)');

// Fix saveCoachingLogToCloud signature
content = content.replace(/export const saveCoachingLogToCloud = async \(log: any\) => \{/, 'export const saveCoachingLogToCloud = async (storeId: string, log: any) => {');

// Fix testLatency signature
content = content.replace(/export const testLatency = async \(\) => \{/, 'export const testLatency = async (storeId: string) => {');

// Fix getStoreDocRef inside functions that have storeId
content = content.replace(/getStoreDocRef\(storeId, 'activePeriod'\)/g, "getStoreDocRef(storeId, 'activePeriod')");

fs.writeFileSync(fbPath, content);
console.log('Fixed firebase.ts arguments');
