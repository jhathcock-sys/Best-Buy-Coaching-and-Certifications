import React from 'react';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo, TrendingUp, AlertCircle } from 'lucide-react';

export default function ShiftTrackerGoals({ 
  hourlyLogs,
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
              {/* Today's Goals & Target Progress Panel */}
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎯 Today's Goals & Shift Progress
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '-0.75rem' }}>
                  Track real-time progress against daily corporate targets. Customize daily goals inline as floor demands shift.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Revenue Goal Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                        Daily Revenue Progress: <strong style={{ color: 'var(--info)' }}>${activeSummary.totalRevenue.toLocaleString([], { maximumFractionDigits: 0 })}</strong> of 
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>$</span>
                        <input 
                          type="number"
                          className="form-control"
                          style={{ width: '90px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', margin: 0, textAlign: 'center', background: 'rgba(11,15,25,0.6)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff' }}
                          value={activeShift.dailyRevenueGoal || 10000}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setActiveShift({ ...activeShift, dailyRevenueGoal: val });
                          }}
                        />
                      </div>
                    </div>
                    {(() => {
                      const goal = activeShift.dailyRevenueGoal || 10000;
                      const pct = Math.min(Math.round((activeSummary.totalRevenue / goal) * 100), 100);
                      return (
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--bby-blue), var(--info))', transition: 'width 0.4s ease', borderRadius: '5px' }}></div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* PMs Goal Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                        Daily PMs (Memberships) Progress: <strong style={{ color: 'var(--success)' }}>{activeSummary.totalPms}</strong> of 
                      </span>
                      <input 
                        type="number"
                        className="form-control"
                        style={{ width: '70px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', margin: 0, textAlign: 'center', background: 'rgba(11,15,25,0.6)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff' }}
                        value={activeShift.dailyPmsGoal || 15}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setActiveShift({ ...activeShift, dailyPmsGoal: val });
                        }}
                      />
                    </div>
                    {(() => {
                      const goal = activeShift.dailyPmsGoal || 15;
                      const pct = Math.min(Math.round((activeSummary.totalPms / goal) * 100), 100);
                      return (
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--success), #10b981)', transition: 'width 0.4s ease', borderRadius: '5px' }}></div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Apps Goal Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>
                        Daily Apps (Credit Cards) Progress: <strong style={{ color: 'var(--bby-yellow)' }}>{activeSummary.totalApps}</strong> of 
                      </span>
                      <input 
                        type="number"
                        className="form-control"
                        style={{ width: '70px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', margin: 0, textAlign: 'center', background: 'rgba(11,15,25,0.6)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff' }}
                        value={activeShift.dailyAppsGoal || 10}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setActiveShift({ ...activeShift, dailyAppsGoal: val });
                        }}
                      />
                    </div>
                    {(() => {
                      const goal = activeShift.dailyAppsGoal || 10;
                      const pct = Math.min(Math.round((activeSummary.totalApps / goal) * 100), 100);
                      return (
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--bby-yellow), #f59e0b)', transition: 'width 0.4s ease', borderRadius: '5px' }}></div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
    </>
  );
}
