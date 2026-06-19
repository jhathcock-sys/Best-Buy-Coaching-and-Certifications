const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Update <Login> component
content = content.replace(/<Login \s*correctPin=\{storePin\}\s*onLoginSuccess=\{\(enteredPin\) => login\(enteredPin\)\}/, '<Login \n        correctPin={storePin}\n        onLoginSuccess={(enteredPin, storeId) => login(enteredPin, storeId)}');

// We need to fetch storeId from useStore in App.tsx
// Find where useStore hooks are called:
// const { activeView, setActiveView, dbConnected, isAuthenticated, storePin, login, managers } = useStore();
content = content.replace(/const \{ activeView, setActiveView, dbConnected, isAuthenticated, storePin, login, managers \} = useStore\(\);/, 'const { activeView, setActiveView, dbConnected, isAuthenticated, storePin, login, managers, storeId } = useStore();');

// Update the useEffect for Firebase subscriptions
// From: useEffect(() => { if (!dbConnected) return;
// To: useEffect(() => { if (!dbConnected || !isAuthenticated || !storeId) return;
content = content.replace(/useEffect\(\(\) => \{\r?\n\s*if \(\!dbConnected\) return;/, 'useEffect(() => {\n    if (!dbConnected || !isAuthenticated || !storeId) return;');

// Update the dependency array for that useEffect
// From:   }, [dbConnected]);
// To:   }, [dbConnected, isAuthenticated, storeId]);
content = content.replace(/\}, \[dbConnected\]\);/g, '}, [dbConnected, isAuthenticated, storeId]);');

// Update all subscribe calls to include storeId
content = content.replace(/subscribeToActivePeriod\(/g, 'subscribeToActivePeriod(storeId, ');
content = content.replace(/subscribeToRosterHistory\(/g, 'subscribeToRosterHistory(storeId, ');
content = content.replace(/subscribeToPlaybookSettings\(/g, 'subscribeToPlaybookSettings(storeId, ');
content = content.replace(/subscribeToDeptGoals\(/g, 'subscribeToDeptGoals(storeId, ');
content = content.replace(/subscribeToRecentSessions\(/g, 'subscribeToRecentSessions(storeId, ');
content = content.replace(/subscribeToMetrics\(/g, 'subscribeToMetrics(storeId, ');
content = content.replace(/subscribeToFollowUpTasks\(/g, 'subscribeToFollowUpTasks(storeId, ');
content = content.replace(/subscribeToFloorLeaderShifts\(/g, 'subscribeToFloorLeaderShifts(storeId, ');
content = content.replace(/subscribeToCoachingLogs\(/g, 'subscribeToCoachingLogs(storeId, ');
content = content.replace(/subscribeToManagers\(/g, 'subscribeToManagers(storeId, ');
content = content.replace(/subscribeToDailySnapshots\(/g, 'subscribeToDailySnapshots(storeId, ');

// Update pushOfflineDataToCloud
content = content.replace(/await pushOfflineDataToCloud\(\{/g, 'await pushOfflineDataToCloud(storeId, {');

fs.writeFileSync(appPath, content);
console.log('App.tsx updated for Multi-Tenancy');
