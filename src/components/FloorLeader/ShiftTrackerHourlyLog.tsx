import React from 'react';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo, TrendingUp, AlertCircle } from 'lucide-react';

export default function ShiftTrackerHourlyLog({ 
  storeConfig,
  currentHourKey,
  selectedLog,
  setSelectedLog,
  newObservation,
  setNewObservation,
  newWinMsg,
  setNewWinMsg,
  winFeed,
  setWinFeed,
  handleSaveHourlyLog,
  handleSaveObservation,
  handleLogWin,
  renderPaceIndicator,
  handleUndoWin
 }: any) {
  return (
    <>
              {/* Main Column: Hourly Log Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Hourly Table Log Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Hourly Floor Performance Log</h3>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Increment Apps, PMs, and Revenue at the end of each hourly check.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn btn-secondary" onClick={handleAddHour} style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}>
                        + Add Next Hour
                      </button>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
                          <th style={{ padding: '1rem' }}>TIME INTERVAL</th>
                          <th style={{ padding: '1rem', textAlign: 'center' }}>PMs (MEMBERSHIPS)</th>
                          <th style={{ padding: '1rem', textAlign: 'center' }}>APPs (CREDIT CARDS)</th>
                          <th style={{ padding: '1rem', textAlign: 'center' }}>REVENUE GENERATED</th>
                          <th style={{ padding: '1rem', textAlign: 'center' }}>STATUS</th>
                          <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeShift.hours.map((hour, idx) => {
                          const onTrack = checkHourStatus(hour.pms, hour.apps, activeShift.isWeekend);
                          const pmGoal = activeShift.isWeekend ? 3 : 2;
                          const appGoal = activeShift.isWeekend ? 3 : 2;

                          return (
                            <tr 
                              key={idx} 
                              style={{ 
                                borderBottom: '1px solid var(--border-glass)',
                                background: onTrack ? 'rgba(16, 185, 129, 0.01)' : 'rgba(239, 68, 68, 0.005)'
                              }}
                            >
                              <td style={{ padding: '1.2rem 1rem', fontWeight: 600 }}>
                                Hour {hour.hourNumber} <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Interval #{idx + 1})</span>
                              </td>
                              
                              {/* PMs Stepper */}
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                  <button 
                                    type="button"
                                    className="btn btn-secondary" 
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleUpdateMetric(idx, 'pms', -1)}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 700, width: '24px', textAlign: 'center', color: hour.pms >= pmGoal ? 'var(--success)' : '#fff' }}>
                                    {hour.pms}
                                  </span>
                                  <button 
                                    type="button"
                                    className="btn btn-secondary" 
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleUpdateMetric(idx, 'pms', 1)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </td>

                              {/* Apps Stepper */}
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                  <button 
                                    type="button"
                                    className="btn btn-secondary" 
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleUpdateMetric(idx, 'apps', -1)}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 700, width: '24px', textAlign: 'center', color: hour.apps >= appGoal ? 'var(--success)' : '#fff' }}>
                                    {hour.apps}
                                  </span>
                                  <button 
                                    type="button"
                                    className="btn btn-secondary" 
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleUpdateMetric(idx, 'apps', 1)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </td>

                              {/* Hourly Revenue Input */}
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', width: '150px' }}>
                                    <div>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem', textAlign: 'center' }}>Start ($)</span>
                                      <input 
                                        type="number"
                                        className="form-control"
                                        style={{ 
                                          width: '100%', 
                                          textAlign: 'center', 
                                          padding: '0.25rem 0.35rem', 
                                          fontSize: '0.8rem', 
                                          background: 'rgba(11, 15, 25, 0.6)', 
                                          border: '1px solid var(--border-glass)',
                                          borderRadius: '4px',
                                          color: '#fff',
                                          margin: 0
                                        }}
                                        value={hour.startRevenue !== undefined ? hour.startRevenue : ''}
                                        onChange={(e) => handleUpdateStartRevenue(idx, e.target.value)}
                                        placeholder="Start"
                                      />
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem', textAlign: 'center' }}>End ($)</span>
                                      <input 
                                        type="number"
                                        className="form-control"
                                        style={{ 
                                          width: '100%', 
                                          textAlign: 'center', 
                                          padding: '0.25rem 0.35rem', 
                                          fontSize: '0.8rem', 
                                          background: 'rgba(11, 15, 25, 0.6)', 
                                          border: '1px solid var(--border-glass)',
                                          borderRadius: '4px',
                                          color: '#fff',
                                          margin: 0
                                        }}
                                        value={hour.endRevenue !== undefined ? hour.endRevenue : ''}
                                        onChange={(e) => handleUpdateEndRevenue(idx, e.target.value)}
                                        placeholder="End"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div style={{ display: 'flex', width: '150px', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.15rem 0.35rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Net:</span>
                                    <span style={{ fontWeight: 800, color: 'var(--success)' }}>
                                      ${(parseFloat(hour.revenue) || 0).toLocaleString([], { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.05rem' }}>
                                    {['+500', '+1k', '+2k'].map(preset => {
                                      const val = preset === '+500' ? 500 : preset === '+1k' ? 1000 : 2000;
                                      return (
                                        <button
                                          key={preset}
                                          type="button"
                                          style={{
                                            padding: '0.15rem 0.35rem',
                                            fontSize: '0.65rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '4px',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                            e.currentTarget.style.color = '#fff';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                          }}
                                          onClick={() => {
                                            const currentStart = parseFloat(hour.startRevenue) || 0;
                                            const currentEnd = parseFloat(hour.endRevenue) || currentStart || 0;
                                            handleUpdateEndRevenue(idx, currentEnd + val);
                                          }}
                                        >
                                          {preset}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>

                              {/* Status Check Badge */}
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  {onTrack ? (
                                    <span style={{ 
                                      padding: '0.35rem 0.75rem', 
                                      background: 'rgba(16, 185, 129, 0.1)', 
                                      border: '1px solid rgba(16, 185, 129, 0.25)', 
                                      color: 'var(--success)', 
                                      borderRadius: '20px', 
                                      fontSize: '0.725rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      boxShadow: '0 0 10px rgba(16,185,129,0.05)'
                                    }}>
                                      <CheckCircle2 size={12} /> ON TRACK
                                    </span>
                                  ) : (
                                    <span style={{ 
                                      padding: '0.35rem 0.75rem', 
                                      background: 'rgba(239, 68, 68, 0.08)', 
                                      border: '1px solid rgba(239, 68, 68, 0.2)', 
                                      color: 'var(--error)', 
                                      borderRadius: '20px', 
                                      fontSize: '0.725rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}>
                                      <XCircle size={12} /> OFF TRACK
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button 
                                  type="button"
                                  className="btn-trash"
                                  style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: 'var(--text-muted)', 
                                    cursor: activeShift.hours.length > 1 ? 'pointer' : 'not-allowed',
                                    opacity: activeShift.hours.length > 1 ? 1 : 0.3,
                                    transition: 'color 0.2s'
                                  }}
                                  onClick={() => handleRemoveHour(idx)}
                                  disabled={activeShift.hours.length <= 1}
                                  title="Delete Hour Record"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Add button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={handleAddHour} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.825rem', borderStyle: 'dashed' }}>
                    <Plus size={16} /> Add Hour {activeShift.hours.length + 1}
                  </button>
                </div>
              </div>
    </>
  );
}
