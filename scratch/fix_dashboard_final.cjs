const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Fix implicitly any parameters
content = content.replace(/\(empId\) =>/g, '(empId: any) =>');
content = content.replace(/\(metricKey, label\) =>/g, '(metricKey: any, label: any) =>');

// Fix 'activePeriod' is possibly 'undefined'
content = content.replace(/!activePeriod/g, '!activePeriod'); // keep
content = content.replace(/activePeriod\.split/g, '(activePeriod || "").split');
content = content.replace(/activePeriod,$/m, 'activePeriod || "",');

// Fix 'recentSessions' is possibly 'undefined'
content = content.replace(/recentSessions\.slice/g, '(recentSessions || []).slice');
content = content.replace(/recentSessions\.length/g, '(recentSessions || []).length');

// Fix left-hand side of arithmetic operation (Dates)
content = content.replace(/b\.timestamp - a\.timestamp/g, '(b.timestamp || 0) - (a.timestamp || 0)');
content = content.replace(/new Date\(b\) - new Date\(a\)/g, '(new Date(b) as any) - (new Date(a) as any)');
content = content.replace(/today - d/g, '(today as any) - (d as any)');

// Fix emp.name does not exist on type string
content = content.replace(/emp === activeManager\.name/g, '(emp as any).name === activeManager');
content = content.replace(/emp\.name === activeManager/g, '(emp as any).name === activeManager');

// Fix 'any[] | undefined' is not assignable to type 'any[]'
content = content.replace(/pendingTasks=/g, 'pendingTasks={pendingTasks || []}');

fs.writeFileSync(dashPath, content);
console.log('Fixed remaining Dashboard types');
