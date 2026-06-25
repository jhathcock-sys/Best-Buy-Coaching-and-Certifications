import React from 'react';
import { TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import MetricSparkline from '../MetricSparkline';

export default function ProfileTrendsTab({ 
  employee,
  rosterHistory,
  activePeriod,
  activeHistoryPoints,
  associateLogs,
  associateTasks,
  activeGoals,
  calculateCVI,
  renderMarkdown,
  playingLogId,
  setPlayingLogId,
 }) {
  return (
    <>
            <div className="flex-column gap-lg animate-fade-in">
              
              {/* Current Metrics Overview vs Goal */}
              <div className="target-grid">
                <div className="glass-card-sm">
                  <div className="text-xxs text-muted uppercase tracking-wider">Memberships</div>
                  <div className="text-2xl font-extrabold text-white mb-xs mt-xs">{employee.memberships}</div>
                  <div className="text-xxs text-secondary">Target: {activeGoals.memberships}{activeGoals.membershipsType === 'Hours' ? 'h/memb' : activeGoals.membershipsType === 'Dollars' ? ' RPH' : ''}</div>
                </div>
                
                <div className="glass-card-sm">
                  <div className="text-xxs text-muted uppercase tracking-wider">BP CC Apps</div>
                  <div className="text-2xl font-extrabold text-white mb-xs mt-xs">{employee.creditCards}</div>
                  <div className="text-xxs text-secondary">Target: {activeGoals.creditCards}{activeGoals.creditCardsType === 'Hours' ? 'h/app' : ''}</div>
                </div>

                <div className="glass-card-sm">
                  <div className="text-xxs text-muted uppercase tracking-wider">GSP Attach</div>
                  <div className="text-2xl font-extrabold text-white mb-xs mt-xs">{employee.warranty}%</div>
                  <div className="text-xxs text-secondary">Target: {activeGoals.warranty}%</div>
                </div>

                <div className="glass-card-sm">
                  <div className="text-xxs text-muted uppercase tracking-wider">RPH</div>
                  <div className="text-2xl font-extrabold text-white mb-xs mt-xs">${employee.rph}</div>
                  <div className="text-xxs text-secondary">Target: ${activeGoals.rph}/hr</div>
                </div>

                {/* Conditional Computing/HT Metrics */}
                {(employee.dept === 'Computing' || employee.dept === 'Home Theatre') && (
                  <div className="glass-card-sm">
                    <div className="text-xxs text-muted uppercase tracking-wider">Basket Size</div>
                    <div className="text-2xl font-extrabold text-white mb-xs mt-xs">${employee.basket}</div>
                    <div className="text-xxs text-secondary">Target: ${activeGoals.basket || 0}</div>
                  </div>
                )}
              </div>

              {/* SVG Sparkline Comparative Section */}
              <div className="p-lg rounded-xl bg-white-alpha-05 border-glass">
                <h4 className="text-sm text-white font-heading m-0 mb-md">
                  Metrics Trend Timeline (Across Active Periods)
                </h4>
                
                <div className="flex-column gap-sm">
                  {/* Row: Memberships Attach */}
                  <div className="flex-between align-center pb-sm border-bottom">
                    <span className="text-sm text-secondary font-semibold">Memberships Attach</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.memberships) as any[]} color="var(--bby-blue)" />
                  </div>

                  {/* Row: BP Credit Cards */}
                  <div className="flex-between align-center pb-sm border-bottom">
                    <span className="text-sm text-secondary font-semibold">BP CC Submitted Apps</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.creditCards) as any[]} color="var(--bby-yellow)" />
                  </div>

                  {/* Row: Warranty / GSP Attach */}
                  <div className="flex-between align-center pb-sm border-bottom">
                    <span className="text-sm text-secondary font-semibold">GSP / AppleCare+ Attach (%)</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.warranty) as any[]} color="#10b981" />
                  </div>

                  {/* Row: RPH Performance */}
                  <div className="flex-between align-center pb-sm border-bottom">
                    <span className="text-sm text-secondary font-semibold">Revenue Per Hour ($)</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.rph) as any[]} color="#8b5cf6" />
                  </div>

                  {/* Row: Survey CSAT */}
                  <div className="flex-between align-center">
                    <span className="text-sm text-secondary font-semibold">Survey Rating CSAT</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.surveys) as any[]} color="#f43f5e" />
                  </div>
                </div>

                <div className="flex-between text-xxs text-muted mt-sm">
                  <span>{activeHistoryPoints[0]?.period || 'Start'}</span>
                  <span>{activeHistoryPoints[activeHistoryPoints.length - 1]?.period || 'Active'}</span>
                </div>
              </div>
            </div>
    </>
  );
}
