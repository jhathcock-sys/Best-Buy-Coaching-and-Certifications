import { useState, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Employee } from '../../types/index';
import { calculateCVI } from '../../store/cviHelper';

interface DashboardLeaderboardProps {
  roster: Employee[];
  rosterHistory: Record<string, any[]>;
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
    <div className="glass-card" style={{ padding: '1.75rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <ArrowUpRight size={20} color="var(--bby-blue)" />
            Roster Leaderboard
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Stack rank your top performing advisors to identify coaching opportunities.
          </p>
        </div>
        <select 
          className="bby-select"
          value={rankMetric}
          onChange={(e) => setRankMetric(e.target.value)}
          style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
        >
          <option value="memberships">Rank by Plus & Total</option>
          <option value="creditCards">Rank by BBY Cards</option>
          <option value="warranty">Rank by GSP Attach</option>
          <option value="rph">Rank by Revenue/Hr</option>
          <option value="surveys">Rank by 5-Star Surveys</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', background: 'rgba(11, 15, 25, 0.4)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advisor</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{rankMetric === 'memberships' ? 'PMs' : rankMetric === 'creditCards' ? 'Cards' : rankMetric === 'warranty' ? 'GSP' : rankMetric === 'rph' ? 'RPH' : 'CSAT'}</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status (CVI)</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
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
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '1rem', textAlign: 'right' }}>#{idx + 1}</span>
                      {emp.name}
                      {emp.focus5 && <span style={{ background: 'var(--error)', color: '#fff', fontSize: '0.6rem', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>F5</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{emp.dept}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center', color: rankMetric === 'memberships' ? '#60a5fa' : rankMetric === 'creditCards' ? '#fef08a' : '#fff' }}>
                    {rankMetric === 'surveys' && emp.surveys === 0.2 ? 'Fail' : rankMetric === 'rph' ? `$${emp.rph}` : rankMetric === 'warranty' ? `${emp.warranty}%` : String(emp[rankMetric as keyof Employee] || '')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.65rem', borderRadius: '20px',
                      background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`
                    }}>
                      {cviString}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => onShadowEmployee && onShadowEmployee(emp)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}>
                      Shadow
                    </button>
                    <button className="btn btn-primary" onClick={() => onCoachEmployee(emp)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      Log
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leaderboardData.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No roster data available.
          </div>
        )}
      </div>
    </div>
  );
}


