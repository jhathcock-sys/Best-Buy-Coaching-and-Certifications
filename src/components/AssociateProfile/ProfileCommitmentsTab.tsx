import React from 'react';
import { TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import MetricSparkline from '../MetricSparkline';

export default function ProfileCommitmentsTab({ 
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.25s ease' }}>
              {associateTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <CheckCircle size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No pending shadowing commitments scheduled for this associate.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {associateTasks.map((task: any) => (
                    <div 
                      key={task.id}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        background: task.completed ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.02)', 
                        border: `1.5px solid ${task.completed ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-glass)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          color: '#fff', 
                          fontWeight: 700, 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.6 : 1
                        }}>
                          {task.action}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> Due: {task.dueDate}
                        </span>
                      </div>
                      
                      <div>
                        {task.completed ? (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#10b981', 
                            fontWeight: 700, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.2rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            Resolved
                          </span>
                        ) : (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--bby-yellow)', 
                            fontWeight: 700, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.2rem',
                            background: 'rgba(255, 242, 0, 0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
    </>
  );
}
