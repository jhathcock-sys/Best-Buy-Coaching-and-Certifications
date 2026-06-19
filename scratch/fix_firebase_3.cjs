const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix snap parameter in onSnapshot callbacks
content = content.replace(/\(snap\)/g, '(snap: any)');

// Fix empty array assignments
content = content.replace(/let tasks = \[\];/g, 'let tasks: any[] = [];');
content = content.replace(/let shifts = \[\];/g, 'let shifts: any[] = [];');
content = content.replace(/let logs = \[\];/g, 'let logs: any[] = [];');

// Fix periods and snapshots key assignment
content = content.replace(/periods\[doc\.id\] = doc\.data\(\)\.roster \|\| \[\];/g, 'periods[doc.id as any] = doc.data().roster || [];');
content = content.replace(/snapshots\[doc\.id\] = doc\.data\(\)\.metrics \|\| \[\];/g, 'snapshots[doc.id as any] = doc.data().metrics || [];');

// Fix other typed params
content = content.replace(/saveDailySnapshotToCloud = async \(dateKey, metrics\)/g, 'saveDailySnapshotToCloud = async (dateKey: string, metrics: any)');
content = content.replace(/pushOfflineDataToCloud = async \(offlineData\)/g, 'pushOfflineDataToCloud = async (offlineData: any)');

fs.writeFileSync(file, content);
console.log('Fixed remaining snap and array TS errors in firebase.ts');
