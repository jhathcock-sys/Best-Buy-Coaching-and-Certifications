import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface DashboardCoachingEngineProps {
  roster: any[];
  recentSessions: any[];
  deptGoals: any;
  onShadowEmployee: (employee: any) => void;
  onCoachEmployee: (employee: any) => void;
  onCreateLog?: (employee: any) => void;
}

export default function DashboardCoachingEngine({ 
  roster, 
  recentSessions, 
  deptGoals, 
  onShadowEmployee, 
  onCoachEmployee,
  onCreateLog
}: DashboardCoachingEngineProps) {
  
  const coachingRecommendations = useMemo(() => {
    if (!Array.isArray(roster) || roster.length === 0) return [];

    const getEmployeeGaps = (emp: any) => {
      const gaps: string[] = [];
      const goals = (deptGoals && deptGoals[emp.dept]) || { memberships: 8, creditCards: 12.5, warranty: 11, surveys: 1, rph: 640 };
      
      if (goals.membershipsType === 'Hours') {
        const pace = emp.hours / (emp.memberships || 0.001);
        if (pace > goals.memberships) gaps.push('Memberships');
      } else if (goals.membershipsType === 'Dollars') {
        const rev = emp.hours * emp.rph;
        const pace = rev / (emp.memberships || 0.001);
        if (pace > goals.memberships) gaps.push('Memberships');
      } else {
        if (emp.memberships < (goals.memberships || 0)) gaps.push('Memberships');
      }

      if (goals.creditCardsType === 'Hours') {
        const pace = emp.hours / (emp.creditCards || 0.001);
        if (pace > goals.creditCards) gaps.push('Credit Cards');
      } else if (goals.creditCardsType === 'Dollars') {
        const rev = emp.hours * emp.rph;
        const pace = rev / (emp.creditCards || 0.001);
        if (pace > goals.creditCards) gaps.push('Credit Cards');
      } else {
        if (emp.creditCards < (goals.creditCards || 0)) gaps.push('Credit Cards');
      }

      if (emp.warranty < (goals.warranty || 0)) gaps.push('GSP Attach');

      const surveyVal = emp.surveys === 0.2 ? 0 : parseFloat(emp.surveys) || 0;
      if (surveyVal < (goals.surveys || 0)) gaps.push('Surveys');

      if (emp.rph < (goals.rph || 0)) gaps.push('RPH');

      if ((emp.dept === 'Computing' || emp.dept === 'Home Theatre') && emp.basket < (goals.basket || 150)) {
        gaps.push('Basket');
      }

      if (emp.dept === 'Computing' && emp.m365 < (goals.m365 || 60)) {
        gaps.push('M365 Attach');
      }

      if (emp.dept === 'Home Theatre' && emp.audio < (goals.audio || 35)) {
        gaps.push('Audio Attach');
      }

      return gaps;
    };

    const scored = roster.map(emp => {
      const gaps = getEmployeeGaps(emp);
      let score = gaps.length * 10;

      if (emp.focus5) {
        score += 1000;
      }

      const empSessions = (recentSessions || []).filter((s: any) => 
        (s.employeeName && s.employeeName.toLowerCase() === emp.name.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase() === emp.name.toLowerCase())
      );

      let lastCoachedDaysAgo = 999;
      if (empSessions.length > 0) {
        const dates = empSessions.map((s: any) => {
          const d = new Date(s.date);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        }).filter((t: number) => t > 0);

        if (dates.length > 0) {
          const mostRecentTime = Math.max(...dates);
          const diffMs = Date.now() - mostRecentTime;
          lastCoachedDaysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      if (lastCoachedDaysAgo === 999) {
        score += 50;
      } else {
        score += lastCoachedDaysAgo;
      }

      score += (parseFloat(emp.hours) || 0) * 0.5;

      return {
        employee: emp,
        gaps,
        score,
        lastCoachedDaysAgo,
        focus5: emp.focus5 || false
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [roster, recentSessions, deptGoals]);

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <TrendingUp size={20} color="var(--error)" /> Daily Coaching Priorities
        </h3>
        <span 
          style={{ 
            fontSize: '0.65rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: 'var(--error)', 
            padding: '0.2rem 0.5rem', 
            borderRadius: '20px', 
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            animation: 'skeletonPulse 2s ease-in-out infinite'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--error)', display: 'inline-block' }}></span>
          Priority Engine Active
        </span>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>
        Roster scan updates: priorities based on metric gaps, scheduled hours, Focus 5 status, and coaching recency.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {coachingRecommendations.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
            No coaching priorities flagged at this time.
          </p>
        ) : (
          coachingRecommendations.map(({ employee, gaps, lastCoachedDaysAgo, focus5 }) => (
            <div 
              key={employee.id} 
              style={{ 
                padding: '1.25rem', 
                borderRadius: '12px', 
                background: focus5 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)', 
                border: `1.5px solid ${focus5 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-glass)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                  {employee.name}
                </span>
                <span className="tag-pill tag-pill-active" style={{ fontSize: '0.7rem' }}>
                  {employee.dept}
                </span>
              </div>

              {focus5 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🔥 FOCUS 5 PRIORITY - COACH EVERY SHIFT
                </div>
              )}

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {gaps.length > 0 ? (
                  <span>
                    Failing target in: <strong>{gaps.join(', ')}</strong>.
                  </span>
                ) : (
                  <span>Meeting all core target goals.</span>
                )}
                <span> Worked <strong>{employee.hours} hrs</strong> this period. </span>
                {lastCoachedDaysAgo === 999 ? (
                  <span style={{ color: 'var(--bby-yellow)' }}>Never coached in this system.</span>
                ) : (
                  <span>Last coached <strong>{lastCoachedDaysAgo} days ago</strong>.</span>
                )}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', flex: 1 }}
                  onClick={() => onShadowEmployee && onShadowEmployee(employee)}
                >
                  Observe Shadow 🕵️
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', flex: 1 }}
                  onClick={() => onCoachEmployee && onCoachEmployee(employee)}
                >
                  GROW Coach 🧠
                </button>
                <button 
                  className="btn btn-accent" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#000', flex: 1.2 }}
                  onClick={() => onCreateLog ? onCreateLog(employee) : onCoachEmployee(employee)}
                >
                  Log Builder 📝
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
