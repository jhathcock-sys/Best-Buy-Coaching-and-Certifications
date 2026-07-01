import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Target, TrendingUp, Calendar, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import MetricCards from '../components/Dashboard/MetricCards';
import { Employee, CoachingLog } from '../types';
import TrophyCase from '../components/Advisor/TrophyCase';
import AdvisorLeaderboard from '../components/Advisor/AdvisorLeaderboard';
import DailyQuests from '../components/Advisor/DailyQuests';
import { SkeletonCard } from '../components/ui/Skeleton';

interface AdvisorDashboardProps {
  employee: Employee;
  onNavigate: (view: string) => void;
}

const EMPTY_ARR: any[] = [];
const EMPTY_OBJ = {};

export default function AdvisorDashboard({ employee, onNavigate }: AdvisorDashboardProps) {
  const coachingLogs = useStore(state => state.coachingLogs) || EMPTY_ARR;
  const activePeriod = useStore(state => state.activePeriod);
  
  const rosterHistory = useStore(state => state.rosterHistory);
  const _rawactiveRoster = activePeriod ? (rosterHistory?.[activePeriod] || EMPTY_OBJ) : EMPTY_OBJ;
  const activeRoster = useMemo(() => (Object.values(_rawactiveRoster) as Employee[]).sort((a, b) => a.name.localeCompare(b.name)), [_rawactiveRoster]);
  
  const myLogs = useMemo(() => {
    if (!employee) return [];
    return coachingLogs.filter((log: CoachingLog) => 
      log.employeeId === employee.id || log.employeeName === employee.name
    );
  }, [coachingLogs, employee]);

  if (!employee || !employee.name) {
    return (
      <div className="p-xl h-full flex-column gap-xl">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // XP & Tier System
  const totalXP = ((employee.memberships || 0) * 50) + ((employee.creditCards || 0) * 100) + ((employee.trophies?.length || 0) * 200) + (myLogs.length * 75);
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const xpProgress = totalXP % 500;

  return (
    <div className="p-xl h-full overflow-y-auto" data-testid="advisor-dashboard-container">
      <div className="flex-between align-center mb-xl">
        <div>
          <h1 className="flex-center gap-md text-2-5rem font-extrabold m-0 mb-sm justify-start">
            Welcome back, {employee.name.split(' ')[0]}!
            <span className="flex-center gap-sm text-base bg-bby-yellow text-black px-md py-xs rounded-xl font-black">
              <Star size={16} /> Level {currentLevel}
            </span>
          </h1>
          <p className="text-secondary m-0 mb-md text-1-1rem">
            {employee.dept} Advisor • ID: {employee.id || 'N/A'}
          </p>
          <div className="flex-center gap-md bg-white-alpha-05 py-sm px-md rounded-20 w-fit">
            <span className="text-sm font-bold text-white">XP: {totalXP}</span>
            <div className="w-150px h-8px bg-white-alpha-10 rounded-sm overflow-hidden">
              <div className="h-full bg-bby-blue" style={{ width: `${(xpProgress / 500) * 100}%` }} />
            </div>
            <span className="text-xs text-muted">{xpProgress}/500 to Next Level</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('roleplay')}
          data-testid="practice-ai-button"
          className="btn-primary flex-center gap-sm px-lg py-md rounded-20 font-semibold border-none cursor-pointer"
        >
          <Target size={18} />
          Practice in AI Simulator
        </button>
      </div>

      <div className="mb-xl">
        <h2 className="text-xl font-bold mb-md flex-center gap-sm justify-start">
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
            totalRevenue: (employee.rph || 0) * (employee.hours || 0),
            totalHours: employee.hours || 0
          }}
          recentSessions={myLogs} 
        />
      </div>

      <div className="grid-cols-2-1 gap-2xl">
        <div className="flex-column gap-2xl">
          
          <TrophyCase employee={employee} />

          <div className="bg-surface rounded-20 border-glass p-lg">
          <h2 className="text-xl font-bold mb-md flex-center gap-sm justify-start">
            <Calendar size={20} color="var(--success)" />
            My Recent Feedback & GROW Logs
          </h2>
          {myLogs.length === 0 ? (
            <div className="p-3rem text-center text-muted">
              No recent coaching logs found.
            </div>
          ) : (
            <div className="flex-column gap-md">
              {myLogs.map((log, idx) => (
                <div key={idx} className="bg-white-alpha-02 p-lg rounded-15 border-white-alpha-05">
                  <div className="flex-between mb-sm">
                    <span className="font-semibold text-bby-yellow">{log.discFocus}</span>
                    <span className="text-sm text-secondary">
                      {log.date} by {log.coachName}
                    </span>
                  </div>
                  <div 
                    className="text-sm text-white leading-relaxed line-clamp-3 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.coachingPlanMd || 'Review completed.') }}
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        
        {/* Top 3 Leaderboard Column */}
        <div className="flex-column gap-2xl">
          <AdvisorLeaderboard />

          <DailyQuests employee={employee} />
        </div>
      </div>
    </div>
  );
}
