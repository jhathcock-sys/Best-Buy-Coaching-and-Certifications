import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardAlerts from '../components/Dashboard/DashboardAlerts';
import DashboardSystemAlerts from '../components/Dashboard/DashboardSystemAlerts';
import DashboardCoachingEngine from '../components/Dashboard/DashboardCoachingEngine';
import DashboardTrendChart from '../components/Dashboard/DashboardTrendChart';
import DashboardLeaderboard from '../components/Dashboard/DashboardLeaderboard';
import MetricCards from '../components/Dashboard/MetricCards';
import { useCalculatedMetrics } from '../hooks/useCalculatedMetrics';

import { Employee } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onCompleteFollowUpTask?: (taskId: string) => void;
  onCoachEmployee?: (emp: Employee) => void;
  onShadowEmployee?: (emp: Employee) => void;
}

export default function DashboardPage({ 
  onNavigate, 
  onCompleteFollowUpTask, 
  onCoachEmployee, 
  onShadowEmployee
}: DashboardPageProps) {
  const { calculatedMetrics, recentSessions } = useCalculatedMetrics();

  return (
    <div className="flex-column gap-xl" data-testid="dashboard-page">
      <DashboardHeader />

      <DashboardSystemAlerts 
        onNavigate={onNavigate} 
      />

      <DashboardAlerts 
        onCompleteFollowUpTask={onCompleteFollowUpTask} 
        onCoachEmployee={onCoachEmployee} 
        onShadowEmployee={onShadowEmployee} 
      />

      <MetricCards calculatedMetrics={calculatedMetrics} recentSessions={recentSessions} />

      <div className="dashboard-grid">
        <DashboardCoachingEngine 
          onShadowEmployee={onShadowEmployee} 
          onCoachEmployee={onCoachEmployee} 
        />
        <DashboardTrendChart />
      </div>

      <DashboardLeaderboard onCoachEmployee={onCoachEmployee} />
    </div>
  );
}


