import React from 'react';
import { Users } from 'lucide-react';
import { getEmployeeGap, getMetricClass, getPaceText, StatusBadge } from './RosterMetricCell';
import { calculateCVI } from '../../store/cviHelper';

const renderMobileMetricBadge = (val, type, dept, emp, label, displayValue, deptGoals) => {
  const isDeptMetric = (
    type !== 'basket' && type !== 'm365' && type !== 'audio'
  ) || (
    (type === 'basket' && (dept === 'Computing' || dept === 'Home Theatre')) ||
    (type === 'm365' && dept === 'Computing') ||
    (type === 'audio' && dept === 'Home Theatre')
  );
  
  if (!isDeptMetric) return null;
  
  const metricClass = getMetricClass(val, type, dept, emp, deptGoals);
  let pillBg = 'rgba(255, 255, 255, 0.015)';
  let pillColor = 'var(--text-secondary)';
  let pillBorder = 'rgba(255, 255, 255, 0.05)';
  
  if (metricClass === 'text-success') {
    pillBg = 'rgba(16, 185, 129, 0.08)';
    pillColor = 'var(--success)';
    pillBorder = 'rgba(16, 185, 129, 0.2)';
  } else if (metricClass === 'text-warning') {
    pillBg = 'rgba(245, 158, 11, 0.08)';
    pillColor = 'var(--warning)';
    pillBorder = 'rgba(245, 158, 11, 0.2)';
  } else if (metricClass === 'text-danger') {
    pillBg = 'rgba(239, 68, 68, 0.08)';
    pillColor = 'var(--error)';
    pillBorder = 'rgba(239, 68, 68, 0.2)';
  }
  
  const pace = (type === 'memberships' || type === 'creditCards') ? getPaceText(val, type, dept, emp, deptGoals) : '';
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      background: pillBg, 
      color: pillColor, 
      border: `1px solid ${pillBorder}`, 
      borderRadius: '10px', 
      padding: '0.45rem 0.25rem',
      minHeight: '62px',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.15rem' }}>
        {displayValue}
      </span>
      {pace && (
        <span style={{ fontSize: '0.55rem', opacity: 0.8, marginTop: '0.05rem', fontWeight: 500 }}>
          {pace}
        </span>
      )}
    </div>
  );
};

export default function StoreRosterMobileCard({
  filteredRoster,
  deptGoals,
  rosterHistory,
  activePeriod,
  DEPARTMENTS,
  onUpdateEmployeeDept,
  handleStartEdit,
  onCoachEmployee,
  onCreateLog,
  onDeleteEmployee
}) {

  const getDeptStyle = (deptName) => {
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
    <div className="mobile-only" style={{ padding: '1rem', gap: '1rem' }}>
      {filteredRoster.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Users size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <p>No associates match your active filters.</p>
        </div>
      ) : (
        filteredRoster.map(emp => {
          if (!emp) return null;
          const gap = getEmployeeGap(emp, deptGoals);
          const isExceeding = gap === 'None' || gap === '';
          const cardBg = isExceeding ? 'rgba(16, 185, 129, 0.018)' : emp.focus5 ? 'rgba(239, 68, 68, 0.018)' : 'rgba(255,255,255,0.005)';
          const cardBorderLeft = isExceeding ? '4px solid var(--success)' : emp.focus5 ? '4px solid var(--error)' : '4px solid transparent';
          
          return (
            <div key={emp.id} style={{ 
              background: cardBg, 
              borderRadius: '12px', 
              padding: '1rem', 
              border: '1px solid var(--border-glass)',
              borderLeft: cardBorderLeft,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              
              {/* Header: Name, CVI, ID, Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {emp.name}
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
                        <span 
                          title="Coaching Velocity Index (Month over Month growth velocity)"
                          style={{ 
                            fontSize: '0.65rem', 
                            background: badgeBg, 
                            border: `1px solid ${badgeBorder}`, 
                            color: badgeColor, 
                            padding: '0.15rem 0.35rem', 
                            borderRadius: '6px', 
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.15rem'
                          }}
                        >
                          {cviIcon} CVI: {cvi.split(' ')[0]}
                        </span>
                      );
                    })()}
                    {emp.focus5 && (
                      <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.15rem 0.35rem', borderRadius: '6px', fontWeight: 700 }}>
                        ? FOCUS 5
                      </span>
                    )}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {emp.hours} hrs worked
                    {emp.employeeNumber && <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace' }}>| ID: {emp.employeeNumber}</span>}
                  </div>
                </div>
                <StatusBadge gap={gap} />
              </div>

              {/* Department Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dept:</span>
                {(() => {
                  const deptStyle = getDeptStyle(emp.dept);
                  return (
                    <select 
                      className="form-control"
                      style={{ 
                        padding: '0.25rem 0.6rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        background: deptStyle.bg, 
                        border: `1px solid ${deptStyle.border}`,
                        borderRadius: '20px',
                        color: deptStyle.color,
                        cursor: 'pointer',
                        width: 'auto',
                        textAlign: 'center',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        outline: 'none',
                        textAlignLast: 'center'
                      }}
                      value={emp.dept}
                      onChange={(e) => onUpdateEmployeeDept && onUpdateEmployeeDept(emp.id, e.target.value)}
                    >
                      {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                        <option key={d} value={d} style={{ background: '#0e1220', color: '#fff' }}>{d}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Metrics Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                gap: '0.65rem', 
                background: 'rgba(0,0,0,0.15)', 
                padding: '0.65rem', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.02)'
              }}>
                {renderMobileMetricBadge(emp.memberships, 'memberships', emp.dept, emp, 'Membs', emp.memberships, deptGoals)}
                {renderMobileMetricBadge(emp.creditCards, 'creditCards', emp.dept, emp, 'Cards', emp.creditCards, deptGoals)}
                {renderMobileMetricBadge(emp.warranty, 'warranty', emp.dept, emp, 'GSP', '%', deptGoals)}
                {renderMobileMetricBadge(emp.surveys, 'surveys', emp.dept, emp, 'Surveys', emp.surveys === 0.2 ? 'Fail' : emp.surveys, deptGoals)}
                {renderMobileMetricBadge(emp.rph, 'rph', emp.dept, emp, 'RPH', '$', deptGoals)}
                {emp.dept === 'Computing' ? (
                  renderMobileMetricBadge(emp.m365, 'm365', emp.dept, emp, 'M365', '%', deptGoals)
                ) : emp.dept === 'Home Theatre' ? (
                  renderMobileMetricBadge(emp.audio, 'audio', emp.dept, emp, 'Audio', '%', deptGoals)
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.45rem 0.25rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pace</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.15rem', color: '#fff' }}>
                      {emp.dept.substring(0, 4)}
                    </span>
                  </div>
                )}
                {(emp.dept === 'Computing' || emp.dept === 'Home Theatre') && 
                  renderMobileMetricBadge(emp.basket, 'basket', emp.dept, emp, 'Basket', '$', deptGoals)}
              </div>

              {/* Actions Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', width: '100%' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}
                  onClick={() => handleStartEdit(emp)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}
                  onClick={() => onCoachEmployee && onCoachEmployee({ ...emp, gap })}
                >
                  Coach
                </button>
                <button 
                  className="btn btn-accent" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', color: '#000', textAlign: 'center' }}
                  onClick={() => onCreateLog && onCreateLog({ ...emp, gap })}
                >
                  Log Builder
                </button>
                {onDeleteEmployee && (
                  <button 
                    className="btn btn-danger" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${emp.name} from the roster?`)) {
                        onDeleteEmployee(emp.id);
                      }
                    }}
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
