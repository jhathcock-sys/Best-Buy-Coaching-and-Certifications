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
  associateShifts,
  associateSimulations,
  getRankAndPercentile,
  calculateCVI,
  renderMarkdown,
  playingLogId,
  setPlayingLogId,
  handlePlayAudio
 }) {
  return (
    <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
              
              {/* Current Metrics Overview vs Goal */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Memberships</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0.15rem 0' }}>{employee.memberships}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: {activeGoals.memberships}{activeGoals.membershipsType === 'Hours' ? 'h/memb' : activeGoals.membershipsType === 'Dollars' ? ' RPH' : ''}</div>
                </div>
                
                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BP CC Apps</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0.15rem 0' }}>{employee.creditCards}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: {activeGoals.creditCards}{activeGoals.creditCardsType === 'Hours' ? 'h/app' : ''}</div>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GSP Attach</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0.15rem 0' }}>{employee.warranty}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: {activeGoals.warranty}%</div>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RPH</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0.15rem 0' }}>${employee.rph}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: ${activeGoals.rph}/hr</div>
                </div>

                {/* Conditional Computing/HT Metrics */}
                {(employee.dept === 'Computing' || employee.dept === 'Home Theatre') && (
                  <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basket Size</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0.15rem 0' }}>${employee.basket}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: ${activeGoals.basket || 0}</div>
                  </div>
                )}
              </div>

              {/* SVG Sparkline Comparative Section */}
              <div style={{ 
                padding: '1.25rem', 
                borderRadius: '12px', 
                background: 'rgba(255, 255, 255, 0.01)', 
                border: '1px solid var(--border-glass)'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 1rem 0' }}>
                  Metrics Trend Timeline (Across Active Periods)
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Row: Memberships Attach */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Memberships Attach</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.memberships) as any[]} color="var(--bby-blue)" />
                  </div>

                  {/* Row: BP Credit Cards */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>BP CC Submitted Apps</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.creditCards) as any[]} color="var(--bby-yellow)" />
                  </div>

                  {/* Row: Warranty / GSP Attach */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>GSP / AppleCare+ Attach (%)</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.warranty) as any[]} color="#10b981" />
                  </div>

                  {/* Row: RPH Performance */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Revenue Per Hour ($)</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.rph) as any[]} color="#8b5cf6" />
                  </div>

                  {/* Row: Survey CSAT */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Survey Rating CSAT</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map((p: any) => p.surveys) as any[]} color="#f43f5e" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  <span>{activeHistoryPoints[0]?.period || 'Start'}</span>
                  <span>{activeHistoryPoints[activeHistoryPoints.length - 1]?.period || 'Active'}</span>
                </div>
              </div>
            </div>
    </>
  );
}
