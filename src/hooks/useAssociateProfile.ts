import { useState, useEffect } from 'react';
import { Employee, CoachingLog, FollowUpTask } from '../types';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';

const DEFAULT_GOALS = { memberships: 8, creditCards: 12.5, warranty: 11, surveys: 1, rph: 640 };

export function useAssociateProfile(isOpen: boolean, employee: Employee | null) {
  const [activeTab, setActiveTab] = useState('trends');

  // Fetch all required state directly from the store instead of prop-drilling
  const rosterHistory = useStore(state => state.rosterHistory) || {};
  const coachingLogs = useStore(state => state.coachingLogs) || [];
  const followUpTasks = useStore(state => state.followUpTasks) || [];
  const deptGoals = useStore(state => state.deptGoals) || {};

  useEffect(() => {
    if (isOpen) {
      setActiveTab('trends');
    }
  }, [isOpen, employee?.id]);

  if (!isOpen || !employee) return {
    activeTab, setActiveTab,
    sortedPeriods: [],
    historyPoints: [],
    activeHistoryPoints: [],
    associateLogs: [],
    associateTasks: [],
    activeGoals: DEFAULT_GOALS
  };

  // 1. Gather historical data for this associate
  const sortedPeriods = Object.keys(rosterHistory).sort((a, b) => {
    const parsePeriod = (p: string) => {
      if (!p || typeof p !== 'string') return 0;
      const parts = p.split(' ');
      const month = parts[0] || '';
      const yearStr = parts[1] || '';
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) return 0;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => month.startsWith(m));
      const safeMonthIdx = monthIdx !== -1 ? monthIdx : 0;
      
      return new Date(year, safeMonthIdx).getTime();
    };
    return parsePeriod(a) - parsePeriod(b);
  });

  const historyPoints = sortedPeriods.map((period: string) => {
    const empMap = rosterHistory[period] || {};
    // Safely look up by ID, fallback to searching by name
    let emp: any = empMap[employee.id];
    if (!emp) {
       const found = Object.values(empMap).find((e: unknown) => {
           const eTyped = e as Employee;
           return eTyped && eTyped.name === employee.name;
       });
       emp = found;
    }
    
    return {
      period,
      found: !!emp,
      hours: emp?.hours || 0,
      memberships: emp?.memberships || 0,
      creditCards: emp?.creditCards || 0,
      warranty: emp?.warranty || 0,
      surveys: emp?.surveys === 0.2 ? 2.0 : (emp?.surveys || 5.0), // normalize failing
      rph: emp?.rph || 0,
      basket: emp?.basket || 0,
      m365: emp?.m365 || 0,
      audio: emp?.audio || 0
    };
  });

  // Filter out periods where employee was not on roster
  const activeHistoryPoints = historyPoints.filter(h => h.found);

  // 2. Filter coaching logs & commitments for this employee
  const associateLogs = coachingLogs.filter((log: CoachingLog) => 
    log.employeeId === employee.id || 
    log.employeeName === employee.name ||
    (log.employeeName && log.employeeName.startsWith(employee.name))
  );

  const associateTasks = followUpTasks.filter((task: FollowUpTask) => 
    task.employeeId === employee.id || 
    task.employeeName === employee.name
  );

  // Active department goals (safe nested access)
  const employeeDept = employee?.dept || '';
  const activeGoals = deptGoals[employeeDept] || DEFAULT_GOALS;

  return {
    activeTab, setActiveTab,
    sortedPeriods,
    historyPoints,
    activeHistoryPoints,
    associateLogs,
    associateTasks,
    activeGoals
  };
}
