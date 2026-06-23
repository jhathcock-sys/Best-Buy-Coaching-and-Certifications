import { useState, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Employee } from '../../types/index';
import { calculateCVI } from '../../store/cviHelper';

interface DashboardLeaderboardProps {
  roster: Employee[];
  rosterHistory: Record<string, Record<string, any>>;
  activePeriod: string;
  onCoachEmployee: (emp: Employee) => void;
  onShadowEmployee: (emp: Employee) => void;
}

export default function DashboardLeaderboard({ 
  roster, 
  rosterHistory, 
  activePeriod, 
  onCoachEmployee, 
  onShadowEmployee 
}: DashboardLeaderboardProps) {
  const [rankMetric, setRankMetric] = useState('memberships');

  const leaderboardData = useMemo(() => {
    if (!Array.isArray(roster)) return [];
    return [...roster]
      .sort((a, b) => {
        const valA = rankMetric === 'surveys' && a.surveys === 0.2 ? 0 : parseFloat(String(a[rankMetric as keyof Employee] || 0)) || 0;
        const valB = rankMetric === 'surveys' && b.surveys === 0.2 ? 0 : parseFloat(String(b[rankMetric as keyof Employee] || 0)) || 0;
        return valB - valA;
      })
      .slice(0, 8); // Top 8
  }, [roster, rankMetric]);

  return (
    <div className="glass-card w-full p-xl">
      <div className="flex-between flex-wrap gap-sm mb-lg">
        <div>
          <h2 className="m-0 mb-xs text-xl font-bold flex-center gap-sm text-white justify-start">
            <ArrowUpRight size={20} color="var(--bby-blue)" />
            Roster Leaderboard
          </h2>
          <p className="m-0 text-sm text-secondary">
            Stack rank your top performing advisors to identify coaching opportunities.
          </p>
        </div>
        <select 
          className="bby-select p-sm border-glass text-white text-sm"
          value={rankMetric}
          onChange={(e) => setRankMetric(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
        >
          <option value="memberships">Rank by Plus & Total</option>
          <option value="creditCards">Rank by BBY Cards</option>
          <option value="warranty">Rank by GSP Attach</option>
          <option value="rph">Rank by Revenue/Hr</option>
          <option value="surveys">Rank by 5-Star Surveys</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border-glass" style={{ background: 'rgba(11, 15, 25, 0.4)' }}>
        <table className="w-full min-w-md" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr className="border-glass" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
              <th className="p-md text-xs font-semibold text-secondary uppercase tracking-wide">Advisor</th>
              <th className="p-md text-xs font-semibold text-secondary uppercase tracking-wide">Department</th>
              <th className="p-md text-xs font-semibold text-secondary uppercase tracking-wide text-center">{rankMetric === 'memberships' ? 'PMs' : rankMetric === 'creditCards' ? 'Cards' : rankMetric === 'warranty' ? 'GSP' : rankMetric === 'rph' ? 'RPH' : 'CSAT'}</th>
              <th className="p-md text-xs font-semibold text-secondary uppercase tracking-wide">Status (CVI)</th>
              <th className="p-md text-xs font-semibold text-secondary uppercase tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((emp: Employee, idx: number) => {
              const cviString = calculateCVI(emp, rosterHistory, activePeriod);
              const isAccelerating = cviString.includes('Accelerating');
              const isReview = cviString.includes('Review');
              
              let statusColor = '#9ca3af'; // Neutral
              if (isAccelerating) statusColor = '#10b981'; // Green
              if (isReview) statusColor = '#ef4444'; // Red

              return (
                <tr key={emp.id} className="border-glass" style={{ transition: 'background 0.2s', borderLeft: 'none', borderRight: 'none' }}>
                  <td className="p-md font-semibold text-white">
                    <div className="flex-center justify-start gap-sm">
                      <span className="text-xs text-secondary text-right" style={{ width: '1rem' }}>#{idx + 1}</span>
                      {emp.name}
                      {emp.focus5 && <span className="bg-error text-white font-bold" style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>F5</span>}
                    </div>
                  </td>
                  <td className="p-md text-secondary text-sm">{emp.dept}</td>
                  <td className="p-md font-bold text-lg text-center" style={{ color: rankMetric === 'memberships' ? '#60a5fa' : rankMetric === 'creditCards' ? '#fef08a' : '#fff' }}>
                    {rankMetric === 'surveys' && emp.surveys === 0.2 ? 'Fail' : rankMetric === 'rph' ? `$${emp.rph}` : rankMetric === 'warranty' ? `${emp.warranty}%` : String(emp[rankMetric as keyof Employee] || '')}
                  </td>
                  <td className="p-md">
                    <span className="font-semibold" style={{ 
                      fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: '20px',
                      background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`
                    }}>
                      {cviString}
                    </span>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex-end gap-sm">
                      <button className="btn btn-secondary btn-sm" onClick={() => onShadowEmployee && onShadowEmployee(emp)}>
                        Shadow
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => onCoachEmployee(emp)}>
                        Log
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leaderboardData.length === 0 && (
          <div className="p-xl text-center text-secondary">
            No roster data available.
          </div>
        )}
      </div>
    </div>
  );
}


