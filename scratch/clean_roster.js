const fs = require('fs');
let code = fs.readFileSync('src/components/StoreRoster.tsx', 'utf8');
const lines = code.split('\n');

const start = lines.findIndex(l => l.includes('{/* Header */}'));
const end = lines.findIndex(l => l.includes('<AssociateProfileModal'));

if (start > -1 && end > -1) {
  const replacement = `      <StoreRosterHeader 
        DEPARTMENTS={DEPARTMENTS}
        activeDept={activeDept}
        setActiveDept={setActiveDept}
        tempSearch={tempSearch}
        setTempSearch={setTempSearch}
        showNewPeriodForm={showNewPeriodForm}
        setShowNewPeriodForm={setShowNewPeriodForm}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        showImporter={showImporter}
        setShowImporter={setShowImporter}
        showViewSettings={showViewSettings}
        setShowViewSettings={setShowViewSettings}
      />

      <StoreRosterTable 
        filteredRoster={filteredRoster}
        visibleCols={visibleCols}
        isDense={isDense}
        deptGoals={deptGoals}
        rosterHistory={rosterHistory}
        activePeriod={activePeriod}
        setSelectedProfileEmployee={setSelectedProfileEmployee}
        handleStartEdit={handleStartEdit}
      />

      <StoreRosterMobileCard 
        filteredRoster={filteredRoster}
        deptGoals={deptGoals}
        rosterHistory={rosterHistory}
        activePeriod={activePeriod}
        DEPARTMENTS={DEPARTMENTS}
        onUpdateEmployeeDept={onUpdateEmployeeDept}
        handleStartEdit={handleStartEdit}
        onCoachEmployee={onCoachEmployee}
        onCreateLog={onCreateLog}
        onDeleteEmployee={onDeleteEmployee}
      />`;
  
  const newLines = [
    ...lines.slice(0, start),
    replacement,
    ...lines.slice(end)
  ];
  
  code = newLines.join('\\n');
  
  // Add imports if they don't exist
  if (!code.includes('StoreRosterHeader')) {
    code = code.replace(/import RentsDueAuditor from '\.\/RentsDueAuditor';/, 
\import RentsDueAuditor from './RentsDueAuditor';
import StoreRosterHeader from './StoreRoster/StoreRosterHeader';
import StoreRosterTable from './StoreRoster/StoreRosterTable';
import StoreRosterMobileCard from './StoreRoster/StoreRosterMobileCard';\);
  }
  
  fs.writeFileSync('src/components/StoreRoster.tsx', code);
  console.log('StoreRoster clean complete!');
} else {
  console.log('Markers not found', start, end);
}
