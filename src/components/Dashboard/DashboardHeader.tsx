import { Compass } from 'lucide-react';
import { calculateCVI } from '../../store/cviHelper';
import { Employee } from '../../types/index';
import { useDashboardContext } from '../../pages/DashboardContext';

export default function DashboardHeader() {
  const { roster, shadowingHeatmapData, rosterHistory, activePeriod, activeManager } = useDashboardContext();
  
  // Calculate CVI Store Health
  let accelerating = 0;
  if (Array.isArray(roster)) {
    roster.forEach((emp) => {
      const c = calculateCVI(emp, rosterHistory, activePeriod);
      if (c.includes('Accelerating')) accelerating++;
    });
  }
  const acceleratingPct = roster?.length ? Math.round((accelerating / roster.length) * 100) : 0;

  return (
    <div className="flex-between flex-wrap gap-md">
      <div>
        <h1 className="m-0 mb-xs text-3xl font-bold tracking-tight flex-center gap-sm justify-start">
          FloorVision
        </h1>
        <p className="m-0 text-secondary">Welcome back{activeManager?.name ? `, ${activeManager.name.split(' ')[0]}` : ''}. Here's what's happening on the floor today.</p>
      </div>

      <div className="flex-center gap-md">
        <div className="flex-column bg-surface p-md rounded-xl border-glass" style={{ alignItems: 'flex-end' }}>
          <div className="text-xs text-secondary font-semibold uppercase tracking-wide mb-xs">Store Health</div>
          <div className="flex-center gap-sm" style={{ alignItems: 'baseline' }}>
            <span className="text-2xl font-bold" style={{ color: acceleratingPct >= 50 ? '#10b981' : '#fef08a' }}>{acceleratingPct}%</span>
            <span className="text-sm text-secondary">Accelerating</span>
          </div>
        </div>

        <div className="flex-column bg-surface p-md rounded-xl border-glass" style={{ alignItems: 'flex-end' }}>
          <div className="text-xs text-secondary font-semibold uppercase tracking-wide mb-xs">Most Shadowed Dept</div>
          <div className="flex-center gap-sm">
            <Compass size={18} color="var(--bby-blue)" />
            <span className="text-lg font-bold text-white">
              {Object.entries(shadowingHeatmapData).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
