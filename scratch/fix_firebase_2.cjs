const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix getStoreDocRef return type
content = content.replace(/getStoreDocRef = \(subpath: string\)/g, 'getStoreDocRef = (subpath: string): any');

// Add more any to remaining un-typed variables
content = content.replace(/subscribeToMetrics = \(onUpdate\)/g, 'subscribeToMetrics = (onUpdate: any)');
content = content.replace(/let tasks = \[\];/g, 'let tasks: any[] = [];');
content = content.replace(/let shifts = \[\];/g, 'let shifts: any[] = [];');
content = content.replace(/let logs = \[\];/g, 'let logs: any[] = [];');
content = content.replace(/periods\[doc\.id\] = doc\.data\(\)\.roster \|\| \[\];/g, 'periods[doc.id as keyof typeof periods] = doc.data().roster || [];');
content = content.replace(/snapshots\[doc\.id\] = doc\.data\(\)\.metrics \|\| \[\];/g, 'snapshots[doc.id as keyof typeof snapshots] = doc.data().metrics || [];');

fs.writeFileSync(file, content);
console.log('Fixed remaining TS errors in firebase.ts');
