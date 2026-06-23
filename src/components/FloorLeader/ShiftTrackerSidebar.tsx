import React from 'react';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo, TrendingUp, AlertCircle } from 'lucide-react';
import QuickLogWinForm from './QuickLogWinForm';
import OcvObservationForm from './OcvObservationForm';

export default function ShiftTrackerSidebar({ 
  activeShift,
  handleUndoWin,
  getEmployeesOnShift,
  roster,
  getShiftLeaderboard,
  winConfig,
  ocvConfig
 }: any) {
  return (
    <>
      {/* Sidebar Column: Logger, Leaderboard, Win feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Quick Log Floor Win */}
        <QuickLogWinForm
          getEmployeesOnShift={getEmployeesOnShift}
          roster={roster}
          {...winConfig}
        />

        {/* 30-Second OCV Floor Observation Card */}
        <OcvObservationForm
          getEmployeesOnShift={getEmployeesOnShift}
          roster={roster}
          {...ocvConfig}
        />

        {/* Leaderboard: Hot on the Floor */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
            <Flame size={18} color="var(--error)" /> Hot on the Floor
          </h3>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Shift leaderboard ranked by PMs + Apps secured today.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {getShiftLeaderboard().map((emp: any, idx: number) => {
              const totalWins = emp.total || 0;
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
                      {emp.pms || 0} PM
                    </span>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(242, 169, 0, 0.1)', color: 'var(--bby-yellow)', fontWeight: 600 }}>
                      {emp.apps || 0} Card
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
              [...activeShift.wins].reverse().map((win: any) => (
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
