// @ts-nocheck
import React from 'react';
import { Clock, Plus, HelpCircle } from 'lucide-react';

export default function ImportScheduleRow({
  rev,
  roster,
  handleShiftTimeChange,
  handleMatchChange,
  handleZoneChange
}) {
  const matched = roster.find(r => r.id === rev.matchedEmpId);
  return (
    <tr 
                          key={rev.id} 
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                            background: rev.matchedEmpId === 'create_new' ? 'rgba(6, 182, 212, 0.03)' : !matched ? 'rgba(239, 68, 68, 0.02)' : 'transparent'
                          }}
                        >
                          {/* Raw Name */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                            {rev.originalName}
                          </td>

                          {/* Raw Shift */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <input 
                              type="text" 
                              className="form-control"
                              style={{ width: '150px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#0e1220', margin: 0 }}
                              value={rev.originalShift}
                              onChange={(e: any) => handleShiftTimeChange(rev.id, e.target.value)}
                            />
                          </td>

                          {/* Roster Match Selector */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              className="form-control"
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.2rem 0.5rem', 
                                background: rev.matchedEmpId === 'create_new' ? 'rgba(6, 182, 212, 0.15)' : matched ? '#0e1220' : 'rgba(239, 68, 68, 0.1)',
                                borderColor: rev.matchedEmpId === 'create_new' ? 'var(--info)' : matched ? 'var(--border-glass)' : 'var(--error)',
                                color: rev.matchedEmpId === 'create_new' ? 'var(--info)' : matched ? '#fff' : 'var(--error)',
                                margin: 0,
                                height: '30px'
                              }}
                              value={rev.matchedEmpId}
                              onChange={(e: any) => handleMatchChange(rev.id, e.target.value)}
                            >
                              <option value="">-- Unmatched (Ignore) --</option>
                              <option value="create_new" style={{ color: 'var(--info)', fontWeight: 'bold' }}>[+] Add as New Associate</option>
                              {roster.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                              ))}
                            </select>
                          </td>

                          {/* Zone Assignment Override */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              className="form-control"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#0e1220', margin: 0, height: '30px' }}
                              value={rev.assignedZone}
                              onChange={(e: any) => handleZoneChange(rev.id, e.target.value)}
                            >
                              {['Computing', 'Mobile', 'Home Theatre', 'Front End', 'Geek Squad', 'Appliances'].map(z => (
                                <option key={z} value={z}>{z}</option>
                              ))}
                            </select>
                          </td>

                          {/* Auto Break Math Info */}
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                            {matched ? (
                              breaks.length === 0 ? (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No breaks (&lt;4h)</span>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                  {breaks.map((b, i) => (
                                    <span key={i} style={{ padding: '0.15rem 0.35rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.05)' }} title={b.type}>
                                      {b.time} ({b.type.includes('15') ? '15m' : '30m'})
                                    </span>
                                  ))}
                                </div>
                              )
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
  );
}
