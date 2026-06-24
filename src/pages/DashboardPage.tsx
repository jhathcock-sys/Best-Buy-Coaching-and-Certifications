import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardAlerts from '../components/Dashboard/DashboardAlerts';
import DashboardSystemAlerts from '../components/Dashboard/DashboardSystemAlerts';
import DashboardCoachingEngine from '../components/Dashboard/DashboardCoachingEngine';
import DashboardTrendChart from '../components/Dashboard/DashboardTrendChart';
import DashboardLeaderboard from '../components/Dashboard/DashboardLeaderboard';
import MetricCards from '../components/Dashboard/MetricCards';
import { DashboardProvider, useDashboardContext } from './DashboardContext';

function DashboardContent({ 
  onNavigate, 
  onCompleteFollowUpTask, 
  onCoachEmployee, 
  onShadowEmployee
}: any) {
  const {
    roster,
    calculatedMetrics,
    activeFocus5Alerts,
    pendingTasks,
    recentSessions,
    deptGoals,
    activePeriod,
    rosterHistory,
    activeManager,
    shadowingHeatmapData
  } = useDashboardContext();

  return (
    <div className="flex-column gap-xl">
      <DashboardHeader />

      <DashboardSystemAlerts 
        onNavigate={onNavigate} 
      />

      <DashboardAlerts 
        onNavigate={onNavigate} 
        onCompleteFollowUpTask={onCompleteFollowUpTask} 
        onCoachEmployee={onCoachEmployee} 
        onShadowEmployee={onShadowEmployee} 
      />

      <MetricCards />

      <div className="dashboard-grid">
        <DashboardCoachingEngine 
          onShadowEmployee={onShadowEmployee} 
          onCoachEmployee={onCoachEmployee} 
        />
        <DashboardTrendChart />
      </div>

      <DashboardLeaderboard 
        onCoachEmployee={onCoachEmployee} 
        onShadowEmployee={onShadowEmployee} 
      />
    </div>
  );
}

export default function DashboardPage(props: any) {
  return (
    <DashboardProvider>
      <DashboardContent {...props} />
    </DashboardProvider>
  );
}
