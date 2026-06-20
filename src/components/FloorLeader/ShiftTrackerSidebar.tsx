import React from 'react';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo, TrendingUp, AlertCircle } from 'lucide-react';

export default function ShiftTrackerSidebar({ 
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
              {/* Sidebar Column: Logger, Leaderboard, Win feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Quick Log Floor Win */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                    <Trophy size={18} color="var(--bby-yellow)" /> Quick Log Floor Win
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Associate:</label>
                      <select 
                        className="form-control"
                        style={{ background: '#0e1220', fontSize: '0.85rem', height: '38px' }}
                        value={selectedEmpId}
                        onChange={(e) => setSelectedEmpId(e.target.value)}
                      >
                        <option value="">-- Select Associate --</option>
                        {(() => {
                          const onShift = getEmployeesOnShift();
                          const offShift = roster.filter(emp => !onShift.some(os => os.id === emp.id));
                          return (
                            <>
                              {onShift.length > 0 && (
                                <optgroup label="Associates On Shift">
                                  {onShift.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="Other Roster Associates">
                                {offShift.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                                ))}
                              </optgroup>
                            </>
                          );
                        })()}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Win Type:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.55rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-glass)',
                            background: winType === 'pm' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.01)',
                            borderColor: winType === 'pm' ? 'var(--success)' : 'var(--border-glass)',
                            color: winType === 'pm' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => setWinType('pm')}
                        >
                          Membership (PM) 🚀
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.55rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-glass)',
                            background: winType === 'app' ? 'rgba(242, 169, 0, 0.15)' : 'rgba(255,255,255,0.01)',
                            borderColor: winType === 'app' ? 'var(--bby-yellow)' : 'var(--border-glass)',
                            color: winType === 'app' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => setWinType('app')}
                        >
                          Best Buy Card 💳
                        </button>
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, width: '100%', marginTop: '0.25rem' }}
                      onClick={handleLogFloorWin}
                      disabled={!selectedEmpId}
                    >
                      Log Floor Win! 🚀
                    </button>
                  </div>
                </div>

                {/* 30-Second OCV Floor Observation Card */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                    ⏱️ 30-Second OCV Floor Observation
                  </h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Observe behavior on the fly. Score out of 4 benchmarks.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Associate:</label>
                      <select 
                        className="form-control"
                        style={{ background: '#0e1220', fontSize: '0.85rem', height: '38px', width: '100%' }}
                        value={ocvEmpId}
                        onChange={(e) => setOcvEmpId(e.target.value)}
                      >
                        <option value="">-- Select Associate --</option>
                        {(() => {
                          const onShift = getEmployeesOnShift();
                          const offShift = roster.filter(emp => !onShift.some(os => os.id === emp.id));
                          return (
                            <>
                              {onShift.length > 0 && (
                                <optgroup label="Associates On Shift">
                                  {onShift.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="Other Roster Associates">
                                {offShift.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                                ))}
                              </optgroup>
                            </>
                          );
                        })()}
                      </select>
                    </div>

                    {/* Checkbox Benchmarks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
                        <input 
                          type="checkbox" 
                          checked={ocvConnect} 
                          onChange={(e) => setOcvConnect(e.target.checked)} 
                          style={{ accentColor: 'var(--bby-blue)' }}
                        />
                        <span><strong>Connect</strong> (Greeting & discovery)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
                        <input 
                          type="checkbox" 
                          checked={ocvRecommend} 
                          onChange={(e) => setOcvRecommend(e.target.checked)} 
                          style={{ accentColor: 'var(--bby-blue)' }}
                        />
                        <span><strong>Recommend</strong> (Solution matching)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
                        <input 
                          type="checkbox" 
                          checked={ocvProtect} 
                          onChange={(e) => setOcvProtect(e.target.checked)} 
                          style={{ accentColor: 'var(--bby-blue)' }}
                        />
                        <span><strong>Protect</strong> (Membership & GSP attach)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
                        <input 
                          type="checkbox" 
                          checked={ocvClose} 
                          onChange={(e) => setOcvClose(e.target.checked)} 
                          style={{ accentColor: 'var(--bby-blue)' }}
                        />
                        <span><strong>Close</strong> (Financing card & survey ask)</span>
                      </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.25rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Micro Observations / Notes:</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Quick coaching feedback note..."
                        value={ocvNotes}
                        onChange={(e) => setOcvNotes(e.target.value)}
                        style={{ fontSize: '0.775rem', background: '#0e1220' }}
                      />
                    </div>

                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.6rem', fontSize: '0.825rem', fontWeight: 700, width: '100%' }}
                      onClick={handleLogOcvObservation}
                      disabled={!ocvEmpId}
                    >
                      Log Floor Observation
                    </button>

                    {ocvSuccessMsg && (
                      <div style={{ color: 'var(--success)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.25rem', fontWeight: 600 }}>
                        ✅ OCV Observation logged successfully!
                      </div>
                    )}
                  </div>
                </div>

                {/* Leaderboard: Hot on the Floor */}

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
                    <Flame size={18} color="var(--error)" /> Hot on the Floor
                  </h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Shift leaderboard ranked by PMs + Apps secured today.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {getShiftLeaderboard().map((emp, idx) => {
                      const totalWins = emp.shiftTotal || 0;
                      return (
                        <div 
                          key={emp.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: totalWins > 0 ? 'rgba(253, 216, 53, 0.03)' : 'rgba(255,255,255,0.01)', 
                            border: totalWins > 0 ? '1px solid rgba(253,216,53,0.15)' : '1px solid var(--border-glass)',
                            borderRadius: '10px', 
                            padding: '0.6rem 0.85rem' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: totalWins > 0 ? 'var(--bby-yellow)' : 'var(--text-muted)', width: '16px' }}>
                              #{idx + 1}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: totalWins > 0 ? '#fff' : 'var(--text-secondary)' }}>
                                {emp.name}
                              </span>
                              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                                {emp.dept || 'Floor'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {totalWins > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--error)', marginRight: '0.25rem', animation: 'skeletonPulse 1.2s infinite ease-in-out' }}>
                                <Flame size={14} fill="var(--error)" />
                              </span>
                            )}
                            <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 600 }}>
                              {emp.shiftPms || 0} PM
                            </span>
                            <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(242, 169, 0, 0.1)', color: 'var(--bby-yellow)', fontWeight: 600 }}>
                              {emp.shiftApps || 0} Card
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Floor Activity Win Feed */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#fff' }}>
                    📢 Recent Floor Activity
                  </h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Real-time win notifications logged during this shift.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {(!activeShift.wins || activeShift.wins.length === 0) ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '1.5rem 0' }}>
                        No floor wins logged yet for this shift. Keep pushing cards & memberships!
                      </div>
                    ) : (
                      [...activeShift.wins].reverse().map(win => (
                        <div 
                          key={win.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: 'rgba(0,0,0,0.15)', 
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px', 
                            padding: '0.5rem 0.75rem', 
                            fontSize: '0.75rem' 
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1, paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <strong style={{ color: '#fff' }}>{win.empName}</strong>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.675rem' }}>({win.zone})</span>
                            </div>
                            <span style={{ color: win.type === 'pm' ? 'var(--success)' : 'var(--bby-yellow)', fontWeight: 600 }}>
                              {win.type === 'pm' ? 'My Best Buy Plus/Total Membership' : 'Best Buy Credit Card Application'}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                              Logged at {new Date(win.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <button 
                            className="btn-trash"
                            style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            onClick={() => handleUndoWin(win.id)}
                            title="Undo/Remove Win Entry"
                          >
                            <Undo size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
    </>
  );
}
