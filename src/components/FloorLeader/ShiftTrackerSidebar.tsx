import React from 'react';
import { Flame, Undo } from 'lucide-react';
import QuickLogWinForm from './QuickLogWinForm';
import OcvObservationForm from './OcvObservationForm';
import { useStore } from '../../store/useStore';
import { ShiftEvent, Employee, ShiftWin } from '../../types';

export interface WinConfig {
  selectedEmpId: string;
  setSelectedEmpId: (id: string) => void;
  winType: 'pm' | 'app';
  setWinType: (type: 'pm' | 'app') => void;
  handleLogFloorWin: () => void;
}

export interface OcvConfig {
  handleLogOcvObservation: (data: any) => void;
}

export interface ShiftTrackerSidebarProps {
  handleUndoWin: (id: string) => void;
  getEmployeesOnShift: () => Employee[];
  getShiftLeaderboard: () => any[];
  winConfig: WinConfig;
  ocvConfig: OcvConfig;
  roster: Employee[];
}

export default function ShiftTrackerSidebar({ 
  handleUndoWin,
  getEmployeesOnShift,
  getShiftLeaderboard,
  winConfig,
  ocvConfig,
  roster
}: ShiftTrackerSidebarProps) {
  const activeShift = useStore((state) => state.activeShift);

  if (!activeShift) return null;

  return (
    <div className="flex-column gap-xl">
      
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
      <div className="glass-card p-xl" data-testid="shift-leaderboard-container">
        <h3 className="text-lg font-bold mb-xs flex align-center gap-sm color-white">
          <Flame size={18} color="var(--error)" /> Hot on the Floor
        </h3>
        <p className="text-xs text-secondary mb-md">Shift leaderboard ranked by PMs + Apps secured today.</p>
        
        <div className="flex-column gap-sm max-h-[250px] overflow-y-auto pr-xs">
          {(getShiftLeaderboard?.() || []).map((emp: any, idx: number) => {
            const totalWins = emp.total || 0;
            const bgClass = totalWins > 0 ? 'bg-bby-yellow-alpha-05 border-bby-yellow-alpha' : 'bg-white-alpha-01 border-glass';
            return (
              <div 
                key={emp.id} 
                className={`flex-between align-center border rounded-lg px-md py-sm ${bgClass}`}
                data-testid={`leaderboard-row-${emp.id}`}
              >
                <div className="flex align-center gap-md">
                  <span className={`text-sm font-bold w-4 ${totalWins > 0 ? 'text-bby-yellow' : 'text-muted'}`}>
                    #{idx + 1}
                  </span>
                  <div className="flex-column">
                    <span className={`text-sm font-bold ${totalWins > 0 ? 'color-white' : 'text-secondary'}`}>
                      {emp.name}
                    </span>
                    <span className="text-xs text-muted">
                      {emp.dept || 'Floor'}
                    </span>
                  </div>
                </div>

                <div className="flex align-center gap-sm">
                  {totalWins > 0 && (
                    <span className="flex align-center color-error mr-xs animate-pulse">
                      <Flame size={14} fill="var(--error)" />
                    </span>
                  )}
                  <span className="px-sm py-xs rounded text-xs bg-success-alpha-15 text-success font-bold">
                    {emp.pms || 0} PM
                  </span>
                  <span className="px-sm py-xs rounded text-xs bg-bby-yellow-alpha-15 text-bby-yellow font-bold">
                    {emp.apps || 0} Card
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Floor Activity Win Feed */}
      <div className="glass-card p-xl" data-testid="recent-activity-feed">
        <h3 className="text-lg font-bold mb-xs color-white">
          📢 Recent Floor Activity
        </h3>
        <p className="text-xs text-secondary mb-md">Real-time win notifications logged during this shift.</p>
        
        <div className="flex-column gap-sm max-h-[200px] overflow-y-auto pr-xs">
          {(!activeShift?.wins || activeShift.wins.length === 0) ? (
            <div className="text-center text-muted text-sm py-xl" data-testid="no-wins-msg">
              No floor wins logged yet for this shift. Keep pushing cards & memberships!
            </div>
          ) : (
            [...activeShift.wins].reverse().map((win: any) => (
              <div 
                key={win.id} 
                className="flex-between align-center bg-black-alpha-15 border border-glass rounded-lg py-sm px-md text-sm"
                data-testid={`win-entry-${win.id}`}
              >
                <div className="flex-column gap-xs flex-1 pr-md">
                  <div className="flex align-center gap-sm flex-wrap">
                    <strong className="color-white">{win.empName}</strong>
                    <span className="text-muted text-xs">({win.zone})</span>
                  </div>
                  <span className={`font-bold ${win.type === 'pm' ? 'text-success' : 'text-bby-yellow'}`}>
                    {win.type === 'pm' ? 'My Best Buy Plus/Total Membership' : 'Best Buy Credit Card Application'}
                  </span>
                  <span className="text-muted text-xs">
                    Logged at {new Date(win.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <button 
                  className="btn-trash bg-transparent border-none text-muted cursor-pointer hover:text-white transition-normal"
                  onClick={() => handleUndoWin(win.id)}
                  title="Undo/Remove Win Entry"
                  data-testid={`undo-win-btn-${win.id}`}
                >
                  <Undo size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
