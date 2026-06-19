// @ts-nocheck
import { Users } from 'lucide-react';

export default function ZoneScheduler({ 
  zoneAssignments = {}, 
  roster = [], 
  onAssignZone, 
  onUnassignZone,
  activeBreaks = {},
  onToggleBreakState
}) {
  const zones = ['Computing', 'Mobile', 'Home Theatre', 'Front End', 'Geek Squad', 'Appliances'];
  const assignedEmpIds = Object.values(zoneAssignments).flat();
  const unassignedEmps = roster.filter(emp => !assignedEmpIds.includes(emp.id));

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
        <Users size={20} /> Sales Floor Zone Assignments
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        Zoning sheet scheduler: assign associates to floor specialties. Review performance gaps and toggle active breaks.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {zones.map(zone => {
          const zoneEmps = zoneAssignments[zone] || [];

          return (
            <div 
              key={zone} 
              style={{ 
                padding: '1.25rem', 
                background: 'rgba(255, 255, 255, 0.01)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{zone}</h4>
                <span className="tag-pill" style={{ fontSize: '0.65rem' }}>{zoneEmps.length} active</span>
              </div>

              {/* Assign Select */}
              <div className="form-group" style={{ margin: 0 }}>
                <select 
                  className="form-control"
                  style={{ fontSize: '0.75rem', height: '32px', padding: '0.2rem 0.5rem', background: '#0e1220' }}
                  value=""
                  onChange={(e) => onAssignZone(zone, e.target.value)}
                >
                  <option value="">+ Assign Associate...</option>
                  {unassignedEmps.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                  ))}
                </select>
              </div>

              {/* Assigned List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '80px' }}>
                {zoneEmps.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.04)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>
                    Zone unstaffed
                  </div>
                ) : (
                  zoneEmps.map(empId => {
                    const emp = roster.find(e => e.id === empId);
                    if (!emp) return null;
                    
                    const isOnBreak = activeBreaks[empId]; // '15m' or '30m' or undefined

                    return (
                      <div 
                        key={empId} 
                        style={{ 
                          padding: '0.75rem', 
                          background: isOnBreak ? 'rgba(0, 70, 190, 0.05)' : 'rgba(255,255,255,0.02)', 
                          border: `1px solid ${isOnBreak ? 'rgba(0, 70, 190, 0.25)' : 'var(--border-glass)'}`, 
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          opacity: isOnBreak ? 0.7 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: '#fff', textDecoration: isOnBreak ? 'line-through' : 'none' }}>{emp.name}</span>
                          <button 
                            style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                            onClick={() => onUnassignZone(zone, empId)}
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                          <span>Membs: {emp.memberships}</span>
                          <span>CCs: {emp.creditCards}</span>
                          <span>GSP: {emp.warranty}%</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                          {emp.focus5 && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--error)', fontWeight: 700 }}>
                              🔥 FOCUS 5
                            </span>
                          )}
                          {emp.gap && emp.gap !== 'None' && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                              ⚠️ Gap: {emp.gap.split(' & ')[0]}
                            </span>
                          )}
                        </div>

                        {/* Manual Break Controls */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          marginTop: '0.45rem', 
                          paddingTop: '0.45rem', 
                          borderTop: '1px solid rgba(255,255,255,0.03)' 
                        }}>
                          {isOnBreak ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--bby-yellow)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                {isOnBreak === '15m' ? '☕ On 15m Break' : '🍔 On 30m Lunch'}
                              </span>
                              <button
                                style={{ 
                                  background: 'rgba(255,255,255,0.05)', 
                                  border: '1px solid var(--border-glass)', 
                                  borderRadius: '6px', 
                                  fontSize: '0.65rem', 
                                  color: '#fff', 
                                  padding: '0.15rem 0.4rem', 
                                  cursor: 'pointer' 
                                }}
                                onClick={() => onToggleBreakState(empId, null)}
                              >
                                End Break
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyText: 'center', justifyItems: 'center', alignContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Send on:</span>
                              <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                                <button
                                  type="button"
                                  style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    color: 'var(--text-secondary)',
                                    padding: '0.15rem 0.35rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 70, 190, 0.15)';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }}
                                  onClick={() => onToggleBreakState(empId, '15m')}
                                >
                                  ☕ 15m
                                </button>
                                <button
                                  type="button"
                                  style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    color: 'var(--text-secondary)',
                                    padding: '0.15rem 0.35rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 70, 190, 0.15)';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }}
                                  onClick={() => onToggleBreakState(empId, '30m')}
                                >
                                  🍔 30m
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
