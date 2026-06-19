const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

content = content.replace(/counts\[dept\]\+\+;/g, '(counts as any)[dept]++;');
content = content.replace(/counts\[histEmp\.dept\]\+\+;/g, '(counts as any)[histEmp.dept]++;');

content = content.replace(/const pastEmp = \(comparisonSnap as unknown as any\[\]\)\.find/g, 'const pastEmp = (comparisonSnap as any).find');
content = content.replace(/const pastEmp = comparisonSnap\.find/g, 'const pastEmp = (comparisonSnap as any).find');

content = content.replace(/roster\.filter\(\(emp\) =>/g, 'roster.filter((emp: any) =>');
content = content.replace(/roster\.filter\(emp =>/g, 'roster.filter((emp: any) =>');

content = content.replace(/followUpTasks=\{pendingTasks\}/g, 'followUpTasks={pendingTasks || []}');

content = content.replace(/recentSessions\.slice\(/g, '(recentSessions || []).slice(');

fs.writeFileSync(dashPath, content);
console.log('Fixed final final errors');
