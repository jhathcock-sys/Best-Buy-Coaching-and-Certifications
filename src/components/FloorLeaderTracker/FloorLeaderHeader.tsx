import React from 'react';
import { User, Flame, Trophy, TrendingUp, AlertCircle, PlayCircle, Clock } from 'lucide-react';

export default function FloorLeaderHeader({ activeShift, activeSummary }: any) {
  return (
    <>
          {/* Top Shift Controls & Gauges */}
          <div className="grid-auto-fit-220 gap-lg">
            
            {/* Active Leader Details */}
            <div className="glass-card flex-center gap-md p-1-25rem justify-start">
              <div className="p-md-sm rounded-xl bg-bby-blue-alpha-08 border-bby-blue-alpha-20">
                <Clock size={24} color="var(--bby-blue)" />
              </div>
              <div>
                <span className="text-0-725rem text-secondary uppercase font-bold tracking-wide">Active Shift Leader</span>
                <h3 className="text-1-1rem font-bold m-0 mt-0-1rem">{activeShift.leaderName}</h3>
                <span className="text-xs text-muted">
                  {activeShift.isWeekend ? 'Weekend Targets (3/3)' : 'Weekday Targets (2/2)'}
                </span>
              </div>
            </div>

            {/* Total Revenue Shift Card */}
            <div className="glass-card p-1-25rem">
              <span className="text-0-725rem text-secondary uppercase font-bold tracking-wide">Total Revenue</span>
              <div className="text-2rem font-heading font-extrabold mt-0-2rem text-info">
                ${activeSummary.totalRevenue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-muted">Accumulated across shift</span>
            </div>

            {/* Total PMs Shift Card */}
            <div className="glass-card p-1-25rem">
              <span className="text-0-725rem text-secondary uppercase font-bold tracking-wide">Total PMs (Memberships)</span>
              <div className="text-2rem font-heading font-extrabold mt-0-2rem text-white">
                {activeSummary.totalPms}
              </div>
              <span className="text-xs text-muted">Accumulated across shift</span>
            </div>

            {/* Total Apps Shift Card */}
            <div className="glass-card p-1-25rem">
              <span className="text-0-725rem text-secondary uppercase font-bold tracking-wide">Total Apps (Credit Cards)</span>
              <div className="text-2rem font-heading font-extrabold mt-0-2rem text-white">
                {activeSummary.totalApps}
              </div>
              <span className="text-xs text-muted">Accumulated across shift</span>
            </div>

            {/* Overall Shift Standing Health */}
            <div className="glass-card p-1-25rem">
              <span className="text-0-725rem text-secondary uppercase font-bold tracking-wide">Shift On-Track Rate</span>
              <div className="text-2rem font-heading font-extrabold mt-0-2rem" style={{ 
                color: activeSummary.onTrackRatio >= 70 ? 'var(--success)' : activeSummary.onTrackRatio >= 40 ? 'var(--bby-yellow)' : 'var(--error)'
              }}>
                {activeSummary.onTrackRatio}%
              </div>
              <span className="text-xs text-muted">
                {activeSummary.onTrackHours} of {activeShift.hours.length} hours meeting target
              </span>
            </div>

          </div>
    </>
  );
}
