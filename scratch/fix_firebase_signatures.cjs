const fs = require('fs');
const path = require('path');

const fbPath = path.join(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(fbPath, 'utf8');

// The first script didn't catch all the 'export const subscribeTo... = (onUpdate: any) => {'
// Let's replace them properly.

content = content.replace(/export const subscribeToActivePeriod = \(onUpdate: any\) => \{/g, 'export const subscribeToActivePeriod = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToRosterHistory = \(onUpdate: any\) => \{/g, 'export const subscribeToRosterHistory = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToPlaybookSettings = \(onUpdate: any\) => \{/g, 'export const subscribeToPlaybookSettings = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToManagers = \(onUpdate: any\) => \{/g, 'export const subscribeToManagers = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToDeptGoals = \(onUpdate: any\) => \{/g, 'export const subscribeToDeptGoals = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToDailySnapshots = \(onUpdate: any\) => \{/g, 'export const subscribeToDailySnapshots = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToRecentSessions = \(onUpdate: any\) => \{/g, 'export const subscribeToRecentSessions = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToMetrics = \(onUpdate: any\) => \{/g, 'export const subscribeToMetrics = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToFollowUpTasks = \(onUpdate: any\) => \{/g, 'export const subscribeToFollowUpTasks = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToFloorLeaderShifts = \(onUpdate: any\) => \{/g, 'export const subscribeToFloorLeaderShifts = (storeId: string, onUpdate: any) => {');
content = content.replace(/export const subscribeToCoachingLogs = \(onUpdate: any\) => \{/g, 'export const subscribeToCoachingLogs = (storeId: string, onUpdate: any) => {');

// Fix the getStoreDocRef signature
content = content.replace(/const getStoreDocRef = \(subpath: string\): any => \{/g, 'const getStoreDocRef = (storeId: string, subpath: string): any => {');

fs.writeFileSync(fbPath, content);
console.log('Fixed firebase signatures');
