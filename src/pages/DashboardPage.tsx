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
  const roster = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);
  const calculatedMetrics = useMemo(() => {
    if (!roster || roster.length === 0) return { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0 };
    
    let totalMemberships = 0;
    let totalCreditCards = 0;
    let sumWarranty = 0;
    let sumSurveys = 0;
    
    let totalRev = 0;
    let totalHours = 0;
    
    let countWarranty = 0;
    let countSurveys = 0;

    roster.forEach((emp: Employee) => {
      totalMemberships += ((emp as any).memberships || 0);
      totalCreditCards += ((emp as any).creditCards || 0);
      
      if ((emp as any).warranty > 0) {
        sumWarranty += (emp as any).warranty;
        countWarranty++;
      }
      let empSurveys = (emp as any).surveys || 0;
      if (empSurveys === 0.2) empSurveys = 0; // 0.2 is used as a 'Failing' flag internally
      sumSurveys += empSurveys;
      
      const hours = (emp as any).hours || 0;
      const rph = (emp as any).rph || 0;
      totalHours += hours;
      totalRev += (hours * rph);
    });

    const avgWarranty = countWarranty > 0 ? (sumWarranty / countWarranty) : 0;
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
          const hasLogToday = todayLogs.some((log: any) => log.employeeId === empId || log.employeeName === emp.name);
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
    
    activePeriodLogs.forEach((log: any) => {
      const emp = roster.find((e: any) => e.id === log.employeeId || e.name === log.employeeName);
      const dept = emp ? (emp as any).dept : null;
      if (dept && dept in counts) {
        (counts as any)[dept]++;
      } else {
        for (const period of Object.keys(rosterHistory)) {
          const empMap = rosterHistory[period] || EMPTY_OBJ;
          const histEmp = empMap[log.employeeId] || Object.values(empMap).find((e: any) => e.name === log.employeeName);
          if (histEmp && histEmp.dept in counts) {
            (counts as any)[histEmp.dept]++;
            break;
          }
        }
      }
    });
    return counts;
  }, [activePeriodLogs, roster, rosterHistory]);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
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


