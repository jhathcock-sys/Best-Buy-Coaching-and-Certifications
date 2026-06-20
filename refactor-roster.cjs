const fs = require('fs');
let code = fs.readFileSync('src/components/StoreRoster.tsx', 'utf8');

// 1. Add imports
code = code.replace(/import RentsDueAuditor from '\.\/RentsDueAuditor';/, 
`import RentsDueAuditor from './RentsDueAuditor';
import StoreRosterHeader from './StoreRoster/StoreRosterHeader';
import StoreRosterTable from './StoreRoster/StoreRosterTable';
import StoreRosterMobileCard from './StoreRoster/StoreRosterMobileCard';`);

// 2. Remove all utility functions (getMetricClass, getPaceText, renderMetricCell, renderMobileMetricBadge, getStatusBadge, getEmployeeGap)
const startIndex = code.indexOf('  // Audits employee metrics');
const endIndex = code.indexOf('  const filteredRoster');

if (startIndex > -1 && endIndex > -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// 3. Replace JSX structure
const headerStartIndex = code.indexOf('{/* Header */}');
const mobileEndIndex = code.indexOf('          {/* Employee Edit Modal */}');

if (headerStartIndex > -1 && mobileEndIndex > -1) {
  const replacement = `
      <StoreRosterHeader 
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
      />

`;
  
  // Find the closing div of the main container which is before Employee Edit Modal
  const contentBeforeHeader = code.substring(0, headerStartIndex);
  // Wait, the header is preceded by <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
  code = contentBeforeHeader + replacement + code.substring(mobileEndIndex);
}

fs.writeFileSync('src/components/StoreRoster.tsx', code);
console.log('Refactoring complete!');
