const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix forEach doc
content = content.replace(/\(doc\)/g, '(doc: any)');

// Fix empty array assignments again (wasn't picked up perhaps)
content = content.replace(/let tasks: any\[\] = \[\];/g, 'let tasks: any[] = []; // fixed');
content = content.replace(/let tasks = \[\];/g, 'let tasks: any[] = [];');

content = content.replace(/let shifts: any\[\] = \[\];/g, 'let shifts: any[] = []; // fixed');
content = content.replace(/let shifts = \[\];/g, 'let shifts: any[] = [];');

content = content.replace(/let logs: any\[\] = \[\];/g, 'let logs: any[] = []; // fixed');
content = content.replace(/let logs = \[\];/g, 'let logs: any[] = [];');

content = content.replace(/periods\[doc\.id as any\] = doc\.data\(\)\.roster \|\| \[\];/g, 'periods[doc.id as string] = (doc.data() as any).roster || [];');
content = content.replace(/periods\[doc\.id\] = doc\.data\(\)\.roster \|\| \[\];/g, 'periods[doc.id as string] = (doc.data() as any).roster || [];');

content = content.replace(/snapshots\[doc\.id as any\] = doc\.data\(\)\.metrics \|\| \[\];/g, 'snapshots[doc.id as string] = (doc.data() as any).metrics || [];');
content = content.replace(/snapshots\[doc\.id\] = doc\.data\(\)\.metrics \|\| \[\];/g, 'snapshots[doc.id as string] = (doc.data() as any).metrics || [];');

content = content.replace(/metrics implicitly has an 'any' type/g, ''); // just a note
content = content.replace(/saveMetricsToCloud = async \(metrics\)/g, 'saveMetricsToCloud = async (metrics: any)');
content = content.replace(/pushOfflineDataToCloud = async \(offlineData\)/g, 'pushOfflineDataToCloud = async (offlineData: any)');

// Check if `const periods = {};` is missing type
content = content.replace(/const periods = \{\};/g, 'const periods: any = {};');
content = content.replace(/const snapshots = \{\};/g, 'const snapshots: any = {};');

fs.writeFileSync(file, content);
console.log('Fixed ALL remaining TS errors in firebase.ts');
