import React from 'react';
import { Users } from 'lucide-react';
import { StatusBadge } from './RosterMetricCell';
import { getEmployeeGap, getMetricClass, getPaceText } from '../../utils/rosterUtils';
import { calculateCVI } from '../../store/cviHelper';
import { useStore } from '../../store/useStore';
import { Employee, DeptGoal } from '../../types';

interface StoreRosterMobileCardProps {
  filteredRoster: Employee[];
  DEPARTMENTS: string[];
  handleStartEdit: (emp: Employee, dept: string) => void;
  onCoachEmployee?: (emp: Employee & { gap: string }) => void;
  onCreateLog?: (emp: Employee & { gap: string }) => void;
}

const renderMobileMetricBadge = (
  val: number | undefined | null, 
  type: string, 
  dept: string, 
  emp: Employee, 
  label: string, 
  displayValue: string | number, 
  deptGoals: Record<string, DeptGoal>
) => {
  const isDeptMetric = (
    type !== 'basket' && type !== 'm365' && type !== 'audio'
  ) || (
    (type === 'basket' && (dept === 'Computing' || dept === 'Home Theatre')) ||
    (type === 'm365' && dept === 'Computing') ||
    (type === 'audio' && dept === 'Home Theatre')
  );
  
  if (!isDeptMetric) return null;
  
  const metricClass = getMetricClass(val, type, dept, emp, deptGoals);
  let pillClass = 'bg-white-alpha-05 text-secondary border-white-10';
  
  if (metricClass === 'text-success') {
    pillClass = 'bg-success-alpha-10 text-success border-success-alpha-20';
  } else if (metricClass === 'text-warning') {
    pillClass = 'bg-warning-alpha-10 text-warning border-warning-alpha-20';
  } else if (metricClass === 'text-danger') {
    pillClass = 'bg-error-alpha-10 text-error border-error-alpha-20';
  }
  
  const pace = (type === 'memberships' || type === 'creditCards') ? getPaceText(val, type, dept, emp, deptGoals) : '';
  
  return (
    <div className={`flex-column flex-center text-center rounded-xl p-xs min-h-[62px] border ${pillClass}`}>
      <span className="text-[0.6rem] text-muted uppercase font-bold">{label}</span>
      <span className="text-sm font-bold mt-xs">
        {displayValue}
      </span>
      {pace && (
        <span className="text-[0.55rem] opacity-80 mt-[0.05rem] font-medium">
          {pace}
        </span>
      )}
    </div>
  );
};

