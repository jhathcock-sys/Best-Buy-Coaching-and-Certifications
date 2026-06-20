import React from 'react';
import { User, Flame, Trophy, TrendingUp, AlertCircle, PlayCircle, Clock } from 'lucide-react';

export default function FloorLeaderHeader({ activeShift, activeSummary }: any) {
  return (
    <>
          {/* Top Shift Controls & Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            
            {/* Active Leader Details */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0, 70, 190, 0.08)', border: '1px solid rgba(0,70,190,0.2)' }}>
                <Clock size={24} color="var(--bby-blue)" />
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Active Shift Leader</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.1rem 0 0 0' }}>{activeShift.leaderName}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {activeShift.isWeekend ? 'Weekend Targets (3/3)' : 'Weekday Targets (2/2)'}
                </span>
              </div>
            </div>

            {/* Total Revenue Shift Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Revenue</span>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '0.2rem', color: 'var(--info)' }}>
                ${activeSummary.totalRevenue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accumulated across shift</span>
            </div>

            {/* Total PMs Shift Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total PMs (Memberships)</span>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '0.2rem', color: '#fff' }}>
                {activeSummary.totalPms}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accumulated across shift</span>
            </div>

            {/* Total Apps Shift Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Apps (Credit Cards)</span>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '0.2rem', color: '#fff' }}>
                {activeSummary.totalApps}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accumulated across shift</span>
            </div>

            {/* Overall Shift Standing Health */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Shift On-Track Rate</span>
              <div style={{ 
                fontSize: '2rem', 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 800, 
                marginTop: '0.2rem',
                color: activeSummary.onTrackRatio >= 70 ? 'var(--success)' : activeSummary.onTrackRatio >= 40 ? 'var(--bby-yellow)' : 'var(--error)'
              }}>
                {activeSummary.onTrackRatio}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {activeSummary.onTrackHours} of {activeShift.hours.length} hours meeting target
              </span>
            </div>

          </div>
    </>
  );
}
