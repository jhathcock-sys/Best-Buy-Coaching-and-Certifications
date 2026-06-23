import { Compass } from 'lucide-react';
import { calculateCVI } from '../../store/cviHelper';
import { Employee } from '../../types/index';

interface DashboardHeaderProps {
  roster: Employee[];
  shadowingHeatmapData: Record<string, number>;
  rosterHistory: Record<string, Record<string, Employee>>;
  activePeriod: string;
  activeManager?: any;
}

export default function DashboardHeader({ roster, shadowingHeatmapData, rosterHistory, activePeriod, activeManager }: DashboardHeaderProps) {
  
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          FloorVision
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Welcome back{activeManager?.name ? `, ${activeManager.name.split(' ')[0]}` : ''}. Here's what's happening on the floor today.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Store Health</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: acceleratingPct >= 50 ? '#10b981' : '#fef08a' }}>{acceleratingPct}%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Accelerating</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Most Shadowed Dept</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="var(--bby-blue)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {Object.entries(shadowingHeatmapData).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