export default function StoreRosterMobileCard({
  filteredRoster = [],
  DEPARTMENTS = [],
  handleStartEdit,
  onCoachEmployee,
  onCreateLog
}: StoreRosterMobileCardProps) {
  const deptGoals = useStore((state) => state.deptGoals);
  const rosterHistory = useStore((state) => state.rosterHistory);
  const activePeriod = useStore((state) => state.activePeriod);
  const onDeleteEmployee = useStore((state) => state.deleteEmployee);
  const onUpdateEmployeeDept = useStore((state) => state.updateEmployeeDept);

  const getDeptStyle = (deptName: string) => {
    switch(deptName) {
      case 'Front End': return { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--bby-blue)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'General Sales': return { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
      case 'Appliances': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Computing': return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Mobile': return { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' };
      case 'Home Theatre': return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Geek Squad': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', border: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <div className="flex-column gap-md p-md" data-testid="store-roster-mobile-container">
      {filteredRoster?.length === 0 ? (
        <div className="p-xl text-center text-secondary">
          <Users size={32} className="text-muted mb-sm opacity-50 mx-auto" />
          <p>No associates match your active filters.</p>
        </div>
      ) : (
        filteredRoster?.map(emp => {
          if (!emp) return null;
          const gap = getEmployeeGap(emp, deptGoals);
          const isExceeding = gap === 'None' || gap === '';
          const cardBgClass = isExceeding ? 'bg-success-alpha-05' : emp.focus5 ? 'bg-error-alpha-05' : 'bg-white-alpha-05';
          const cardBorderLeftClass = isExceeding ? 'border-l-4 border-l-success' : emp.focus5 ? 'border-l-4 border-l-error' : 'border-l-4 border-l-transparent';
          
          return (
            <div key={emp.id} className={`flex-column gap-sm p-md rounded-xl border border-glass mb-md shadow-lg ${cardBgClass} ${cardBorderLeftClass}`} data-testid={`mobile-card-emp-${emp.id}`}>
              
              {/* Header: Name, CVI, ID, Status */}
              <div className="flex-between align-start">
                <div>
                  <h4 className="m-0 text-base font-bold text-white flex-row align-center gap-sm flex-wrap">
                    {emp.name}
                    {(() => {
                      const cvi = calculateCVI(emp, rosterHistory, activePeriod);
                      let badgeClass = 'bg-white-alpha-05 text-secondary border-white-10';
                      let cviIcon = '?';
                      if (cvi.includes('Accelerating')) {
                        badgeClass = 'bg-success-alpha-10 text-success border-success-alpha-20';
                        cviIcon = '?';
                      } else if (cvi.includes('Needs Review')) {
                        badgeClass = 'bg-error-alpha-15 text-error border-error-alpha-30';
                        cviIcon = '?';
                      } else if (cvi.includes('Neutral')) {
                        badgeClass = 'bg-warning-alpha-10 text-warning border-warning-alpha-20';
                        cviIcon = '?';
                      }
                      return (
                        <span 
                          title="Coaching Velocity Index (Month over Month growth velocity)"
                          className={`text-[0.65rem] border px-sm py-xs rounded-md font-bold inline-flex align-center gap-xs ${badgeClass}`}
                        >
                          {cviIcon} CVI: {cvi.split(' ')[0]}
                        </span>
                      );
                    })()}
                    {emp.focus5 && (
                      <span className="text-[0.65rem] bg-error-alpha-20 border border-error text-error px-sm py-xs rounded-md font-bold">
                        ? FOCUS 5
                      </span>
                    )}
                  </h4>
                  <div className="text-xs text-muted mt-xs">
                    {emp.hours} hrs worked
                    {emp.employeeNumber && <span className="ml-sm font-mono">| ID: {emp.employeeNumber}</span>}
                  </div>
                </div>
                <StatusBadge gap={gap} />
              </div>

              {/* Department Selector */}
              <div className="flex-row align-center gap-sm">
                <span className="text-xs text-secondary">Dept:</span>
                {(() => {
                  const deptStyle = getDeptStyle(emp.dept || 'All');
                  return (
                    <select 
                      className="form-control text-xs font-bold rounded-full cursor-pointer w-auto text-center appearance-none outline-none"
                      style={{ 
                        padding: '0.25rem 0.6rem', 
                        background: deptStyle.bg, 
                        border: `1px solid ${deptStyle.border}`,
                        color: deptStyle.color,
                        textAlignLast: 'center'
                      }}
                      value={emp.dept}
                      onChange={(e) => onUpdateEmployeeDept && onUpdateEmployeeDept(emp.id, e.target.value)}
                      data-testid={`dept-select-emp-${emp.id}`}
                    >
                      {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                        <option key={d} value={d} className="bg-space text-white">{d}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-sm bg-black-alpha-15 p-sm rounded-xl border border-white-05">
                {renderMobileMetricBadge(emp.memberships, 'memberships', emp.dept || '', emp, 'PMs', emp.memberships || 0, deptGoals)}
                {renderMobileMetricBadge(emp.creditCards, 'creditCards', emp.dept || '', emp, 'Apps', emp.creditCards || 0, deptGoals)}
                {renderMobileMetricBadge(emp.warranty, 'warranty', emp.dept || '', emp, 'GSP', '%', deptGoals)}
                {renderMobileMetricBadge(emp.surveys, 'surveys', emp.dept || '', emp, '5*', emp.surveys === 0.2 ? 'Fail' : (emp.surveys || 0), deptGoals)}
                {renderMobileMetricBadge(emp.rph, 'rph', emp.dept || '', emp, 'RPH', '$', deptGoals)}
                {emp.dept === 'Computing' ? (
                  renderMobileMetricBadge(emp.m365, 'm365', emp.dept, emp, 'M365', '%', deptGoals)
                ) : emp.dept === 'Home Theatre' ? (
                  renderMobileMetricBadge(emp.audio, 'audio', emp.dept, emp, 'Audio', '%', deptGoals)
                ) : (
                  <div className="flex-column flex-center text-center bg-white-alpha-05 border border-white-10 rounded-xl p-xs">
                    <span className="text-[0.65rem] text-muted uppercase font-bold">Pace</span>
                    <span className="text-[0.85rem] font-bold mt-xs text-white">
                      {emp.dept?.substring(0, 4) || 'Unk'}
                    </span>
                  </div>
                )}
                {(emp.dept === 'Computing' || emp.dept === 'Home Theatre') && 
                  renderMobileMetricBadge(emp.basket, 'basket', emp.dept, emp, 'Basket', '$', deptGoals)}
              </div>

              {/* Actions Buttons */}
              <div className="flex-row gap-sm mt-xs w-full">
                <button 
                  className="btn btn-secondary flex-1 p-sm text-xs border-white-15 bg-white-alpha-05 text-center cursor-pointer"
                  onClick={() => handleStartEdit(emp, emp.dept || '')}
                  data-testid={`edit-emp-${emp.id}`}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-secondary flex-1 p-sm text-xs text-center cursor-pointer"
                  onClick={() => onCoachEmployee && onCoachEmployee({ ...emp, gap })}
                  data-testid={`coach-emp-${emp.id}`}
                >
                  Coach
                </button>
                <button 
                  className="btn btn-accent flex-1 p-sm text-xs text-black text-center cursor-pointer"
                  onClick={() => onCreateLog && onCreateLog({ ...emp, gap })}
                  data-testid={`log-builder-emp-${emp.id}`}
                >
                  Log Builder
                </button>
                {onDeleteEmployee && (
                  <button 
                    className="btn btn-danger flex-1 p-sm text-xs text-center cursor-pointer"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${emp.name} from the roster?`)) {
                        onDeleteEmployee(emp.id);
                      }
                    }}
                    data-testid={`delete-emp-${emp.id}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
