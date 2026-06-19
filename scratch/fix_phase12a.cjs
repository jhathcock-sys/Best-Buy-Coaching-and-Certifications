const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../src/types/store.ts');
let storeContent = fs.readFileSync(storePath, 'utf8');

// Replace duplicate activeAdvisor and loginAdvisor
storeContent = storeContent.replace(/  activeAdvisor: any;\n  loginAdvisor: \(advisor: any\) => void;\n/g, '');
fs.writeFileSync(storePath, storeContent);

const advDashPath = path.join(__dirname, '../src/components/AdvisorDashboard.tsx');
let advContent = fs.readFileSync(advDashPath, 'utf8');

// The employee has metrics right on them (employee.metrics) or we just map it.
// Wait, an employee in the roster has: employee.hours, employee.memberships, employee.creditCards, employee.warranty, employee.surveys, employee.rph, employee.basket...
const replacement = `        <MetricCards 
          calculatedMetrics={{
            memberships: employee.memberships || 0,
            creditCards: employee.creditCards || 0,
            warranty: employee.warranty || 0,
            surveys: employee.surveys || 0,
            rph: employee.rph || 0,
            basket: employee.basket || 0,
            m365: employee.m365 || 0,
            audio: employee.audio || 0,
            focus5: employee.focus5 || 0,
            hours: employee.hours || 0,
            employeesWithMemberships: employee.memberships > 0 ? 1 : 0,
            employeesWithCreditCards: employee.creditCards > 0 ? 1 : 0
          }}
          recentSessions={myLogs} 
        />`;

advContent = advContent.replace(/<MetricCards[\s\S]*?isDense=\{false\}[\s\S]*?\/>/, replacement);
fs.writeFileSync(advDashPath, advContent);
console.log("Fixed store and AdvisorDashboard");
