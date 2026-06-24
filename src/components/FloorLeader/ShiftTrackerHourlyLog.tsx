import React from 'react';
import { Plus, CheckCircle2, XCircle } from 'lucide-react';
import ShiftTrackerHourlyRow from './ShiftTrackerHourlyRow';

export default function ShiftTrackerHourlyLog({ 
  activeSummary,
  activeShift,
  setActiveShift,
  checkHourStatus,
  handleAddHour,
  handleUpdateMetric,
  handleUpdateStartRevenue,
  handleUpdateEndRevenue,
  handleRemoveHour,
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
                            <ShiftTrackerHourlyRow
                              key={idx}
                              idx={idx}
                              hour={hour}
                              activeShift={activeShift}
                              checkHourStatus={checkHourStatus}
                              handleUpdateMetric={handleUpdateMetric}
                              handleUpdateStartRevenue={handleUpdateStartRevenue}
                              handleUpdateEndRevenue={handleUpdateEndRevenue}
                              handleRemoveHour={handleRemoveHour}
                            />
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
