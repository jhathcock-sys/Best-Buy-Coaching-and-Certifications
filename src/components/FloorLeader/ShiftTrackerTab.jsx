import { Trophy, CheckCircle2, XCircle, Plus, Minus, Trash2, Flame, Undo } from 'lucide-react';

export default function ShiftTrackerTab({ activeShift, setActiveShift, roster = [], handleAddHour, handleUpdateMetric, handleUpdateStartRevenue, handleUpdateEndRevenue, handleRemoveHour, handleLogFloorWin, selectedEmpId, setSelectedEmpId, winType, setWinType, ocvEmpId, setOcvEmpId, ocvConnect, setOcvConnect, ocvRecommend, setOcvRecommend, ocvProtect, setOcvProtect, ocvClose, setOcvClose, ocvNotes, setOcvNotes, handleLogOcvObservation, ocvSuccessMsg, handleUndoWin }) {

  const getEmployeesOnShift = () => {
    if (!activeShift || !activeShift.hours || activeShift.hours.length === 0) return [];
    const assignedIds = new Set();
    if (activeShift.zoneAssignments) {
      Object.values(activeShift.zoneAssignments).forEach(arr => {
        arr.forEach(id => assignedIds.add(id));
      });
    }
    return roster.filter(emp => assignedIds.has(emp.id));
  };

  const checkHourStatus = (pms, apps, isWeekendShift) => {
    const pmGoal = isWeekendShift ? 3 : 2;
    const appGoal = isWeekendShift ? 3 : 2;
    return pms >= pmGoal && apps >= appGoal;
  };

  const hoursArray = activeShift && Array.isArray(activeShift.hours) ? activeShift.hours : [];
  const activeSummary = activeShift ? {
    totalPms: hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0),
    totalApps: hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0),
    totalRevenue: hoursArray.reduce((sum, h) => sum + (parseFloat(h.revenue) || 0), 0) + (activeShift.preExistingRevenue || 0),
    onTrackHours: hoursArray.filter(h => 
      checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
    ).length,
    onTrackRatio: hoursArray.length > 0 ? Math.round((hoursArray.filter(h => 
      checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
    ).length / hoursArray.length) * 100) : 0
  } : null;

  // Helper for generating the leaderboard logic inside the UI
  const getShiftLeaderboard = () => {
    const targetList = roster || [];
    const wins = activeShift?.wins || [];

    const leaderboard = targetList.map(emp => {
      const empWins = wins.filter(w => w.empId === emp.id);
      const apps = empWins.filter(w => w.type === 'app').length;
      const pms = empWins.filter(w => w.type === 'pm').length;
      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff`,
        role: emp.role,
        apps,
        pms,
        total: apps + pms
      };
    });

    return leaderboard.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.pms !== a.pms) return b.pms - a.pms;
      return b.apps - a.apps;
    });
  };

  if (!activeShift) return null;

  return (
            /* Hourly Tracker Log Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
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
            <div className="floor-tracker-grid">
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
            </div>
          </div>
          
  );
}
