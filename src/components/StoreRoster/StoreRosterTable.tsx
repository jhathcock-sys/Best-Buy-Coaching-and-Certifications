import React from 'react';
import { Users, Clock } from 'lucide-react';
import { StoreRosterTableRow } from './StoreRosterTableRow';
import { useStore } from '../../store/useStore';
import { Employee } from '../../types';
import './StoreRosterTable.css';

interface StoreRosterTableProps {
  filteredRoster: Employee[];
  visibleCols: {
    hours: boolean;
    dept: boolean;
    memberships: boolean;
    creditCards: boolean;
    warranty: boolean;
    surveys: boolean;
    rph: boolean;
    basket: boolean;
    attach: boolean;
    status: boolean;
  };
  isDense: boolean;
  setSelectedProfileEmployee: (emp: Employee) => void;
  handleStartEdit: (emp: Employee, dept: string) => void;
}

export default function StoreRosterTable({
  filteredRoster = [],
  visibleCols = { hours: true, dept: true, memberships: true, creditCards: true, warranty: true, surveys: true, rph: true, basket: true, attach: true, status: true },
  isDense,
  setSelectedProfileEmployee,
  handleStartEdit
}: StoreRosterTableProps) {
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Employee | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

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

  const requestSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'desc'; // Default to desc for metrics
    if (key === 'name' || key === 'dept') direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === direction) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    } else if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Employee) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const headerClass = (isCenter = false) => {
    return `roster-th ${isDense ? 'roster-th-dense' : 'roster-th-standard'} ${isCenter ? 'roster-th-center' : ''} cursor-pointer hover:bg-white-alpha-05 transition-colors`;
  };

  return (
    <div className="roster-table-container" data-testid="store-roster-table">
      <table className={`roster-table ${isDense ? 'roster-table-dense' : 'roster-table-standard'}`}>
        <thead>
          <tr>
            <th className={headerClass(false)} onClick={() => requestSort('name')} data-testid="th-sort-name">Associate{getSortIcon('name')}</th>
            {visibleCols.hours && <th className={headerClass(true)} onClick={() => requestSort('hours')} data-testid="th-sort-hours"><Clock size={14} className="roster-icon-inline" />Hours{getSortIcon('hours')}</th>}
            {visibleCols.dept && <th className={headerClass(false)} onClick={() => requestSort('dept')} data-testid="th-sort-dept">Dept{getSortIcon('dept')}</th>}
            {visibleCols.memberships && <th className={headerClass(true)} onClick={() => requestSort('memberships')} data-testid="th-sort-memberships">PMs{getSortIcon('memberships')}</th>}
            {visibleCols.creditCards && <th className={headerClass(true)} onClick={() => requestSort('creditCards')} data-testid="th-sort-creditCards">Apps{getSortIcon('creditCards')}</th>}
            {visibleCols.warranty && <th className={headerClass(true)} onClick={() => requestSort('warranty')} data-testid="th-sort-warranty">GSP{getSortIcon('warranty')}</th>}
            {visibleCols.surveys && <th className={headerClass(true)} onClick={() => requestSort('surveys')} data-testid="th-sort-surveys">5*{getSortIcon('surveys')}</th>}
            {visibleCols.rph && <th className={headerClass(true)} onClick={() => requestSort('rph')} data-testid="th-sort-rph">RPH{getSortIcon('rph')}</th>}
            {visibleCols.basket && <th className={`${headerClass(true)} roster-th-nowrap`}>Basket ($)</th>}
            {visibleCols.attach && <th className={headerClass(true)}>Dept Attach</th>}
            {visibleCols.status && <th className={headerClass(false)}>Status</th>}
            <th className={`${headerClass(false)} roster-th-right roster-th-nowrap roster-th-actions`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoster?.length === 0 ? (
            <tr>
              <td colSpan={2 + Object.values(visibleCols || {}).filter(Boolean).length} className="roster-empty-cell" data-testid="roster-table-empty-state">
                <Users size={32} className="roster-empty-icon" />
                <p>No associates match your active filters.</p>
              </td>
            </tr>
          ) : (
            sortedRoster.map((emp) => (
              <StoreRosterTableRow
                key={emp.id || emp.name}
                emp={emp}
                visibleCols={visibleCols}
                isDense={isDense}
                setSelectedProfileEmployee={setSelectedProfileEmployee}
                handleStartEdit={handleStartEdit}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
