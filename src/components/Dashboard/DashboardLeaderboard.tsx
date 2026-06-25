import { useState, useMemo } from 'react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Employee } from '../../types/index';
import { calculateCVI } from '../../store/cviHelper';
import { useCalculatedMetrics } from '../../hooks/useCalculatedMetrics';

interface DashboardLeaderboardProps {
  onCoachEmployee: (employee: any) => void;
  onShadowEmployee: (employee: any) => void;
}

export default function DashboardLeaderboard({ 
  onCoachEmployee, 
  onShadowEmployee 
}: DashboardLeaderboardProps) {
  const { roster, rosterHistory, activePeriod } = useCalculatedMetrics();
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
          <h2 className="m-0 mb-xs text-xl font-bold flex-center gap-sm text-primary justify-start">
            <ArrowUpRight size={20} className="text-bby-blue" />
            Roster Leaderboard
          </h2>
          <p className="m-0 text-sm text-secondary">
            Stack rank your top performing advisors to identify coaching opportunities.
          </p>
        </div>
        <select 
          className="bby-select p-sm border-glass text-primary text-sm bg-white-alpha-05 rounded-lg"
          value={rankMetric}
          onChange={(e) => setRankMetric(e.target.value)}
        >
          <option value="memberships">Rank by Plus & Total</option>
          <option value="creditCards">Rank by BBY Cards</option>
          <option value="warranty">Rank by GSP Attach</option>
          <option value="rph">Rank by Revenue/Hr</option>
          <option value="surveys">Rank by 5-Star Surveys</option>
        </select>
      </div>

      <div className="flex-column gap-sm">
        {leaderboardData.map((emp: Employee, idx: number) => {
          const cviString = calculateCVI(emp, rosterHistory, activePeriod);
          const isAccelerating = cviString.includes('Accelerating');
          const isReview = cviString.includes('Review');
          
          let statusBadgeClass = 'badge-neutral';
          if (isAccelerating) statusBadgeClass = 'badge-success';
          if (isReview) statusBadgeClass = 'badge-error';

          return (
            <div 
              key={emp.id} 
              className="glass-card flex-row justify-between align-center p-md hover-scale clickable transition-normal"
              onClick={() => onCoachEmployee(emp)}
            >
              <div className="flex-row align-center gap-md">
                <div className="text-secondary font-bold w-6 text-right">
                  #{idx + 1}
                </div>
                <div className="flex-column">
                  <div className="flex-row align-center gap-sm">
                    <span className="text-md font-bold text-primary">{emp.name}</span>
                    {emp.focus5 && <span className="badge-error">F5</span>}
                  </div>
                  <span className="text-xs text-secondary">{emp.dept}</span>
                </div>
              </div>

              <div className="flex-row align-center gap-lg">
                <div className="flex-column text-right hidden-mobile">
                  <span className="text-xs text-muted uppercase">Status</span>
                  <span className={statusBadgeClass}>{cviString}</span>
                </div>
                
                <div className="flex-column text-right min-w-60">
                  <span className="text-xs text-muted uppercase">
                    {rankMetric === 'memberships' ? 'PMs' : rankMetric === 'creditCards' ? 'Cards' : rankMetric === 'warranty' ? 'GSP' : rankMetric === 'rph' ? 'RPH' : 'CSAT'}
                  </span>
                  <span className={`text-lg font-bold ${rankMetric === 'memberships' ? 'text-bby-blue' : rankMetric === 'creditCards' ? 'text-bby-yellow' : 'text-primary'}`}>
                    {rankMetric === 'surveys' && emp.surveys === 0.2 ? 'Fail' : rankMetric === 'rph' ? `$${emp.rph}` : rankMetric === 'warranty' ? `${emp.warranty}%` : String(emp[rankMetric as keyof Employee] || '')}
                  </span>
                </div>
                
                <div className="flex-center p-sm rounded-full bg-white-alpha-05">
                  <ChevronRight size={16} className="text-secondary" />
                </div>
              </div>
            </div>
          );
        })}
        {leaderboardData.length === 0 && (
          <div className="p-xl flex-center text-secondary border-glass rounded-xl bg-white-alpha-05">
            No active roster data available for this metric.
          </div>
        )}
      </div>
    </div>
  );
}
