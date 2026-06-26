import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { Employee, CoachingLog, ShiftEvent, FollowUpTask, DeptGoal } from '../types';

const EMPTY_OBJ: Record<string, never> = {};
const EMPTY_ARR: never[] = [];

export interface CalculatedMetrics {
  memberships: number;
  creditCards: number;
  warranty: number;
  surveys: number;
  rph: number;
  totalRevenue: number;
  totalHours: number;
}

export function useCalculatedMetrics() {
  const {
    recentSessions,
    followUpTasks,
    deptGoals,
    floorLeaderShifts,
    coachingLogs,
    activePeriod,
    rosterHistory,
    activeManager
  } = useStore(useShallow(state => ({
    recentSessions: state.recentSessions,
    followUpTasks: state.followUpTasks,
    deptGoals: state.deptGoals,
    floorLeaderShifts: state.floorLeaderShifts,
    coachingLogs: state.coachingLogs,
    activePeriod: state.activePeriod,
    rosterHistory: state.rosterHistory,
    activeManager: state.activeManager
  })));

  const _rawroster = activePeriod ? ((rosterHistory || EMPTY_OBJ)[activePeriod] || EMPTY_OBJ) : EMPTY_OBJ;
  
  const roster = useMemo(() => {
    return (Object.values(_rawroster) as Employee[]).sort((a, b) => a.name.localeCompare(b.name));
  }, [_rawroster]);
  
  const calculatedMetrics = useMemo<CalculatedMetrics>(() => {
    if (!roster || roster.length === 0) {
      return { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0, totalRevenue: 0, totalHours: 0 };
    }
    
    let totalMemberships = 0;
    let totalCreditCards = 0;
    let sumSurveys = 0;
    
    let totalRev = 0;
    let totalHours = 0;
    
    // For weighting percentages
    let weightedWarrantySum = 0;
    let totalTransactionsForWarranty = 0;

    roster.forEach((emp) => {
      totalMemberships += (emp.memberships || 0);
      totalCreditCards += (emp.creditCards || 0);
      
      const hours = emp.hours || 0;
      const rph = emp.rph || 0;
      const transactions = emp.transactions || 0;
      
      const warranty = emp.warranty || 0;
      if (warranty > 0) {
        weightedWarrantySum += (warranty * transactions);
      }
      
      if (transactions > 0) {
        totalTransactionsForWarranty += transactions;
      }

      let empSurveys = emp.surveys || 0;
      if (empSurveys === 0.2) empSurveys = 0; // 0.2 is used as a 'Failing' flag internally
      sumSurveys += empSurveys;
      
      totalHours += hours;
      totalRev += (hours * rph);
    });

    const avgWarranty = totalTransactionsForWarranty > 0 ? (weightedWarrantySum / totalTransactionsForWarranty) : 0;
    const avgRph = totalHours > 0 ? (totalRev / totalHours) : 0;

    return {
      memberships: totalMemberships,
      creditCards: totalCreditCards,
      warranty: Number(avgWarranty.toFixed(1)),
      surveys: sumSurveys,
      rph: Math.round(avgRph),
      totalRevenue: totalRev,
      totalHours: totalHours
    };
  }, [roster]);

  const activeFocus5Alerts = useMemo(() => {
    if (!floorLeaderShifts || floorLeaderShifts.length === 0) return EMPTY_ARR;
    
    const sortedShifts = [...floorLeaderShifts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const mostRecentShift = sortedShifts[0];
    
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    if ((mostRecentShift.timestamp || 0) < todayStart.getTime()) return EMPTY_ARR;
    
    const zoneAssignments = mostRecentShift.zoneAssignments || {};
    const alerts: { employee: Employee; zone: string }[] = [];
    
    const todayLogs = (coachingLogs || EMPTY_ARR).filter((log) => {
      const logTime = log.timestamp || 0;
      return logTime >= todayStart.getTime();
    });

    Object.keys(zoneAssignments).forEach(zone => {
      const empIds = zoneAssignments[zone] || [];
      empIds.forEach((empId) => {
        const emp = roster.find(e => e.id === empId);
        if (emp && emp.focus5) {
          const hasLogToday = todayLogs.some(log => log.employeeId === empId || log.employeeName === emp.name);
          if (!hasLogToday) {
            alerts.push({ employee: emp, zone });
          }
        }
      });
    });
    
    return alerts.length > 0 ? alerts : EMPTY_ARR;
  }, [floorLeaderShifts, coachingLogs, roster]);

  const activePeriodLogs = useMemo(() => {
    if (!activePeriod) return coachingLogs || EMPTY_ARR;
    const parts = activePeriod.split(' ');
    const activeMonthStr = parts[0] || '';
    const activeYearStr = parts[1] || '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeMonthIdx = months.findIndex(m => activeMonthStr.startsWith(m));
    
    const filtered = (coachingLogs || EMPTY_ARR).filter((log) => {
      let logDate = new Date();
      if (log.timestamp) {
        logDate = new Date(log.timestamp);
      } else if (log.date) {
        const dParts = log.date.split(/[-/]/);
        if (dParts.length === 3) {
           if (dParts[0].length === 4) {
               logDate = new Date(parseInt(dParts[0]), parseInt(dParts[1]) - 1, parseInt(dParts[2]));
           } else {
               logDate = new Date(parseInt(dParts[2]), parseInt(dParts[0]) - 1, parseInt(dParts[1]));
           }
        } else {
           logDate = new Date(log.date);
        }
      } else {
        return true;
      }
      
      if (isNaN(logDate.getTime())) return true;
      const parsedYear = activeYearStr ? parseInt(activeYearStr) : NaN;
      return logDate.getMonth() === activeMonthIdx && (!isNaN(parsedYear) ? logDate.getFullYear() === parsedYear : true);
    });
    return filtered.length > 0 ? filtered : EMPTY_ARR;
  }, [coachingLogs, activePeriod]);

  const shadowingHeatmapData = useMemo(() => {
    const counts: Record<string, number> = { 'Front End': 0, 'Computing': 0, 'Mobile': 0, 'Home Theatre': 0, 'Geek Squad': 0, 'Appliances': 0 };
    
    // Pre-build a master lookup for O(1) department resolution
    const deptLookup: Record<string, string> = {};
    
    // First fill from all history (older to newer, so active overwrites)
    Object.values(rosterHistory || EMPTY_OBJ).forEach((empMap) => {
      Object.values(empMap || EMPTY_OBJ).forEach((emp) => {
        if (emp.id && emp.dept) deptLookup[emp.id] = emp.dept;
        if (emp.name && emp.dept) deptLookup[emp.name] = emp.dept;
      });
    });
    
    activePeriodLogs.forEach((log) => {
      const dept = deptLookup[log.employeeId] || deptLookup[log.employeeName];
      if (dept && dept in counts) {
        counts[dept]++;
      }
    });
    
    return counts;
  }, [activePeriodLogs, rosterHistory]);

  const pendingTasks = useMemo(() => {
    const filtered = (followUpTasks || EMPTY_ARR).filter((task) => !task.completed);
    return filtered.length > 0 ? filtered : EMPTY_ARR;
  }, [followUpTasks]);

  return {
    roster,
    calculatedMetrics,
    activeFocus5Alerts,
    activePeriodLogs,
    shadowingHeatmapData,
    pendingTasks,
    recentSessions: recentSessions || EMPTY_ARR,
    deptGoals: deptGoals || EMPTY_OBJ,
    activePeriod,
    rosterHistory: rosterHistory || EMPTY_OBJ,
    activeManager
  };
}
