import React from 'react';
import { Users, Clock, Trash2, User, Wand2 } from 'lucide-react';
import { RosterMetricCell, getEmployeeGap, getMetricClass } from './RosterMetricCell';
import { StoreRosterTableRow } from './StoreRosterTableRow';
import { calculateCVI } from '../../store/cviHelper';
import { useStore } from '../../store/useStore';
import './StoreRosterTable.css';

export default function StoreRosterTable({
  filteredRoster,
  visibleCols,
  isDense,
  setSelectedProfileEmployee,
  handleStartEdit,
  DEPARTMENTS,
  onCoachEmployee,
  onCreateLog
}: any) {
  const deptGoals = useStore((state) => state.deptGoals);
  const rosterHistory = useStore((state) => state.rosterHistory);
  const activePeriod = useStore((state) => state.activePeriod);
  const onDeleteEmployee = useStore((state) => state.deleteEmployee);
  const onUpdateEmployeeDept = useStore((state) => state.updateEmployeeDept);

  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });

  const sortedRoster = React.useMemo(() => {
    let sortableItems = [...(filteredRoster || [])];
    if (sortConfig !== null && sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a?.[sortConfig.key] ?? '';
        let bVal = b?.[sortConfig.key] ?? '';
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal, undefined, { numeric: true }) 
            : bVal.localeCompare(aVal, undefined, { numeric: true });
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRoster, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc'; // Default to desc for metrics
    if (key === 'name' || key === 'dept') direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === direction) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    } else if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const headerClass = (isCenter = false) => {
    return `roster-th ${isDense ? 'roster-th-dense' : 'roster-th-standard'} ${isCenter ? 'roster-th-center' : ''}`;
  };

  const tdClass = (isCenter = false, isRight = false) => {
    return `roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} ${isCenter ? 'roster-td-center' : ''} ${isRight ? 'roster-td-right' : ''}`;
  };

  return (
    <div className="roster-table-container">
      <table className={`roster-table ${isDense ? 'roster-table-dense' : 'roster-table-standard'}`}>
        <thead>
          <tr>
            <th className={headerClass(false)} onClick={() => requestSort('name')}>Associate{getSortIcon('name')}</th>
            {visibleCols.hours && <th className={headerClass(true)} onClick={() => requestSort('hours')}><Clock size={14} className="roster-icon-inline" />Hours{getSortIcon('hours')}</th>}
            {visibleCols.dept && <th className={headerClass(false)} onClick={() => requestSort('dept')}>Dept{getSortIcon('dept')}</th>}
            {visibleCols.memberships && <th className={headerClass(true)} onClick={() => requestSort('memberships')}>PMs{getSortIcon('memberships')}</th>}
            {visibleCols.creditCards && <th className={headerClass(true)} onClick={() => requestSort('creditCards')}>Apps{getSortIcon('creditCards')}</th>}
            {visibleCols.warranty && <th className={headerClass(true)} onClick={() => requestSort('warranty')}>GSP{getSortIcon('warranty')}</th>}
            {visibleCols.surveys && <th className={headerClass(true)} onClick={() => requestSort('surveys')}>5*{getSortIcon('surveys')}</th>}
            {visibleCols.rph && <th className={headerClass(true)} onClick={() => requestSort('rph')}>RPH{getSortIcon('rph')}</th>}
            {visibleCols.basket && <th className={`${headerClass(true)} roster-th-nowrap`}>Basket ($)</th>}
            {visibleCols.attach && <th className={headerClass(true)}>Dept Attach</th>}
            {visibleCols.status && <th className={headerClass(false)}>Status</th>}
            <th className={`${headerClass(false)} roster-th-right roster-th-nowrap roster-th-actions`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoster.length === 0 ? (
            <tr>
              <td colSpan={2 + Object.values(visibleCols).filter(Boolean).length} className="roster-empty-cell">
                <Users size={32} className="roster-empty-icon" />
                <p>No associates match your active filters.</p>
              </td>
            </tr>
          ) : (
            sortedRoster.map(emp => (
              <StoreRosterTableRow
                key={emp.id || emp.name}
                emp={emp}
                visibleCols={visibleCols}
                isDense={isDense}
                deptGoals={deptGoals}
                rosterHistory={rosterHistory}
                activePeriod={activePeriod}
                setSelectedProfileEmployee={setSelectedProfileEmployee}
                handleStartEdit={handleStartEdit}
                onDeleteEmployee={onDeleteEmployee}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
