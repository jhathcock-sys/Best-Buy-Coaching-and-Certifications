import React, { useMemo, useState } from 'react';
import { Award, TrendingUp, Compass, ShieldCheck, CreditCard, Star, DollarSign, ArrowUpRight, MessageSquare, Play, ClipboardList, Check, AlertCircle } from 'lucide-react';
export default function Dashboard({ 
  metrics, 
  certifications, 
  recentSessions, 
  onNavigate, 
  roster = [], 
  followUpTasks = [], 
  onCompleteFollowUpTask, 
  deptGoals = {}, 
  onCoachEmployee, 
  onCreateLog, 
  onShadowEmployee,
  floorLeaderShifts = [],
  coachingLogs = [],
  activePeriod,
  rosterHistory = {}
}) {
  const [rankMetric, setRankMetric] = useState('memberships');
  const [chartMetric, setChartMetric] = useState('memberships');

  // 1. Focus 5 Shift Alerts calculation
  const activeFocus5Alerts = useMemo(() => {
    if (!floorLeaderShifts || floorLeaderShifts.length === 0) return [];
    
    const sortedShifts = [...floorLeaderShifts].sort((a, b) => b.timestamp - a.timestamp);
    const mostRecentShift = sortedShifts[0];
    
    const todayStr = new Date().toLocaleDateString();
    if (mostRecentShift.date !== todayStr) return [];
    
    const zoneAssignments = mostRecentShift.zoneAssignments || {};
    const alerts = [];
    
    const todayStart = new Date().setHours(0,0,0,0);
    const todayLogs = (coachingLogs || []).filter(log => {
      const logTime = log.timestamp || 0;
      return logTime >= todayStart;
    });

    Object.keys(zoneAssignments).forEach(zone => {
      const empIds = zoneAssignments[zone] || [];
      empIds.forEach(empId => {
        const emp = roster.find(e => e.id === empId);
        if (emp && emp.focus5) {
          const hasLogToday = todayLogs.some(log => log.employeeId === empId || log.employeeName === emp.name);
          if (!hasLogToday) {
            alerts.push({
              employee: emp,
              zone: zone
            });
          }
        }
      });
    });
    
    return alerts;
  }, [floorLeaderShifts, coachingLogs, roster]);

  // 2. Heatmap logs calculation
  const activePeriodLogs = useMemo(() => {
    if (!activePeriod) return coachingLogs || [];
    const [activeMonthStr, activeYearStr] = activePeriod.split(' ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeMonthIdx = months.findIndex(m => activeMonthStr.startsWith(m));
    
    return (coachingLogs || []).filter(log => {
      const logDate = log.timestamp ? new Date(log.timestamp) : new Date(log.date);
      if (isNaN(logDate.getTime())) return true;
      
      const logMonth = logDate.getMonth();
      const logYear = logDate.getFullYear();
      
      return logMonth === activeMonthIdx && logYear === parseInt(activeYearStr);
    });
  }, [coachingLogs, activePeriod]);

  // 3. Heatmap counts grouping
  const shadowingHeatmapData = useMemo(() => {
    const counts = {
      'Front End': 0,
      'Computing': 0,
      'Mobile': 0,
      'Home Theatre': 0,
      'Geek Squad': 0,
      'Appliances': 0
    };
    
    activePeriodLogs.forEach(log => {
      const emp = roster.find(e => e.id === log.employeeId || e.name === log.employeeName);
      const dept = emp ? emp.dept : null;
      if (dept && dept in counts) {
        counts[dept]++;
      } else {
        for (const period of Object.keys(rosterHistory)) {
          const histEmp = rosterHistory[period]?.find(e => e.id === log.employeeId || e.name === log.employeeName);
          if (histEmp && histEmp.dept in counts) {
            counts[histEmp.dept]++;
            break;
          }
        }
      }
    });
    
    return counts;
  }, [activePeriodLogs, roster, rosterHistory]);

  const chartData = useMemo(() => {
    const isMemb = chartMetric === 'memberships';
    const currentVal = isMemb ? (metrics?.memberships || 52) : (metrics?.creditCards || 4);
    
    const w1 = isMemb ? 42 : Math.max(1, currentVal - 3);
    const w2 = isMemb ? 47 : Math.max(2, currentVal - 1);
    const w3 = isMemb ? 49 : Math.max(1, currentVal - 2);
    const w4 = currentVal;

    const values = [w1, w2, w3, w4];
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const xCoords = [80, 200, 320, 440];

    const points = values.map((val, idx) => {
      const x = xCoords[idx];
      const maxRange = isMemb ? 100 : 10;
      const y = 170 - (val / maxRange) * 140;
      return { x, y, value: val, label: labels[idx] };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L 440 170 L 80 170 Z`;

    return { points, linePath, areaPath };
  }, [metrics, chartMetric]);

  const { points, linePath, areaPath } = chartData;

  const pendingTasks = useMemo(() => {
    return (followUpTasks || []).filter(task => !task.completed);
  }, [followUpTasks]);

  const leaderboardData = useMemo(() => {
    if (!Array.isArray(roster)) return [];
    return [...roster]
      .sort((a, b) => {
        const valA = rankMetric === 'surveys' && a.surveys === 0.2 ? 0 : parseFloat(a[rankMetric]) || 0;
        const valB = rankMetric === 'surveys' && b.surveys === 0.2 ? 0 : parseFloat(b[rankMetric]) || 0;
        return valB - valA;
      })
      .slice(0, 5);
  }, [roster, rankMetric]);
  // Circular Gauge Helper
  const CircularGauge = ({ value, max = 100, label, suffix = "%", color, icon: Icon, description }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="glass-card metric-card">
        <div className="metric-circle-container">
          <svg className="metric-svg">
            <circle className="metric-circle-bg" cx="55" cy="55" r={radius} />
            <circle 
              className="metric-circle-fill" 
              cx="55" 
              cy="55" 
              r={radius} 
              stroke={color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="metric-val">
            {value}{suffix}
          </div>
        </div>
        <div className="metric-label">{label}</div>
        <div className="metric-sub">{description}</div>
        <Icon style={{ color: color, position: 'absolute', top: '1rem', right: '1rem', opacity: 0.15, width: 24, height: 24 }} />
      </div>
    );
  };

  // Get active suggestions based on metric thresholds
  const suggestions = useMemo(() => {
    const list = [];
    if (metrics.memberships < 60) {
      list.push({
        id: 1,
        type: 'warning',
        text: 'Membership attach rate is currently 52% (Goal: 65%). Practice pitching My Best Buy Total early in discovery.',
        actionLabel: 'Total Support Roleplay',
        navTarget: 'roleplay'
      });
    }
    if (metrics.warranty < 15) {
      list.push({
        id: 2,
        type: 'info',
        text: 'Geek Squad Protection attach rate is 12% (Goal: 18%). Try the OLED TV setup scenario to practice warranty attach.',
        actionLabel: 'HT OLED Roleplay',
        navTarget: 'roleplay'
      });
    }
    if (metrics.surveys < 4.8) {
      list.push({
        id: 3,
        type: 'warning',
        text: 'Customer 5-Star Survey Index is 4.7. Try building stronger rapport at the beginning of interactions.',
        actionLabel: 'Connect Training',
        navTarget: 'roleplay'
      });
    }
    if (list.length === 0) {
      list.push({
        id: 0,
        type: 'success',
        text: 'All core sales metrics are currently meeting or exceeding store goals. Excellent job maintaining Best Buy standards!',
        actionLabel: 'Take HT Exam',
        navTarget: 'certification'
      });
    }
    return list;
  }, [metrics]);

  // Compute Automated Coaching Recommendations
  const coachingRecommendations = useMemo(() => {
    if (!Array.isArray(roster) || roster.length === 0) return [];

    // Helper to identify gaps for an employee, matching StoreRoster logic
    const getEmployeeGaps = (emp) => {
      const gaps = [];
      const goals = (deptGoals && deptGoals[emp.dept]) || { memberships: 8, creditCards: 12.5, warranty: 11, surveys: 1, rph: 640 };
      
      // memberships check
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

      // credit cards check
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

      // warranty attach check
      if (emp.warranty < (goals.warranty || 0)) gaps.push('GSP Attach');

      // surveys check
      const surveyVal = emp.surveys === 0.2 ? 0 : parseFloat(emp.surveys) || 0;
      if (surveyVal < (goals.surveys || 0)) gaps.push('Surveys');

      // rph check
      if (emp.rph < (goals.rph || 0)) gaps.push('RPH');

      // basket check
      if ((emp.dept === 'Computing' || emp.dept === 'Home Theatre') && emp.basket < (goals.basket || 150)) {
        gaps.push('Basket');
      }

      // m365 check
      if (emp.dept === 'Computing' && emp.m365 < (goals.m365 || 60)) {
        gaps.push('M365 Attach');
      }

      // audio check
      if (emp.dept === 'Home Theatre' && emp.audio < (goals.audio || 35)) {
        gaps.push('Audio Attach');
      }

      return gaps;
    };

    const scored = roster.map(emp => {
      const gaps = getEmployeeGaps(emp);
      let score = gaps.length * 10;

      // Focus 5 boost: +1000 points
      if (emp.focus5) {
        score += 1000;
      }

      // Find last coaching/shadowing session recency in recentSessions
      const empSessions = (recentSessions || []).filter(s => 
        (s.employeeName && s.employeeName.toLowerCase() === emp.name.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase() === emp.name.toLowerCase())
      );

      let lastCoachedDaysAgo = 999;
      if (empSessions.length > 0) {
        // Find most recent session date
        const dates = empSessions.map(s => {
          const d = new Date(s.date);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        }).filter(t => t > 0);

        if (dates.length > 0) {
          const mostRecentTime = Math.max(...dates);
          const diffMs = Date.now() - mostRecentTime;
          lastCoachedDaysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      if (lastCoachedDaysAgo === 999) {
        score += 50; // Never coached bonus
      } else {
        score += lastCoachedDaysAgo; // Coached long ago bonus
      }

      // Scheduled hours weight
      score += (parseFloat(emp.hours) || 0) * 0.5;

      return {
        employee: emp,
        gaps,
        score,
        lastCoachedDaysAgo,
        focus5: emp.focus5 || false
      };
    });

    // Sort by score descending and return top 3
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [roster, recentSessions, deptGoals]);

  const activeCerts = useMemo(() => {
    return certifications.filter(c => c.earned).length;
  }, [certifications]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Advisor Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Advisor. Here is your current sales performance and coaching checklist.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('playbook')}>
            <TrendingUp size={16} /> Playbook Studio
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('roleplay')}>
            <Play size={16} fill="white" /> Start Practice
          </button>
        </div>
      </div>

      {/* Focus 5 Alerts Console */}
      {activeFocus5Alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.4s ease' }}>
          {activeFocus5Alerts.map(({ employee, zone }) => (
            <div 
              key={employee.id}
              className="glass-card" 
              style={{ 
                borderLeft: '4px solid var(--error)', 
                background: 'rgba(239, 68, 68, 0.08)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle color="var(--error)" size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
                    Focus 5 Validation Warning
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <strong>{employee.name}</strong> (Zoned in <strong>{zone}</strong>) has no observations logged today. Shadow them on the floor to validate behavior.
                  </p>
                </div>
              </div>
              <button 
                className="btn btn-accent" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={() => onShadowEmployee && onShadowEmployee(employee)}
              >
                Shadow Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Core Metrics Grid */}
      <div className="metrics-grid">
        <CircularGauge 
          value={metrics.memberships} 
          label="Membership Attach" 
          suffix="%"
          color="var(--bby-blue)" 
          icon={Compass} 
          description="Plus & Total Memberships"
        />
        <div className="glass-card metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255, 230, 0, 0.08)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', border: '1px solid rgba(255, 230, 0, 0.2)' }}>
            <CreditCard size={32} color="var(--bby-yellow)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>{metrics.creditCards}</div>
          <div className="metric-label" style={{ marginTop: '0.25rem' }}>BBY Credit Cards</div>
          <div className="metric-sub">Submitted Applications</div>
        </div>
        <CircularGauge 
          value={metrics.warranty} 
          label="Protection Attach" 
          suffix="%"
          color="var(--success)" 
          icon={ShieldCheck} 
          description="Geek Squad Protection"
        />
        <CircularGauge 
          value={metrics.surveys} 
          max={5}
          label="5-Star Surveys" 
          suffix="/5"
          color="var(--info)" 
          icon={Star} 
          description="Customer Survey Index"
        />
        <div className="glass-card metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <DollarSign size={32} color="var(--info)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>${metrics.rph}</div>
          <div className="metric-label" style={{ marginTop: '0.25rem' }}>RPH</div>
          <div className="metric-sub">Revenue Per Hour (Goal: $1,200)</div>
        </div>
        <div className="glass-card metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <ClipboardList size={32} color="var(--success)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>{recentSessions ? recentSessions.length : 0}</div>
          <div className="metric-label" style={{ marginTop: '0.25rem' }}>Observations Logged</div>
          <div className="metric-sub">Coaching & Roleplays Completed</div>
        </div>
      </div>
      
      {/* Performance Trends Chart */}
      <div className="glass-card" style={{ padding: '1.75rem', width: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <TrendingUp size={20} color="var(--bby-yellow)" /> Performance Trends
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.15rem 0 0 0' }}>Weekly progress overview across the last 4 periods</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ 
                padding: '0.35rem 0.75rem', 
                fontSize: '0.75rem', 
                background: chartMetric === 'memberships' ? 'var(--bby-blue)' : 'transparent',
                borderColor: 'transparent',
                color: '#fff',
                margin: 0
              }}
              onClick={() => setChartMetric('memberships')}
            >
              Memberships Attach
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ 
                padding: '0.35rem 0.75rem', 
                fontSize: '0.75rem', 
                background: chartMetric === 'creditCards' ? 'var(--bby-blue)' : 'transparent',
                borderColor: 'transparent',
                color: '#fff',
                margin: 0
              }}
              onClick={() => setChartMetric('creditCards')}
            >
              Credit Cards
            </button>
          </div>
        </div>

        {/* SVG Render Container */}
        <div style={{ width: '100%', height: '220px', background: 'rgba(11, 15, 25, 0.2)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chart-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--bby-blue)" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="var(--bby-blue)" stopOpacity="0.0"/>
              </linearGradient>
              <linearGradient id="chart-yellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--bby-yellow)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--bby-yellow)" stopOpacity="0.0"/>
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
            <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
            <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" />

            {/* Y-Axis scale labels */}
            {chartMetric === 'memberships' ? (
              <>
                <text x="30" y="35" fill="var(--text-muted)" fontSize="9" textAnchor="end">80%</text>
                <text x="30" y="85" fill="var(--text-muted)" fontSize="9" textAnchor="end">50%</text>
                <text x="30" y="135" fill="var(--text-muted)" fontSize="9" textAnchor="end">20%</text>
              </>
            ) : (
              <>
                <text x="30" y="35" fill="var(--text-muted)" fontSize="9" textAnchor="end">8 Apps</text>
                <text x="30" y="85" fill="var(--text-muted)" fontSize="9" textAnchor="end">4 Apps</text>
                <text x="30" y="135" fill="var(--text-muted)" fontSize="9" textAnchor="end">1 App</text>
              </>
            )}

            {/* Render Areas */}
            <path d={areaPath} fill={chartMetric === 'memberships' ? 'url(#chart-blue)' : 'url(#chart-yellow)'} />
            <path d={linePath} fill="none" stroke={chartMetric === 'memberships' ? 'var(--bby-blue)' : 'var(--bby-yellow)'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points and Hover Labels */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="5" fill={chartMetric === 'memberships' ? 'var(--bby-blue)' : 'var(--bby-yellow)'} stroke="#0b0f19" strokeWidth="1.5" />
                <text x={p.x} y={p.y - 12} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  {p.value}{chartMetric === 'memberships' ? '%' : ''}
                </text>
                <text x={p.x} y="188" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Shadowing Coverage Heatmap */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem 0' }}>
          <ShieldCheck size={20} color="var(--bby-blue)" /> Shadowing Coverage Heatmap
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 1.5rem 0' }}>
          Real-time shadowing observations logged by department for active period (<strong>{activePeriod}</strong>). Deep red highlights departments requiring focus.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1.25rem' 
        }}>
          {Object.entries(shadowingHeatmapData).map(([dept, count]) => {
            const hue = Math.min(count * 45, 180);
            const cellColor = `hsl(${hue}, 70%, 20%)`;
            const borderColor = `hsl(${hue}, 70%, 35%)`;
            return (
              <div 
                key={dept} 
                style={{ 
                  background: `linear-gradient(135deg, ${cellColor}, rgba(255,255,255,0.02))`, 
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  minHeight: '100px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(${hue === 0 ? '239, 68, 68' : '16, 185, 129'}, 0.2)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {dept}
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)', margin: '0.25rem 0' }}>
                  {count}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {count === 1 ? 'Observation' : 'Observations'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Certifications & Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Automated Coaching Recommendations Engine */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--error)" /> Daily Coaching Priorities
            </h3>
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
                        onClick={() => onCreateLog && onCreateLog(employee)}
                      >
                        Log Builder 📝
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coaching Recommendations */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--bby-yellow)" /> Smart Co-Coach Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestions.map(s => (
                <div 
                  key={s.id} 
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: '12px', 
                    background: s.type === 'warning' ? 'var(--warning-glow)' : s.type === 'success' ? 'var(--success-glow)' : 'var(--info-glow)', 
                    border: `1.5px solid ${s.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : s.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: s.type === 'warning' ? '#fde047' : s.type === 'success' ? '#a7f3d0' : '#a5f3fc', lineHeight: 1.5 }}>
                    {s.text}
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ alignSelf: 'flex-start', padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    onClick={() => onNavigate(s.navTarget)}
                  >
                    {s.actionLabel} <ArrowUpRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--bby-blue)" /> Certification Status
              </h3>
              <span className="tag-pill tag-pill-active">{activeCerts} of {certifications.length} Earned</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {certifications.slice(0, 3).map(cert => (
                <div 
                  key={cert.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      padding: '0.5rem', 
                      borderRadius: '8px', 
                      background: cert.earned ? 'rgba(255, 230, 0, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${cert.earned ? 'rgba(255,230,0,0.3)' : 'var(--border-glass)'}`
                    }}>
                      <Award size={20} color={cert.earned ? 'var(--bby-yellow)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{cert.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cert.category}</p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: cert.earned ? 'var(--bby-yellow)' : 'var(--text-muted)' 
                  }}>
                    {cert.earned ? 'EARNED' : 'LOCKED'}
                  </span>
                </div>
              ))}
              <button className="btn btn-secondary" style={{ width: '100%', padding: '0.65rem' }} onClick={() => onNavigate('certification')}>
                View Certification Center
              </button>
            </div>
          </div>

          {/* Store Performance Leaderboard */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <TrendingUp size={20} color="var(--bby-yellow)" /> Store Leaderboard
              </h3>
              <select 
                value={rankMetric} 
                onChange={(e) => setRankMetric(e.target.value)}
                className="form-control"
                style={{ 
                  width: 'auto', 
                  padding: '0.35rem 1.75rem 0.35rem 0.75rem', 
                  fontSize: '0.8rem', 
                  height: '32px',
                  background: 'rgba(11, 15, 25, 0.8)',
                  borderColor: 'var(--border-glass)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="memberships">Memberships</option>
                <option value="creditCards">Credit Cards</option>
                <option value="warranty">GSP Attach %</option>
                <option value="surveys">Surveys</option>
                <option value="rph">RPH Index</option>
                <option value="basket">Basket Size ($)</option>
                <option value="m365">M365 Attach %</option>
                <option value="audio">Audio Attach %</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboardData.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No roster data available for rankings.</p>
              ) : (
                leaderboardData.map((emp, index) => {
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}th`;
                  const valDisplay = 
                    rankMetric === 'memberships' ? `${emp.memberships} Membs` :
                    rankMetric === 'creditCards' ? `${emp.creditCards} Apps` :
                    rankMetric === 'warranty' ? `${emp.warranty}% GSP` :
                    rankMetric === 'surveys' ? (emp.surveys === 0.2 ? 'Failing' : `${emp.surveys} ★`) :
                    rankMetric === 'basket' ? `$${parseFloat(emp.basket || 0).toFixed(2)}` :
                    rankMetric === 'm365' ? `${emp.m365 || 0}% M365` :
                    rankMetric === 'audio' ? `${emp.audio || 0}% Audio` :
                    `$${emp.rph}/hr`;

                  return (
                    <div 
                      key={emp.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255, 255, 255, 0.01)', 
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, width: '28px', color: index < 3 ? 'inherit' : 'var(--text-muted)' }}>
                          {medal}
                        </span>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', margin: 0, color: '#fff' }}>{emp.name}</h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.dept}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: index === 0 ? 'var(--bby-yellow)' : 'var(--text-secondary)' }}>
                        {valDisplay}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Validation Commitments & Recent Sessions Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Validation Commitments Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--bby-yellow)" /> Active Validation Commitments
            </h3>
            
            {pendingTasks.length === 0 ? (
              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '12px', 
                background: 'var(--success-glow)', 
                border: '1.5px solid rgba(16, 185, 129, 0.15)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.95rem', color: '#a7f3d0', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Check size={16} /> All commitments completed!
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  No pending floor shadowings scheduled at this time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingTasks.map(task => (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '1.25rem', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    className="commitment-card-hover"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', margin: 0, color: '#fff', fontWeight: 600 }}>{task.employeeName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.department}</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--bby-yellow)', 
                        background: 'rgba(255, 230, 0, 0.06)', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 230, 0, 0.2)',
                        fontWeight: 600
                      }}>
                        Due {new Date(task.dueDate + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      {task.action}
                    </p>
                    
                    <button 
                      className="btn"
                      style={{ 
                        alignSelf: 'flex-start', 
                        padding: '0.4rem 0.85rem', 
                        fontSize: '0.75rem', 
                        background: 'rgba(16, 185, 129, 0.12)', 
                        border: '1.5px solid rgba(16, 185, 129, 0.25)',
                        color: 'var(--success)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'background var(--transition-fast)'
                      }}
                      onClick={() => onCompleteFollowUpTask(task.id)}
                    >
                      <Check size={14} /> Complete Shadowing
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions Log */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} color="var(--info)" /> Recent Coaching & Roleplay Sessions
            </h3>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentSessions.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.95rem' }}>No roleplays completed yet.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Start your first training customer simulation to see metrics and feedback logs.</p>
                </div>
              ) : (
                recentSessions.map((session, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-glass)', 
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={session.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                        <h4 style={{ fontSize: '0.9rem' }}>{session.customerName}</h4>
                      </div>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px', 
                        background: session.score >= 80 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: session.score >= 80 ? 'var(--success)' : 'var(--error)'
                      }}>
                        Score: {session.score}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Category: {session.category}</span>
                      <span>{session.date}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      "{session.notes.substring(0, 100)}..."
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
