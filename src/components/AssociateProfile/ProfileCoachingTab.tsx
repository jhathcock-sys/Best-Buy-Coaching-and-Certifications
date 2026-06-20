import React from 'react';
import { TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import MetricSparkline from '../MetricSparkline';

export default function ProfileCoachingTab({ 
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
              {associateLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <AlertCircle size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No coaching or shadowing logs recorded for this associate yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {associateLogs.map((log: any) => {
                    const isExpanded = expandedLogId === log.id;
                    const isPlaying = playingLogId === log.id;

                    return (
                      <div 
                        key={log.id || log.timestamp}
                        style={{ 
                          padding: '1rem', 
                          borderRadius: '10px', 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          border: '1px solid var(--border-glass)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span 
                              className="tag-pill" 
                              style={{ 
                                fontSize: '0.7rem', 
                                background: log.category === 'Live Shadowing' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                color: log.category === 'Live Shadowing' ? '#10b981' : '#3b82f6',
                                border: '1px solid currentColor'
                              }}
                            >
                              {log.category}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                              Score: {log.score}%
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {log.date}
                          </span>
                        </div>

                        {/* Collapsed Preview vs Expanded Details */}
                        {!isExpanded ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%', margin: 0 }}>
                              {log.notes || 'GROW log plan.'}
                            </p>
                            <button 
                              className="btn-link"
                              style={{ fontSize: '0.75rem', color: 'var(--bby-blue)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                              onClick={() => setExpandedLogId(log.id)}
                            >
                              View Notes
                            </button>
                          </div>
                        ) : (
                          <div style={{ 
                            marginTop: '0.5rem', 
                            paddingTop: '0.75rem', 
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            {/* TTS buttons row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coaching Plan Document</span>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button 
                                  className={`btn ${isPlaying ? 'btn-danger' : 'btn-secondary'}`}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  onClick={() => handlePlayTTS(log.id, log.notes)}
                                >
                                  {isPlaying ? (
                                    <>
                                      <Square size={12} /> Stop Audio
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={12} /> Read aloud
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <div style={{ 
                              background: 'rgba(0,0,0,0.15)', 
                              padding: '0.75rem 1rem', 
                              borderRadius: '8px', 
                              border: '1px solid rgba(255,255,255,0.02)',
                              overflowX: 'auto'
                            }}>
                              {formatMarkdownNotes(log.notes)}
                            </div>

                            <button 
                              className="btn-link"
                              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', alignSelf: 'flex-end', marginTop: '0.25rem' }}
                              onClick={() => setExpandedLogId(null)}
                            >
                              Collapse Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
    </>
  );
}
