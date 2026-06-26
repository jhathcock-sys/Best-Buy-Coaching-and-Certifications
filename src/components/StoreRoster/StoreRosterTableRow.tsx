import React from 'react';
import { User, Wand2, Trash2 } from 'lucide-react';
import { RosterMetricCell } from './RosterMetricCell';
import { getEmployeeGap } from '../../utils/rosterUtils';
import { calculateCVI } from '../../store/cviHelper';
import { useStore } from '../../store/useStore';
import { Employee } from '../../types';

interface StoreRosterTableRowProps {
  emp: Employee;
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

export const StoreRosterTableRow = React.memo(({
  emp,
  visibleCols,
  isDense,
  setSelectedProfileEmployee,
  handleStartEdit
}: StoreRosterTableRowProps) => {
  const deptGoals = useStore((state) => state.deptGoals);
  const rosterHistory = useStore((state) => state.rosterHistory);
  const activePeriod = useStore((state) => state.activePeriod);
  const deleteEmployee = useStore((state) => state.deleteEmployee);

  if (!emp) return null;
  const gap = getEmployeeGap(emp, deptGoals) || 'None';
  const isExceeding = gap === 'None' || gap === '';
  
  const { badgeClass, cviIcon, cviDisplay } = React.useMemo(() => {
    const cvi = calculateCVI(emp, rosterHistory, activePeriod) || '';
    let bClass = 'cvi-badge-default';
    let icon = '?';
    if (cvi.includes('Accelerating')) {
      bClass = 'cvi-badge-accelerating';
      icon = '?';
    } else if (cvi.includes('Needs Review')) {
      bClass = 'cvi-badge-review';
      icon = '?';
    } else if (cvi.includes('Neutral')) {
      bClass = 'cvi-badge-neutral';
      icon = '?';
    }
    return {
      badgeClass: bClass,
      cviIcon: icon,
      cviDisplay: cvi.replace(/CVI/g, '').trim()
    };
  }, [emp, rosterHistory, activePeriod]);

  const tdClass = (isCenter = false, isRight = false) => {
    return `roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} ${isCenter ? 'roster-td-center' : ''} ${isRight ? 'roster-td-right' : ''}`;
  };

  return (
    <tr 
      className={`roster-row ${isExceeding ? 'roster-row-exceeding' : emp.focus5 ? 'roster-row-focus5' : ''}`}
      data-testid={`roster-row-${emp.id}`}
    >
      <td className={tdClass(false)}>
        <div className="flex-column gap-sm align-start">
          <span 
            className="roster-name-link cursor-pointer"
            onClick={() => setSelectedProfileEmployee(emp)}
            data-testid={`roster-name-link-${emp.id}`}
          >
            {emp.name}
          </span>
          {emp.employeeNumber && (
            <span className="roster-emp-id">
              ID: {emp.employeeNumber}
            </span>
          )}
          <div className="flex-row align-center gap-sm flex-wrap">
            <span className={`cvi-badge ${badgeClass}`}>
              <span className="cvi-badge-icon">{cviIcon}</span> {cviDisplay}
            </span>
            {emp.focus5 && (
              <span className="focus5-badge">
                ? Focus 5
              </span>
            )}
          </div>
        </div>
      </td>
      
      {visibleCols?.hours && (
        <td className={`${tdClass(true)} text-secondary`}>
          {emp.hours}
        </td>
      )}

      {visibleCols?.dept && (
        <td className={tdClass(false)}>
          <span className="tag-pill tag-pill-dept">
            {emp.dept}
          </span>
        </td>
      )}

      {visibleCols?.memberships && <RosterMetricCell val={emp.memberships} type="memberships" dept={emp.dept || ''} emp={emp} displayValue={emp.memberships} isDense={isDense} />}
      {visibleCols?.creditCards && <RosterMetricCell val={emp.creditCards} type="creditCards" dept={emp.dept || ''} emp={emp} displayValue={emp.creditCards} isDense={isDense} />}
      {visibleCols?.warranty && <RosterMetricCell val={emp.warranty} type="warranty" dept={emp.dept || ''} emp={emp} displayValue={emp.warranty ? `${emp.warranty}%` : '0%'} isDense={isDense} />}
      {visibleCols?.surveys && <RosterMetricCell val={emp.surveys} type="surveys" dept={emp.dept || ''} emp={emp} displayValue={emp.surveys || '-'} isDense={isDense} />}
      {visibleCols?.rph && <RosterMetricCell val={emp.rph} type="rph" dept={emp.dept || ''} emp={emp} displayValue={emp.rph ? `$${emp.rph}` : ''} isDense={isDense} />}
      {visibleCols?.basket && <RosterMetricCell val={emp.basket} type="basket" dept={emp.dept || ''} emp={emp} displayValue={emp.basket ? `$${emp.basket}` : ''} isDense={isDense} />}
      {visibleCols?.attach && (
        emp.dept === 'Computing' ? (
          <RosterMetricCell val={emp.m365} type="m365" dept={emp.dept || ''} emp={emp} displayValue={emp.m365 ? `${emp.m365}%` : '0%'} isDense={isDense} />
        ) : emp.dept === 'Home Theatre' ? (
          <RosterMetricCell val={emp.audio} type="audio" dept={emp.dept || ''} emp={emp} displayValue={emp.audio ? `${emp.audio}%` : '0%'} isDense={isDense} />
        ) : (
          <RosterMetricCell val={0} type="none" dept={emp.dept || ''} emp={emp} displayValue="" isDense={isDense} />
        )
      )}

      {visibleCols?.status && (
        <td className={tdClass(false)}>
          <div className="flex-column align-start gap-sm">
            {gap.split(' & ').map((g, i) => (
              <div key={i}>
                {g === 'None' || !g || g.startsWith('None') ? (
                  <span className="tag-pill tag-pill-success">
                    Hitting Target
                  </span>
                ) : (
                  <span className="tag-pill tag-pill-error">
                    Gap: {g}
                  </span>
                )}
              </div>
            ))}
          </div>
        </td>
      )}

      <td className={tdClass(false, true)}>
        <div className="flex-end gap-sm">
          <button 
            className="btn btn-secondary action-btn-sm cursor-pointer" 
            title="View Profile"
            onClick={() => setSelectedProfileEmployee(emp)}
            data-testid={`btn-view-profile-${emp.id}`}
          >
            <User size={16} />
          </button>
          <button 
            className="btn btn-secondary action-btn-sm action-btn-wizard cursor-pointer" 
            title="Performance Wizard"
            onClick={() => handleStartEdit(emp, emp.dept || '')}
            data-testid={`btn-wizard-${emp.id}`}
          >
            <Wand2 size={16} />
          </button>
          <button 
            className="btn btn-secondary action-btn-sm action-btn-delete cursor-pointer" 
            title="Delete Employee"
            onClick={async () => {
              if (window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
                await deleteEmployee(emp.id);
              }
            }}
            data-testid={`btn-delete-${emp.id}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});
