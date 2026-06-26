import { useState, useEffect } from 'react';
import { Employee, CoachingLog, FollowUpTask } from '../types';

const DEFAULT_GOALS = { memberships: 8, creditCards: 12.5, warranty: 11, surveys: 1, rph: 640 };

export function useAssociateProfile(
  isOpen: boolean, 
  employee: Employee | null, 
  rosterHistory: Record<string, Record<string, any>>, 
  coachingLogs: CoachingLog[], 
  followUpTasks: FollowUpTask[], 
  deptGoals: Record<string, any>
) {
  const [activeTab, setActiveTab] = useState('trends');

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
      const [month, year] = p.split(' ');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => month.startsWith(m)) || 0;
      return new Date(parseInt(year), monthIdx).getTime();
    };
    return parsePeriod(a) - parsePeriod(b);
  });

  const historyPoints = sortedPeriods.map((period: string) => {
    const empMap = rosterHistory[period] || {};
    const emp = empMap[employee.id] || Object.values(empMap).find((e: any) => e.name === employee.name);
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
  const associateLogs = coachingLogs.filter(log => 
    log.employeeId === employee.id || 
    log.employeeName === employee.name ||
    (log.employeeName && log.employeeName.startsWith(employee.name))
  );

  const associateTasks = followUpTasks.filter(task => 
    task.employeeId === employee.id || 
    task.employeeName === employee.name
  );

  // Active department goals
  const activeGoals = deptGoals[employee.dept] || DEFAULT_GOALS;

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
