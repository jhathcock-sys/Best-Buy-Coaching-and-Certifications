import { Compass } from 'lucide-react';
import { calculateCVI } from '../../store/cviHelper';
import { useCalculatedMetrics } from '../../hooks/useCalculatedMetrics';

import { useMemo } from 'react';

export default function DashboardHeader() {
  const { roster, shadowingHeatmapData, rosterHistory, activePeriod, activeManager } = useCalculatedMetrics();
  
  const acceleratingPct = useMemo(() => {
    if (!Array.isArray(roster) || roster.length === 0) return 0;
    let accelerating = 0;
    roster.forEach((emp) => {
      const c = calculateCVI(emp, rosterHistory, activePeriod);
      if (c.includes('Accelerating')) accelerating++;
    });
    return Math.round((accelerating / roster.length) * 100);
  }, [roster, rosterHistory, activePeriod]);

  const mostShadowedDept = useMemo(() => {
    const entries = Object.entries(shadowingHeatmapData || {});
    if (entries.length === 0) return 'N/A';
    return entries.sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
  }, [shadowingHeatmapData]);

  return (
    <div className="flex-between flex-wrap gap-md" data-testid="dashboard-header">
      <div>
        <h1 className="m-0 mb-xs text-3xl font-bold tracking-tight flex-center gap-sm justify-start" data-testid="dashboard-header-title">
          FloorVision
        </h1>
        <p className="m-0 text-secondary" data-testid="dashboard-header-welcome">Welcome back{activeManager?.name ? `, ${activeManager.name.split(' ')[0]}` : ''}. Here's what's happening on the floor today.</p>
      </div>

      <div className="flex-center gap-md">
        <div className="flex-column bg-surface p-md rounded-xl border-glass align-end" data-testid="store-health-metric">
          <div className="text-xs text-secondary font-semibold uppercase tracking-wide mb-xs">Store Health</div>
          <div className="flex-center gap-sm items-baseline">
            <span className={`text-2xl font-bold ${acceleratingPct >= 50 ? 'text-success' : 'text-warning'}`} data-testid="store-health-value">{acceleratingPct}%</span>
            <span className="text-sm text-secondary">Accelerating</span>
          </div>
        </div>

        <div className="flex-column bg-surface p-md rounded-xl border-glass align-end" data-testid="most-shadowed-dept-metric">
          <div className="text-xs text-secondary font-semibold uppercase tracking-wide mb-xs">Most Shadowed Dept</div>
          <div className="flex-center gap-sm">
            <Compass size={18} color="var(--bby-blue)" />
            <span className="text-lg font-bold text-white" data-testid="most-shadowed-dept-value">
              {mostShadowedDept}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
