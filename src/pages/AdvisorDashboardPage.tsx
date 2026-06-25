import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Target, TrendingUp, Calendar, CheckCircle, Award, Trophy, Medal, Zap, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import MetricCards from '../components/Dashboard/MetricCards';

interface AdvisorDashboardProps {
  employee: any;
  onNavigate: (view: string) => void;
}

const EMPTY_ARR: any[] = [];
const EMPTY_OBJ = {};

export default function AdvisorDashboard({ employee, onNavigate }: AdvisorDashboardProps) {
  const coachingLogs = useStore(state => state.coachingLogs) || EMPTY_ARR;
  const activePeriod = useStore(state => state.activePeriod);
  const storeDeptGoals = useStore(state => state.deptGoals);
  // Filter coaching logs specifically for this employee
  const myLogs = coachingLogs.filter((log: any) => 
    log.employeeId === employee.id || log.employeeName === employee.name
  );

  const rosterHistory = useStore(state => state.rosterHistory);
  const _rawactiveRoster = rosterHistory?.[activePeriod] || EMPTY_OBJ;
  const activeRoster = React.useMemo(() => (Object.values(_rawactiveRoster) as any[]).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawactiveRoster]);
  
  // Calculate Top 3 Roleplay Champions based on "Perfect Roleplay Score" trophies or general trophies
  const top3Champions = [...activeRoster]
    .filter(emp => emp.trophies && emp.trophies.length > 0)
    .sort((a, b) => b.trophies.length - a.trophies.length)
    .slice(0, 3);

  const getTrophyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Award size={20} color="var(--bby-yellow)" />;
      case 'ShieldCheck': return <CheckCircle size={20} color="var(--success)" />;
      default: return <Award size={20} color="var(--bby-yellow)" />;
    }
  };

  // XP & Tier System
  const totalXP = ((employee.memberships || 0) * 50) + ((employee.creditCards || 0) * 100) + ((employee.trophies?.length || 0) * 200) + (myLogs.length * 75);
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const xpProgress = totalXP % 500;

  // Daily Quests (Deterministic based on employee name length and date)
  const today = new Date().toLocaleDateString();
  const dailyQuests = [
    { 
      title: "Complete an AI Roleplay", 
      xp: 50, 
      completed: myLogs.length > 0 
    },
    { 
      title: "Secure 2 Memberships", 
      xp: 100, 
      completed: (employee.memberships || 0) >= 2 
    },
    { 
      title: "Review your Performance Metrics", 
      xp: 25, 
      completed: true 
    }
  ];

  return (
    <div className="p-xl h-full" data-testid="advisor-dashboard-container" style={{ overflowY: 'auto' }}>
      <div className="flex-between align-center mb-xl">
        <div>
          <h1 className="flex-center gap-md" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', justifyContent: 'flex-start' }}>
            Welcome back, {employee.name.split(' ')[0]}!
            <span className="flex-center gap-sm" style={{ fontSize: '1rem', background: 'var(--bby-yellow)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 900 }}>
              <Star size={16} /> Level {currentLevel}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
            {employee.dept} Advisor • ID: {employee.id || employee.employeeId || 'N/A'}
          </p>
          <div className="flex-center gap-md" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', width: 'fit-content' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>XP: {totalXP}</span>
            <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(xpProgress / 500) * 100}%`, height: '100%', background: 'var(--bby-blue)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{xpProgress}/500 to Next Level</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('roleplay')}
          className="flex-center gap-sm"
          style={{
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

      <div className="mb-xl">
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Personal Trophies */}
          <div style={{ background: 'var(--surface-1)', borderRadius: '20px', border: '1px solid var(--border-glass)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#8b5cf6" />
              My Trophy Case
            </h2>
            {(!employee.trophies || employee.trophies.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No trophies yet. Keep practicing in the AI Simulator!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {employee.trophies.map((trophy: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      {getTrophyIcon(trophy.icon)}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{trophy.type}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{trophy.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.coachingPlanMd ? log.coachingPlanMd.substring(0, 300) + '...' : 'Review completed.') }}
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        
        {/* Top 3 Leaderboard Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), transparent)', borderRadius: '20px', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <Trophy size={20} color="var(--bby-yellow)" />
              Top 3 Store Champions
            </h2>
            {top3Champions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No champions this period. Be the first!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {top3Champions.map((champ, idx) => (
                  <div key={champ.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', 
                    background: idx === 0 ? 'rgba(255, 230, 0, 0.1)' : 'rgba(255,255,255,0.03)', 
                    padding: '1rem', 
                    borderRadius: '12px',
                    border: idx === 0 ? '1px solid rgba(255, 230, 0, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      background: idx === 0 ? 'var(--bby-yellow)' : idx === 1 ? '#e2e8f0' : '#cd7f32',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#000', fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{champ.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{champ.trophies.length} Trophies</div>
                    </div>
                    {idx === 0 && <Medal size={24} color="var(--bby-yellow)" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Quests Panel */}
          <div style={{ background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.1), transparent)', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <Zap size={20} color="var(--info)" />
              Daily Quests
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dailyQuests.map((quest, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  border: quest.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                  opacity: quest.completed ? 0.7 : 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      border: quest.completed ? 'none' : '2px solid var(--text-muted)',
                      background: quest.completed ? 'var(--success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {quest.completed && <CheckCircle size={16} color="#fff" />}
                    </div>
                    <div style={{ fontWeight: 500, color: quest.completed ? 'var(--text-secondary)' : '#fff', textDecoration: quest.completed ? 'line-through' : 'none' }}>
                      {quest.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--bby-blue)' }}>
                    +{quest.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
