import React from 'react';
import { useMemo } from 'react';
import { Employee } from '../types/index';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardAlerts from '../components/Dashboard/DashboardAlerts';
import DashboardSystemAlerts from '../components/Dashboard/DashboardSystemAlerts';
import DashboardCoachingEngine from '../components/Dashboard/DashboardCoachingEngine';
import DashboardTrendChart from '../components/Dashboard/DashboardTrendChart';
import DashboardLeaderboard from '../components/Dashboard/DashboardLeaderboard';
import MetricCards from '../components/Dashboard/MetricCards';
import SyncManager from '../components/SyncManager';

const EMPTY_OBJ = {};
const EMPTY_ARR = [];

export default function Dashboard({ 
  onNavigate, 
  onCompleteFollowUpTask, 
  onCoachEmployee, 
  onShadowEmployee
}: any) {
  
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

  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => (Object.values(_rawroster) as Employee[]).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);
  const calculatedMetrics = useMemo(() => {
    if (!roster || roster.length === 0) return { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0 };
    
    let totalMemberships = 0;
    let totalCreditCards = 0;
    let sumSurveys = 0;
    
    let totalRev = 0;
    let totalHours = 0;
    
    // For weighting percentages
    let weightedWarrantySum = 0;
    let totalTransactionsForWarranty = 0;

    roster.forEach((emp: Employee) => {
      totalMemberships += ((emp as any).memberships || 0);
      totalCreditCards += ((emp as any).creditCards || 0);
      
      const hours = (emp as any).hours || 0;
      const rph = (emp as any).rph || 0;
      const transactions = (emp as any).transactions || 0;
      
      if ((emp as any).warranty > 0) {
        weightedWarrantySum += ((emp as any).warranty * transactions);
        totalTransactionsForWarranty += transactions;
      }

      let empSurveys = (emp as any).surveys || 0;
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
    if (!floorLeaderShifts || floorLeaderShifts.length === 0) return [];
    
    const sortedShifts = [...floorLeaderShifts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const mostRecentShift = sortedShifts[0];
    
    const todayStr = new Date().toLocaleDateString();
    if (mostRecentShift.date !== todayStr) return [];
    
    const zoneAssignments = mostRecentShift.zoneAssignments || {};
    const alerts: any[] = [];
    
    const todayStart = new Date().setHours(0,0,0,0);
    const todayLogs = (coachingLogs || []).filter((log: any) => {
      const logTime = log.timestamp || 0;
      return logTime >= todayStart;
    });

    Object.keys(zoneAssignments).forEach(zone => {
      const empIds = zoneAssignments[zone] || [];
      empIds.forEach((empId: string) => {
        const emp = roster.find((e: any) => e.id === empId);
        if (emp && (emp as any).focus5) {
          const hasLogToday = todayLogs.some((log: any) => log.employeeId === empId || log.employeeName === (emp as any).name);
          if (!hasLogToday) {
            alerts.push({ employee: emp, zone: zone });
          }
        }
      });
    });
    
    return alerts;
  }, [floorLeaderShifts, coachingLogs, roster]);

  const activePeriodLogs = useMemo(() => {
    if (!activePeriod) return coachingLogs || EMPTY_ARR;
    const [activeMonthStr, activeYearStr] = (activePeriod || "").split(' ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeMonthIdx = months.findIndex(m => activeMonthStr.startsWith(m));
    
    return (coachingLogs || EMPTY_ARR).filter((log: any) => {
      const logDate = log.timestamp ? new Date(log.timestamp) : new Date(log.date);
      if (isNaN(logDate.getTime())) return true;
      return logDate.getMonth() === activeMonthIdx && logDate.getFullYear() === parseInt(activeYearStr);
    });
  }, [coachingLogs, activePeriod]);

  const shadowingHeatmapData = useMemo(() => {
    const counts = { 'Front End': 0, 'Computing': 0, 'Mobile': 0, 'Home Theatre': 0, 'Geek Squad': 0, 'Appliances': 0 };
    
    // Pre-build a master lookup for O(1) department resolution
    const deptLookup: Record<string, string> = {};
    
    // First fill from all history (older to newer, so active overwrites)
    Object.values(rosterHistory || {}).forEach((empMap: any) => {
      Object.values(empMap || {}).forEach((emp: any) => {
        if (emp.id && emp.dept) deptLookup[emp.id] = emp.dept;
        if (emp.name && emp.dept) deptLookup[emp.name] = emp.dept;
      });
    });
    
    activePeriodLogs.forEach((log: any) => {
      const dept = deptLookup[log.employeeId] || deptLookup[log.employeeName];
      if (dept && dept in counts) {
        (counts as any)[dept]++;
      }
    });
    
    return counts;
  }, [activePeriodLogs, rosterHistory]);

  const pendingTasks = useMemo(() => {
    return (followUpTasks || []).filter((task: any) => !task.completed);
  }, [followUpTasks]);

  return (
    <div className="flex-column gap-xl">
      <DashboardHeader 
        roster={roster} 
        shadowingHeatmapData={shadowingHeatmapData} 
        rosterHistory={rosterHistory}
        activePeriod={activePeriod}
        activeManager={activeManager}
      />

      <DashboardSystemAlerts 
        roster={roster} 
        rosterHistory={rosterHistory} 
        calculatedMetrics={calculatedMetrics} 
        activePeriod={activePeriod} 
        onNavigate={onNavigate} 
      />

      <DashboardAlerts 
        activeFocus5Alerts={activeFocus5Alerts} 
        pendingTasks={pendingTasks} 
        onNavigate={onNavigate} 
        onCompleteFollowUpTask={onCompleteFollowUpTask} 
        onCoachEmployee={onCoachEmployee} 
        onShadowEmployee={onShadowEmployee} 
      />

      <MetricCards 
        calculatedMetrics={calculatedMetrics} 
        recentSessions={recentSessions} 
      />

      <div className="dashboard-grid">
        <DashboardCoachingEngine 
          roster={roster} 
          recentSessions={recentSessions} 
          deptGoals={deptGoals} 
          onShadowEmployee={onShadowEmployee} 
          onCoachEmployee={onCoachEmployee} 
        />
        <DashboardTrendChart 
          calculatedMetrics={calculatedMetrics} 
        />
      </div>

      <DashboardLeaderboard 
        roster={roster} 
        rosterHistory={rosterHistory} 
        activePeriod={activePeriod} 
        onCoachEmployee={onCoachEmployee} 
        onShadowEmployee={onShadowEmployee} 
      />
    </div>
  );
}


