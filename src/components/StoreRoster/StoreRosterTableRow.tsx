import React from 'react';
import { User, Wand2, Trash2 } from 'lucide-react';
import { RosterMetricCell, getEmployeeGap } from './RosterMetricCell';
import { calculateCVI } from '../../store/cviHelper';

export const StoreRosterTableRow = React.memo(({
  emp,
  visibleCols,
  isDense,
  deptGoals,
  rosterHistory,
  activePeriod,
  setSelectedProfileEmployee,
  handleStartEdit,
  onDeleteEmployee
}: any) => {
  if (!emp) return null;
  const gap = getEmployeeGap(emp, deptGoals);
  const isExceeding = gap === 'None' || gap === '';
  
  const tdClass = (isCenter = false, isRight = false) => {
    return `roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} ${isCenter ? 'roster-td-center' : ''} ${isRight ? 'roster-td-right' : ''}`;
  };

  return (
    <tr 
      className={`roster-row ${isExceeding ? 'roster-row-exceeding' : emp.focus5 ? 'roster-row-focus5' : ''}`}
    >
      <td className={tdClass(false)}>
        <div className="flex-column gap-sm align-start">
          <span 
            className="roster-name-link"
            onClick={() => setSelectedProfileEmployee(emp)}
          >
            {emp.name}
          </span>
          {emp.employeeNumber && (
            <span className="roster-emp-id">
              ID: {emp.employeeNumber}
            </span>
          )}
          <div className="flex-row align-center gap-sm flex-wrap">
            {(() => {
              const cvi = calculateCVI(emp, rosterHistory, activePeriod);
              let badgeClass = 'cvi-badge-default';
              let cviIcon = '?';
              if (cvi.includes('Accelerating')) {
                badgeClass = 'cvi-badge-accelerating';
                cviIcon = '?';
              } else if (cvi.includes('Needs Review')) {
                badgeClass = 'cvi-badge-review';
                cviIcon = '?';
              } else if (cvi.includes('Neutral')) {
                badgeClass = 'cvi-badge-neutral';
                cviIcon = '?';
              }
              return (
                <span className={`cvi-badge ${badgeClass}`}>
                  <span className="cvi-badge-icon">{cviIcon}</span> {cvi.replace(/CVI/g, '').trim()}
                </span>
              );
            })()}
            {emp.focus5 && (
              <span className="focus5-badge">
                ? Focus 5
              </span>
            )}
          </div>
        </div>
      </td>
      
      {visibleCols.hours && (
        <td className={`${tdClass(true)} text-secondary`}>
          {emp.hours}
        </td>
      )}

      {visibleCols.dept && (
        <td className={tdClass(false)}>
          <span className="tag-pill tag-pill-dept">
            {emp.dept}
          </span>
        </td>
      )}

      {visibleCols.memberships && <RosterMetricCell val={emp.memberships} type="memberships" dept={emp.dept} emp={emp} displayValue={emp.memberships} deptGoals={deptGoals} isDense={isDense} />}
      {visibleCols.creditCards && <RosterMetricCell val={emp.creditCards} type="creditCards" dept={emp.dept} emp={emp} displayValue={emp.creditCards} deptGoals={deptGoals} isDense={isDense} />}
      {visibleCols.warranty && <RosterMetricCell val={emp.warranty} type="warranty" dept={emp.dept} emp={emp} displayValue={emp.warranty ? `${emp.warranty}%` : '0%'} deptGoals={deptGoals} isDense={isDense} />}
      {visibleCols.surveys && <RosterMetricCell val={emp.surveys} type="surveys" dept={emp.dept} emp={emp} displayValue={emp.surveys || '-'} deptGoals={deptGoals} isDense={isDense} />}
      {visibleCols.rph && <RosterMetricCell val={emp.rph} type="rph" dept={emp.dept} emp={emp} displayValue={emp.rph ? `$${emp.rph}` : ''} deptGoals={deptGoals} isDense={isDense} />}
      {visibleCols.basket && <RosterMetricCell val={emp.basket} type="basket" dept={emp.dept} emp={emp} displayValue={emp.basket ? `$${emp.basket}` : ''} deptGoals={deptGoals} isDense={isDense} />}
      {visibleCols.attach && (
        emp.dept === 'Computing' ? (
          <RosterMetricCell val={emp.m365} type="m365" dept={emp.dept} emp={emp} displayValue={emp.m365 ? `${emp.m365}%` : '0%'} deptGoals={deptGoals} isDense={isDense} />
        ) : emp.dept === 'Home Theatre' ? (
          <RosterMetricCell val={emp.audio} type="audio" dept={emp.dept} emp={emp} displayValue={emp.audio ? `${emp.audio}%` : '0%'} deptGoals={deptGoals} isDense={isDense} />
        ) : (
          <RosterMetricCell val={0} type="none" dept={emp.dept} emp={emp} displayValue="" deptGoals={deptGoals} isDense={isDense} />
        )
      )}

      {visibleCols.status && (
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
            className="btn btn-secondary action-btn-sm" 
            title="View Profile"
            onClick={() => setSelectedProfileEmployee(emp)}
          >
            <User size={16} />
          </button>
          <button 
            className="btn btn-secondary action-btn-sm action-btn-wizard" 
            title="Performance Wizard"
            onClick={() => handleStartEdit(emp)}
          >
            <Wand2 size={16} />
          </button>
          <button 
            className="btn btn-secondary action-btn-sm action-btn-delete" 
            title="Delete Employee"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${emp.name}?`)) {
                onDeleteEmployee(emp.id);
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});
