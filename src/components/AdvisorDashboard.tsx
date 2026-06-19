import React from 'react';
import { Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import MetricCards from './Dashboard/MetricCards';
import CoachingHistory from './CoachingHistory';

interface AdvisorDashboardProps {
  employee: any;
  coachingLogs: any[];
  activePeriod: string;
  deptGoals: any;
  onNavigate: (view: string) => void;
}

export default function AdvisorDashboard({ employee, coachingLogs, activePeriod, deptGoals, onNavigate }: AdvisorDashboardProps) {
  // Filter coaching logs specifically for this employee
  const myLogs = coachingLogs.filter((log: any) => 
    log.employeeId === employee.id || log.employeeName === employee.name
  );

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Welcome back, {employee.name.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {employee.dept} Advisor • ID: {employee.id || employee.employeeId || 'N/A'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('roleplay')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bby-blue)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '20px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 70, 190, 0.3)'
          }}
        >
          <Target size={18} />
          Practice in AI Simulator
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--bby-yellow)" />
          My Performance ({activePeriod})
        </h2>
        
        {/* We reuse the MetricCards component but pass an array containing just this employee to simulate the "roster" average */}
                <MetricCards 
          calculatedMetrics={{
            memberships: employee.memberships || 0,
            creditCards: employee.creditCards || 0,
            warranty: employee.warranty || 0,
            surveys: employee.surveys || 0,
            rph: employee.rph || 0,
            basket: employee.basket || 0,
            m365: employee.m365 || 0,
            audio: employee.audio || 0,
            focus5: employee.focus5 || 0,
            hours: employee.hours || 0,
            employeesWithMemberships: employee.memberships > 0 ? 1 : 0,
            employeesWithCreditCards: employee.creditCards > 0 ? 1 : 0
          }}
          recentSessions={myLogs} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: '20px', border: '1px solid var(--border-glass)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="#10b981" />
            My Recent Feedback & GROW Logs
          </h2>
          {myLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recent coaching logs found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myLogs.map((log: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--bby-yellow)' }}>{log.discFocus}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {log.date} by {log.coachName}
                    </span>
                  </div>
                  <div 
                    style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.5 }}
                    dangerouslySetInnerHTML={{ __html: log.coachingPlanMd?.substring(0, 300) + '...' || 'Review completed.' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
