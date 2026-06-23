import { useMemo } from 'react';

interface DashboardSystemAlertsProps {
  roster: any[];
  rosterHistory: any;
  calculatedMetrics: any;
  activePeriod: string;
  onNavigate: (view: string) => void;
}

export default function DashboardSystemAlerts({ 
  roster, 
  rosterHistory, 
  calculatedMetrics, 
  activePeriod, 
  onNavigate 
}: DashboardSystemAlertsProps) {
  
  const systemAlerts = useMemo(() => {
    const list: any[] = [];
    if (!roster || roster.length === 0) return list;

    // 1. Employee Drop Alerts
    const periods = Object.keys(rosterHistory).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    const currentIndex = periods.indexOf(activePeriod);
    if (currentIndex >= 0 && currentIndex < periods.length - 1) {
      const pastPeriod = periods[currentIndex + 1];
      const pastRosterMap = rosterHistory[pastPeriod];
      
      if (pastRosterMap) {
        roster.forEach(emp => {
          const pastEmp = pastRosterMap[emp.id] || Object.values(pastRosterMap).find((e: any) => e.name === emp.name);
          if (!pastEmp) return;

          const checkDrop = (metricKey: string, label: string) => {
            const currentVal = (emp as any)[metricKey] || 0;
            const pastVal = pastEmp[metricKey] || 0;
            
            if (pastVal > 0) {
              const dropPercent = ((pastVal - currentVal) / pastVal) * 100;
              if (dropPercent >= 15 && pastVal >= (metricKey === 'warranty' ? 5 : metricKey === 'surveys' ? 3 : 500)) {
                list.push({
                  id: `trend-${emp.id}-${metricKey}`,
                  type: 'warning',
                  text: `🚨 ${emp.name}'s ${label} dropped by ${Math.round(dropPercent)}% compared to last week (from ${pastVal}${metricKey === 'warranty' ? '%' : ''} down to ${currentVal}${metricKey === 'warranty' ? '%' : ''}). Assign a coaching shadow.`,
                  actionLabel: `Shadow ${emp.name.split(' ')[0]}`,
                  navTarget: 'shadow'
                });
              }
            }
          };

          checkDrop('warranty', 'Protection Attach');
          checkDrop('surveys', 'Customer 5-Star Index');
          checkDrop('rph', 'Revenue Per Hour');
        });
      }
    }

    // 2. Store-Wide Metric Insights
    if (!calculatedMetrics) return list;

    if (calculatedMetrics.memberships < 60) {
      list.push({
        id: 1,
        type: 'warning',
        text: `Membership attach count is currently ${calculatedMetrics.memberships}. Practice pitching My Best Buy Total early in discovery.`,
        actionLabel: 'Total Support Roleplay',
        navTarget: 'roleplay'
      });
    }

    if (calculatedMetrics.warranty < 15) {
      list.push({
        id: 2,
        type: 'warning',
        text: `Geek Squad Protection attach rate is ${calculatedMetrics.warranty}% (Goal: 18%). Try the OLED TV setup scenario to practice warranty attach.`,
        actionLabel: 'HT OLED Roleplay',
        navTarget: 'roleplay'
      });
    }

    // Store goal is roughly 1 survey per employee per period. Alert if we're under 50% of that goal.
    const surveyGoal = roster.length > 0 ? roster.length : 10;
    if (calculatedMetrics.surveys < (surveyGoal * 0.5)) {
      list.push({
        id: 3,
        type: 'warning',
        text: `The store only has ${calculatedMetrics.surveys} 5-Star Surveys (Goal: ${surveyGoal}). Try building stronger rapport at the beginning of interactions.`,
        actionLabel: 'Connect Training',
        navTarget: 'roleplay'
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'default-success',
        type: 'success',
        text: 'All core sales metrics are currently meeting or exceeding store goals. Excellent job maintaining Best Buy standards!',
        actionLabel: 'Start Practice',
        navTarget: 'roleplay'
      });
    }

    return list;
  }, [roster, rosterHistory, activePeriod, calculatedMetrics]);

  if (systemAlerts.length === 0) return null;

  return (
    <div className="flex-column gap-md mb-sm">
      {systemAlerts.map(alert => (
        <div 
          key={alert.id}
          className={`glass-card flex-between flex-wrap gap-md p-lg alert-card-${alert.type}`} 
        >
          <div className="flex-center justify-start gap-sm">
            <div 
              className="rounded-full" 
              style={{ 
                width: 8, height: 8, 
                background: alert.type === 'success' ? 'var(--success)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--error)', 
                boxShadow: `0 0 10px ${alert.type === 'success' ? 'var(--success)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--error)'}` 
              }} 
            />
            <span className="text-white font-semibold" style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
              {alert.text}
            </span>
          </div>
          <button 
            className={`btn btn-sm ${alert.type === 'success' ? 'btn-primary bg-success text-white' : 'btn-secondary'}`}
            onClick={() => onNavigate(alert.navTarget)}
            style={{ 
              ...(alert.type === 'success' && { border: 'none', color: '#000' })
            }}
          >
            {alert.actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
