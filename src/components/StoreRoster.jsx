import React, { useState } from 'react';
import { Users, Search, AlertTriangle, CheckCircle, TrendingUp, Sparkles, Clock, HelpCircle } from 'lucide-react';

export default function StoreRoster({ roster, onCoachEmployee, onCreateLog, deptGoals = {
  'Front End': { memberships: 3, creditCards: 2, warranty: 11.0, surveys: 1.0, rph: 640 },
  'Appliances': { memberships: 2, creditCards: 2, warranty: 12.0, surveys: 1.0, rph: 1200 },
  'Computing': { memberships: 4, creditCards: 2, warranty: 11.0, surveys: 1.0, rph: 900 },
  'Mobile': { memberships: 3, creditCards: 2, warranty: 8.0, surveys: 1.0, rph: 700 },
  'Home Theatre': { memberships: 4, creditCards: 2, warranty: 11.0, surveys: 1.0, rph: 800 },
  'Geek Squad': { memberships: 5, creditCards: 1, warranty: 12.0, surveys: 1.0, rph: 500 }
} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  const DEPARTMENTS = ['All', 'Front End', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  const DEFAULT_GOALS = {
    memberships: 8.0, membershipsType: 'Hours', 
    creditCards: 12.5, creditCardsType: 'Hours', 
    warranty: 11.0, surveys: 1.0, rph: 640 
  };

  // Audits employee metrics dynamically based on their department goals!
  const getMetricClass = (val, type, dept, emp) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || DEFAULT_GOALS;
    const target = goals[type] !== undefined ? goals[type] : (DEFAULT_GOALS[type] || 0);
    const typeKey = type + 'Type';
    const isHoursType = goals[typeKey] === 'Hours';
    const isDollarsType = goals[typeKey] === 'Dollars';

    if (type === 'memberships') {
      if (isHoursType) {
        // Evaluate memberships by Hours Worked Pace (1 membership per X hours)
        // lower pace (fewer hours per membership) is better!
        const pace = emp.hours / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 3.0 ? 'text-warning' : 'text-danger';
      } else if (isDollarsType) {
        // Evaluate memberships by Dollar Revenue Pace (1 membership per $D revenue)
        // lower pace (fewer dollars per membership) is better!
        const revenue = emp.hours * emp.rph;
        const pace = revenue / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 2000 ? 'text-warning' : 'text-danger';
      }
      return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
    }

    if (type === 'creditCards') {
      if (isHoursType) {
        // Evaluate credit cards by Hours Worked Pace (1 app per X hours)
        const pace = emp.hours / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 4.0 ? 'text-warning' : 'text-danger';
      } else if (isDollarsType) {
        // Evaluate credit cards by Dollar Revenue Pace (1 app per $D revenue)
        const revenue = emp.hours * emp.rph;
        const pace = revenue / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 3000 ? 'text-warning' : 'text-danger';
      }
      return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
    }

    if (type === 'warranty') {
      return val >= target ? 'text-success' : val >= target - 3.0 ? 'text-warning' : 'text-danger';
    }
    if (type === 'surveys') {
      return val >= target ? 'text-success' : 'text-danger';
    }
    if (type === 'rph') {
      return val >= target ? 'text-success' : val >= target - 150 ? 'text-warning' : 'text-danger';
    }
    return '';
  };

  const getPaceText = (val, type, dept, emp) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || DEFAULT_GOALS;
    const typeKey = type + 'Type';
    const isHoursType = goals[typeKey] === 'Hours';
    const isDollarsType = goals[typeKey] === 'Dollars';

    if (!val || val === 0) return 'No pace';

    if (isHoursType) {
      // 1 app/memb per X hours
      const pace = emp.hours / val;
      return `1 in ${pace.toFixed(1)} hrs`;
    } else if (isDollarsType) {
      // 1 app/memb per $D revenue
      const revenue = emp.hours * emp.rph;
      const pace = revenue / val;
      return `1 in $${Math.round(pace / 100) / 10}k rev`;
    }
    return '';
  };

  const getStatusBadge = (gap) => {
    if (gap === 'None' || !gap || gap.startsWith('None')) {
      return (
        <span className="tag-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle size={12} style={{ marginRight: '0.25rem' }} /> Hitting Target
        </span>
      );
    }
    return (
      <span className="tag-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} /> Gap: {gap}
      </span>
    );
  };

  const filteredRoster = roster.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = activeDept === 'All' || emp.dept === activeDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Store Performance Roster</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review last month's performance logs and hours. Audited dynamically against department-specific goals.</p>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Department Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {DEPARTMENTS.map(dept => (
            <button 
              key={dept} 
              className={`tag-pill ${activeDept === dept ? 'tag-pill-active' : ''}`}
              style={{ cursor: 'pointer', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search associates by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '11px', left: '0.85rem' }} />
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(16, 24, 48, 0.7)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Associate</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}><Clock size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />Hours</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>Memberships</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>BBY Cards</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>Warranty/GSP</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>5-Star CSAT</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>RPH</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p>No associates match your active filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map(emp => (
                  <tr 
                    key={emp.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-glass)',
                      background: 'rgba(255,255,255,0.01)',
                      transition: 'background 0.25s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#fff' }}>
                      {emp.name}
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {emp.hours} hrs
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {emp.dept}
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.memberships, 'memberships', emp.dept, emp)}>
                      <div>{emp.memberships} Membs</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        ({getPaceText(emp.memberships, 'memberships', emp.dept, emp)})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.creditCards, 'creditCards', emp.dept, emp)}>
                      <div>{emp.creditCards} Apps</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        ({getPaceText(emp.creditCards, 'creditCards', emp.dept, emp)})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.warranty, 'warranty', emp.dept, emp)}>
                      {emp.warranty}%
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.surveys, 'surveys', emp.dept, emp)}>
                      {emp.surveys === 0.2 ? 'Failing' : `${emp.surveys} Five-Star`}
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.rph, 'rph', emp.dept, emp)}>
                      ${emp.rph}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {getStatusBadge(emp.gap)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => onCoachEmployee(emp)}
                        >
                          Coach
                        </button>
                        <button 
                          className="btn btn-accent" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#000' }}
                          onClick={() => onCreateLog(emp)}
                        >
                          Log Builder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Targets Matrix Cheat Sheet */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
          <HelpCircle size={18} /> Department-Specific Goals matrix
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          Best Buy standards adapt to match department specialties (e.g. Major Appliances prioritizes higher GSP% and RPH, while Computing prioritizes total Memberships).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {Object.entries(deptGoals || {}).map(([dept, targets]) => (
            <div 
              key={dept} 
              style={{ 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '12px',
                fontSize: '0.775rem'
              }}
            >
              <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                {dept}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong>Memberships:</strong> {targets.membershipsType === 'Hours' ? `1 in ${targets.memberships} hrs` : targets.membershipsType === 'Dollars' ? `1 in $${(targets.memberships / 1000).toFixed(0)}k sales` : `${targets.memberships} goal`}
                </div>
                <div>
                  <strong>BBY Cards:</strong> {targets.creditCardsType === 'Hours' ? `1 in ${targets.creditCards} hrs` : targets.creditCardsType === 'Dollars' ? `1 in $${(targets.creditCards / 1000).toFixed(0)}k sales` : `${targets.creditCards} goal`}
                </div>
                <div><strong>GSP Attach:</strong> {targets.warranty}% attach</div>
                <div><strong>CSAT surveys:</strong> {targets.surveys} five-star</div>
                <div><strong>RPH index:</strong> ${targets.rph}/hr target</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
