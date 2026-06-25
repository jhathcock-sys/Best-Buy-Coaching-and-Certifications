import React from 'react';
import MetricSparkline from '../MetricSparkline';
import { Employee } from '../../types';

export interface HistoryPoint {
  period: string;
  found: boolean;
  memberships?: string | number;
  creditCards?: string | number;
  warranty?: string | number;
  rph?: string | number;
  surveys?: string | number;
}

export interface ActiveGoals {
  memberships?: string | number;
  membershipsType?: string;
  creditCards?: string | number;
  creditCardsType?: string;
  warranty?: string | number;
  rph?: string | number;
  basket?: string | number;
}

interface ProfileTrendsTabProps {
  employee: Employee | null;
  activeHistoryPoints: HistoryPoint[];
  activeGoals: ActiveGoals | null;
}

export default function ProfileTrendsTab({ 
  employee,
  activeHistoryPoints,
  activeGoals,
}: ProfileTrendsTabProps) {
  if (!employee || !activeGoals) return null;

  return (
    <div className="flex-column gap-lg animate-fade-in" data-testid="profile-trends-tab">
      
      {/* Current Metrics Overview vs Goal */}
      <div className="target-grid" data-testid="metrics-overview">
        <div className="glass-card-sm" data-testid="memberships-metric">
          <div className="text-xxs text-muted uppercase tracking-wider">Memberships</div>
          <div className="text-2xl font-extrabold text-white mb-xs mt-xs">{employee.memberships || 0}</div>
          <div className="text-xxs text-secondary">Target: {activeGoals.memberships || 0}{activeGoals.membershipsType === 'Hours' ? 'h/memb' : activeGoals.membershipsType === 'Dollars' ? ' RPH' : ''}</div>
        </div>
        
        <div className="glass-card-sm" data-testid="creditcards-metric">
          <div className="text-xxs text-muted uppercase tracking-wider">BP CC Apps</div>
          <div className="text-2xl font-extrabold text-white mb-xs mt-xs">{employee.creditCards || 0}</div>
          <div className="text-xxs text-secondary">Target: {activeGoals.creditCards || 0}{activeGoals.creditCardsType === 'Hours' ? 'h/app' : ''}</div>
        </div>

        <div className="glass-card-sm" data-testid="warranty-metric">
          <div className="text-xxs text-muted uppercase tracking-wider">GSP Attach</div>
          <div className="text-2xl font-extrabold text-white mb-xs mt-xs">{employee.warranty || 0}%</div>
          <div className="text-xxs text-secondary">Target: {activeGoals.warranty || 0}%</div>
        </div>

        <div className="glass-card-sm" data-testid="rph-metric">
          <div className="text-xxs text-muted uppercase tracking-wider">RPH</div>
          <div className="text-2xl font-extrabold text-white mb-xs mt-xs">${employee.rph || 0}</div>
          <div className="text-xxs text-secondary">Target: ${activeGoals.rph || 0}/hr</div>
        </div>

        {/* Conditional Computing/HT Metrics */}
        {(employee.dept === 'Computing' || employee.dept === 'Home Theatre') && (
          <div className="glass-card-sm" data-testid="basket-metric">
            <div className="text-xxs text-muted uppercase tracking-wider">Basket Size</div>
            <div className="text-2xl font-extrabold text-white mb-xs mt-xs">${employee.basket || 0}</div>
            <div className="text-xxs text-secondary">Target: ${activeGoals.basket || 0}</div>
          </div>
        )}
      </div>

      {/* SVG Sparkline Comparative Section */}
      <div className="p-lg rounded-xl bg-white-alpha-05 border-glass" data-testid="sparklines-section">
        <h4 className="text-sm text-white font-heading m-0 mb-md">
          Metrics Trend Timeline (Across Active Periods)
        </h4>
        
        <div className="flex-column gap-sm">
          {/* Row: Memberships Attach */}
          <div className="flex-between align-center pb-sm border-bottom" data-testid="sparkline-memberships">
            <span className="text-sm text-secondary font-semibold">Memberships Attach</span>
            <MetricSparkline dataPoints={(activeHistoryPoints || []).map((p: HistoryPoint) => Number(p.memberships) || 0)} color="var(--bby-blue)" />
          </div>

          {/* Row: BP Credit Cards */}
          <div className="flex-between align-center pb-sm border-bottom" data-testid="sparkline-creditcards">
            <span className="text-sm text-secondary font-semibold">BP CC Submitted Apps</span>
            <MetricSparkline dataPoints={(activeHistoryPoints || []).map((p: HistoryPoint) => Number(p.creditCards) || 0)} color="var(--bby-yellow)" />
          </div>

          {/* Row: Warranty / GSP Attach */}
          <div className="flex-between align-center pb-sm border-bottom" data-testid="sparkline-warranty">
            <span className="text-sm text-secondary font-semibold">GSP / AppleCare+ Attach (%)</span>
            <MetricSparkline dataPoints={(activeHistoryPoints || []).map((p: HistoryPoint) => Number(p.warranty) || 0)} color="#10b981" />
          </div>

          {/* Row: RPH Performance */}
          <div className="flex-between align-center pb-sm border-bottom" data-testid="sparkline-rph">
            <span className="text-sm text-secondary font-semibold">Revenue Per Hour ($)</span>
            <MetricSparkline dataPoints={(activeHistoryPoints || []).map((p: HistoryPoint) => Number(p.rph) || 0)} color="#8b5cf6" />
          </div>

          {/* Row: Survey CSAT */}
          <div className="flex-between align-center" data-testid="sparkline-surveys">
            <span className="text-sm text-secondary font-semibold">Survey Rating CSAT</span>
            <MetricSparkline dataPoints={(activeHistoryPoints || []).map((p: HistoryPoint) => Number(p.surveys) || 0)} color="#f43f5e" />
          </div>
        </div>

        <div className="flex-between text-xxs text-muted mt-sm">
          <span>{activeHistoryPoints && activeHistoryPoints.length > 0 ? activeHistoryPoints[0].period : 'Start'}</span>
          <span>{activeHistoryPoints && activeHistoryPoints.length > 0 ? activeHistoryPoints[activeHistoryPoints.length - 1].period : 'Active'}</span>
        </div>
      </div>
    </div>
  );
}
