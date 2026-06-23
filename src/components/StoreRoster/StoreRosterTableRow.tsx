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
}) => {
  if (!emp) return null;
  const gap = getEmployeeGap(emp, deptGoals);
  const isExceeding = gap === 'None' || gap === '';
  const rowBg = isExceeding ? 'rgba(16, 185, 129, 0.018)' : emp.focus5 ? 'rgba(239, 68, 68, 0.018)' : 'rgba(255,255,255,0.005)';
  const rowBorderLeft = isExceeding ? '4px solid var(--success)' : emp.focus5 ? '4px solid var(--error)' : '4px solid transparent';
  const hoverBg = isExceeding ? 'rgba(16, 185, 129, 0.035)' : emp.focus5 ? 'rgba(239, 68, 68, 0.035)' : 'rgba(255,255,255,0.025)';
  
  const tdClass = (isCenter = false, isRight = false) => {
    return `roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} ${isCenter ? 'roster-td-center' : ''} ${isRight ? 'roster-td-right' : ''}`;
  };

  return (
    <tr 
      className="roster-row"
      style={{ 
        borderLeft: rowBorderLeft,
        background: rowBg
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.background = rowBg}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {(() => {
              const cvi = calculateCVI(emp, rosterHistory, activePeriod);
              let badgeBg = 'rgba(255, 255, 255, 0.04)';
              let badgeColor = 'var(--text-secondary)';
              let badgeBorder = 'rgba(255, 255, 255, 0.08)';
              let cviIcon = '?';
              if (cvi.includes('Accelerating')) {
                badgeBg = 'rgba(16, 185, 129, 0.1)';
                badgeColor = 'var(--success)';
                badgeBorder = 'rgba(16, 185, 129, 0.2)';
                cviIcon = '?';
              } else if (cvi.includes('Needs Review')) {
                badgeBg = 'rgba(239, 68, 68, 0.15)';
                badgeColor = 'var(--error)';
                badgeBorder = 'rgba(239, 68, 68, 0.3)';
                cviIcon = '?';
              } else if (cvi.includes('Neutral')) {
                badgeBg = 'rgba(245, 158, 11, 0.1)';
                badgeColor = 'var(--warning)';
                badgeBorder = 'rgba(245, 158, 11, 0.2)';
                cviIcon = '?';
              }
              return (
                <span className="cvi-badge" style={{ 
                  background: badgeBg,
                  color: badgeColor,
                  borderColor: badgeBorder
                }}>
                  <span style={{ fontSize: '0.55rem' }}>{cviIcon}</span> {cvi.replace(/CVI/g, '').trim()}
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
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
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
