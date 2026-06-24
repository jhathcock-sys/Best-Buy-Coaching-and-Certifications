import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useDashboardContext } from '../../pages/DashboardContext';

interface DashboardCoachingEngineProps {
  onShadowEmployee: (employee: any) => void;
  onCoachEmployee: (employee: any) => void;
  onCreateLog?: (employee: any) => void;
}

export default function DashboardCoachingEngine({ 
  onShadowEmployee, 
  onCoachEmployee,
  onCreateLog
}: DashboardCoachingEngineProps) {
  const { roster, recentSessions, deptGoals } = useDashboardContext();
  
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
        if ((emp.memberships || 0) < (goals.memberships || 0)) gaps.push('Memberships');
      }

      if (goals.creditCardsType === 'Hours') {
        const pace = emp.hours / (emp.creditCards || 0.001);
        if (pace > goals.creditCards) gaps.push('Credit Cards');
      } else if (goals.creditCardsType === 'Dollars') {
        const rev = emp.hours * emp.rph;
        const pace = rev / (emp.creditCards || 0.001);
        if (pace > goals.creditCards) gaps.push('Credit Cards');
      } else {
        if ((emp.creditCards || 0) < (goals.creditCards || 0)) gaps.push('Credit Cards');
      }

      if ((emp.warranty || 0) < (goals.warranty || 0)) gaps.push('GSP Attach');

      const surveyVal = emp.surveys === 0.2 ? 0 : parseFloat(emp.surveys) || 0;
      if (surveyVal < (goals.surveys || 0)) gaps.push('Surveys');

      if ((emp.rph || 0) < (goals.rph || 0)) gaps.push('RPH');

      if ((emp.dept === 'Computing' || emp.dept === 'Home Theatre') && (emp.basket || 0) < (goals.basket || 150)) {
        gaps.push('Basket');
      }

      if (emp.dept === 'Computing' && (emp.m365 || 0) < (goals.m365 || 60)) {
        gaps.push('M365 Attach');
      }

      if (emp.dept === 'Home Theatre' && (emp.audio || 0) < (goals.audio || 35)) {
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
      <div className="flex-between flex-wrap gap-sm mb-lg">
        <h3 className="m-0 flex-center gap-sm text-xl">
          <TrendingUp size={20} color="var(--error)" /> Daily Coaching Priorities
        </h3>
        <span className="bg-error-alpha text-error font-bold flex-center gap-sm p-sm rounded-xl uppercase tracking-wide text-sm alert-card-danger">
          <span className="bg-error rounded-full" style={{ width: 6, height: 6 }}></span>
          Priority Engine Active
        </span>
      </div>
      <p className="text-secondary text-sm mb-lg mt-0">
        Roster scan updates: priorities based on metric gaps, scheduled hours, Focus 5 status, and coaching recency.
      </p>
      <div className="flex-column gap-md">
        {coachingRecommendations.length === 0 ? (
          <p className="text-muted text-sm text-center p-md">
            No coaching priorities flagged at this time.
          </p>
        ) : (
          coachingRecommendations.map(({ employee, gaps, lastCoachedDaysAgo, focus5 }) => (
            <div 
              key={employee.id} 
              className={`flex-column gap-md p-md rounded-xl ${focus5 ? 'alert-card-danger' : 'bg-surface border-glass'} animate-fade-in`}
              style={{ transition: 'var(--transition-normal)' }}
            >
              <div className="flex-between flex-wrap gap-sm">
                <span className="font-bold text-lg">
                  {employee.name}
                </span>
                <span className="tag-pill tag-pill-active text-sm">
                  {employee.dept}
                </span>
              </div>

              {focus5 && (
                <div className="text-error font-bold flex-center justify-start gap-sm text-sm">
                  🔥 FOCUS 5 PRIORITY - COACH EVERY SHIFT
                </div>
              )}

              <p className="text-secondary text-sm m-0">
                {gaps.length > 0 ? (
                  <span>
                    Failing target in: <strong>{gaps.join(', ')}</strong>.
                  </span>
                ) : (
                  <span>Meeting all core target goals.</span>
                )}
                <span> Worked <strong className="text-primary">{employee.hours} hrs</strong> this period. </span>
                {lastCoachedDaysAgo === 999 ? (
                  <span className="text-warning">Never coached in this system.</span>
                ) : (
                  <span>Last coached <strong>{lastCoachedDaysAgo} days ago</strong>.</span>
                )}
              </p>

              <div className="flex-center flex-wrap gap-sm mt-sm">
                <button 
                  className="btn btn-secondary flex-1 btn-sm" 
                  onClick={() => onShadowEmployee && onShadowEmployee(employee)}
                >
                  Observe Shadow 🕵️
                </button>
                <button 
                  className="btn btn-secondary flex-1 btn-sm" 
                  onClick={() => onCoachEmployee && onCoachEmployee(employee)}
                >
                  GROW Coach 🧠
                </button>
                <button 
                  className="btn btn-accent flex-1 btn-sm" 
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
