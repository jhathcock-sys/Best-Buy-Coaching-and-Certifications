const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Fix implicit arrow functions without parentheses
content = content.replace(/emp =>/g, '(emp: any) =>');
content = content.replace(/log =>/g, '(log: any) =>');
content = content.replace(/shift =>/g, '(shift: any) =>');
content = content.replace(/t =>/g, '(t: any) =>');
content = content.replace(/s =>/g, '(s: any) =>');
content = content.replace(/a =>/g, '(a: any) =>');
content = content.replace(/b =>/g, '(b: any) =>');
content = content.replace(/e =>/g, '(e: any) =>');

// Fix implicitly any arrays
content = content.replace(/const list = \[\];/g, 'const list: any[] = [];');
content = content.replace(/const alerts = \[\];/g, 'const alerts: any[] = [];');

// Cast specific variables to any where TypeScript complains about missing properties from our generic Employee type
// Instead of replacing every property, we can just replace the use of the variable in the specific lines throwing errors
content = content.replace(/parseFloat\(a\[rankMetric\]\)/g, 'parseFloat((a as any)[rankMetric])');
content = content.replace(/parseFloat\(b\[rankMetric\]\)/g, 'parseFloat((b as any)[rankMetric])');
content = content.replace(/const leader = shift\.leaderName/g, 'const leader = (shift as any).leaderName');
content = content.replace(/shift\.hours \?/g, '(shift as any).hours ?');
content = content.replace(/shift\.hours\.length/g, '(shift as any).hours.length');
content = content.replace(/shift\.totalPms/g, '(shift as any).totalPms');
content = content.replace(/shift\.totalApps/g, '(shift as any).totalApps');
content = content.replace(/shift\.totalRevenue/g, '(shift as any).totalRevenue');
content = content.replace(/emp\.dept/g, '(emp as any).dept');
content = content.replace(/emp\.hours/g, '(emp as any).hours');
content = content.replace(/emp\.memberships/g, '(emp as any).memberships');
content = content.replace(/emp\.creditCards/g, '(emp as any).creditCards');
content = content.replace(/emp\.warranty/g, '(emp as any).warranty');
content = content.replace(/emp\.surveys/g, '(emp as any).surveys');
content = content.replace(/emp\.basket/g, '(emp as any).basket');
content = content.replace(/emp\.m365/g, '(emp as any).m365');
content = content.replace(/emp\.audio/g, '(emp as any).audio');
content = content.replace(/emp\.rph/g, '(emp as any).rph');
content = content.replace(/emp\.focus5/g, '(emp as any).focus5');

// Fix implicitly any parameter in session map
content = content.replace(/\(session, index\) =>/g, '(session: any, index: number) =>');

fs.writeFileSync(dashPath, content);
console.log('Fixed implicit any parameters');
