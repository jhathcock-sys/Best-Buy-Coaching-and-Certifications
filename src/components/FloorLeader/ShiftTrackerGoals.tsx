import React from 'react';
import { useStore } from '../../store/useStore';

export interface ShiftTrackerGoalsProps {
  activeSummary: {
    totalRevenue: number;
    totalPms: number;
    totalApps: number;
  };
}

export default function ShiftTrackerGoals({ activeSummary }: ShiftTrackerGoalsProps) {
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);

  if (!activeShift) return null;

  return (
    <div className="glass-card p-xl flex-column gap-xl">
      <h3 className="text-xl font-bold m-0 flex-center justify-start gap-sm">
        🎯 Today's Goals & Shift Progress
      </h3>
      <p className="text-sm text-secondary -mt-sm">
        Track real-time progress against daily corporate targets. Customize daily goals inline as floor demands shift.
      </p>
      
      <div className="flex-column gap-md">
        {/* Revenue Goal Progress */}
        <div>
          <div className="flex-center justify-between mb-sm flex-wrap gap-sm">
            <span className="text-sm font-bold text-white">
              Daily Revenue Progress: <strong className="text-info">${(activeSummary?.totalRevenue || 0).toLocaleString([], { maximumFractionDigits: 0 })}</strong> of 
            </span>
            <div className="flex-center gap-xs">
              <span className="text-sm text-secondary">$</span>
              <input 
                type="number"
                className="w-24 p-1 text-xs m-0 text-center border border-glass rounded-md text-white"
                style={{ background: 'rgba(11,15,25,0.6)' }}
                value={activeShift.dailyRevenueGoal || 10000}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setActiveShift({ ...activeShift, dailyRevenueGoal: val });
                }}
                data-testid="goal-input-revenue"
              />
            </div>
          </div>
          {(() => {
            const goal = activeShift.dailyRevenueGoal || 10000;
            const pct = Math.min(Math.round(((activeSummary?.totalRevenue || 0) / goal) * 100), 100);
            return (
              <div className="w-full h-2 bg-white/5 border border-glass rounded-full overflow-hidden relative">
                <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--bby-blue), var(--info))' }} className="h-full transition-all duration-400 rounded-full"></div>
              </div>
            );
          })()}
        </div>

        {/* PMs Goal Progress */}
        <div>
          <div className="flex-center justify-between mb-sm flex-wrap gap-sm">
            <span className="text-sm font-bold text-white">
              Daily PMs (Memberships) Progress: <strong className="text-success">{activeSummary?.totalPms || 0}</strong> of 
            </span>
            <input 
              type="number"
              className="w-20 p-1 text-xs m-0 text-center border border-glass rounded-md text-white"
              style={{ background: 'rgba(11,15,25,0.6)' }}
              value={activeShift.dailyPmsGoal || 15}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setActiveShift({ ...activeShift, dailyPmsGoal: val });
              }}
              data-testid="goal-input-pms"
            />
          </div>
          {(() => {
            const goal = activeShift.dailyPmsGoal || 15;
            const pct = Math.min(Math.round(((activeSummary?.totalPms || 0) / goal) * 100), 100);
            return (
              <div className="w-full h-2 bg-white/5 border border-glass rounded-full overflow-hidden relative">
                <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--success), #10b981)' }} className="h-full transition-all duration-400 rounded-full"></div>
              </div>
            );
          })()}
        </div>

        {/* Apps Goal Progress */}
        <div>
          <div className="flex-center justify-between mb-sm flex-wrap gap-sm">
            <span className="text-sm font-bold text-white">
              Daily Apps (Credit Cards) Progress: <strong className="text-bby-yellow">{activeSummary?.totalApps || 0}</strong> of 
            </span>
            <input 
              type="number"
              className="w-20 p-1 text-xs m-0 text-center border border-glass rounded-md text-white"
              style={{ background: 'rgba(11,15,25,0.6)' }}
              value={activeShift.dailyAppsGoal || 10}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setActiveShift({ ...activeShift, dailyAppsGoal: val });
              }}
              data-testid="goal-input-apps"
            />
          </div>
          {(() => {
            const goal = activeShift.dailyAppsGoal || 10;
            const pct = Math.min(Math.round(((activeSummary?.totalApps || 0) / goal) * 100), 100);
            return (
              <div className="w-full h-2 bg-white/5 border border-glass rounded-full overflow-hidden relative">
                <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--bby-yellow), #f59e0b)' }} className="h-full transition-all duration-400 rounded-full"></div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
