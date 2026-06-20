import React from 'react';
import { Users, Clock } from 'lucide-react';
import { RosterMetricCell, getEmployeeGap, getMetricClass } from './RosterMetricCell';
import { calculateCVI } from '../../store/cviHelper';

export default function StoreRosterTable({
  filteredRoster,
  visibleCols,
  isDense,
  deptGoals,
  rosterHistory,
  activePeriod,
  setSelectedProfileEmployee,
  handleStartEdit
}) {
  return (
    <div className="desktop-only" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: 'rgba(16, 24, 48, 0.7)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600 }}>Associate</th>
            {visibleCols.hours && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}><Clock size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />Hours</th>}
            {visibleCols.dept && <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600 }}>Department</th>}
            {visibleCols.memberships && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Memberships</th>}
            {visibleCols.creditCards && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>BBY Cards</th>}
            {visibleCols.warranty && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Warranty/GSP</th>}
            {visibleCols.surveys && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>5 Star</th>}
            {visibleCols.rph && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>RPH</th>}
            {visibleCols.basket && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>Basket ($)</th>}
            {visibleCols.attach && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Dept Attach</th>}
            {visibleCols.status && <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600 }}>Status</th>}
            <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap', width: '320px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoster.length === 0 ? (
            <tr>
              <td colSpan={2 + Object.values(visibleCols).filter(Boolean).length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <p>No associates match your active filters.</p>
              </td>
            </tr>
          ) : (
            filteredRoster.map(emp => {
              const gap = getEmployeeGap(emp, deptGoals);
              const isExceeding = gap === 'None' || gap === '';
              const rowBg = isExceeding ? 'rgba(16, 185, 129, 0.018)' : emp.focus5 ? 'rgba(239, 68, 68, 0.018)' : 'rgba(255,255,255,0.005)';
              const rowBorderLeft = isExceeding ? '4px solid var(--success)' : emp.focus5 ? '4px solid var(--error)' : '4px solid transparent';
              const hoverBg = isExceeding ? 'rgba(16, 185, 129, 0.035)' : emp.focus5 ? 'rgba(239, 68, 68, 0.035)' : 'rgba(255,255,255,0.025)';
              
              return (
                <tr 
                  key={emp.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-glass)',
                    borderLeft: rowBorderLeft,
                    background: rowBg,
                    transition: 'background 0.25s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = rowBg}
                >
                  <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      <span 
                        style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)', fontSize: '0.925rem', fontWeight: 700 }}
                        onClick={() => setSelectedProfileEmployee(emp)}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--bby-blue)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                      >
                        {emp.name}
                      </span>
                      {emp.employeeNumber && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '-0.15rem' }}>
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
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 700, 
                              background: badgeBg,
                              color: badgeColor,
                              border: `1px solid ${badgeBorder}`,
                              padding: '0.15rem 0.4rem', 
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap'
                            }}>
                              <span style={{ fontSize: '0.55rem' }}>{cviIcon}</span> {cvi.replace(/CVI/g, '').trim()}
                            </span>
                          );
                        })()}
                        {emp.focus5 && (
                          <span style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: 'var(--error)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '0.15rem 0.4rem', 
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            ? Focus 5
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {visibleCols.hours && (
                    <td style={{ padding: isDense ? '0.45rem 0.5rem' : '0.85rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {emp.hours}
                    </td>
                  )}

                  {visibleCols.dept && (
                    <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem' }}>
                      <span className="tag-pill" style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem'
                      }}>
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
                    <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                        {gap.split(' & ').map((g, i) => (
                          <div key={i}>
                            {g === 'None' || !g || g.startsWith('None') ? (
                              <span className="tag-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                Hitting Target
                              </span>
                            ) : (
                              <span className="tag-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                Gap: {g}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}

                  <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleStartEdit(emp)}>
                        Edit Pulse
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
