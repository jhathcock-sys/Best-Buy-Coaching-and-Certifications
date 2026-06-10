import React, { useState, useEffect, useMemo } from 'react';
import { X, TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import MetricSparkline from './MetricSparkline';
import { calculateCVI } from '../store/cviHelper';

export default function AssociateProfileModal({
  isOpen,
  onClose,
  employee,
  rosterHistory = {},
  coachingLogs = [],
  followUpTasks = [],
  deptGoals = {},
  activePeriod
}) {
  const [activeTab, setActiveTab] = useState('trends');
  const [playingLogId, setPlayingLogId] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('trends');
      setPlayingLogId(null);
      setExpandedLogId(null);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  // Handle TTS
  const handlePlayTTS = (logId, text) => {
    if (playingLogId === logId) {
      window.speechSynthesis.cancel();
      setPlayingLogId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*`_-]/g, ' ') // Strip markdown chars
      .replace(/DISC Focus:/gi, ' DISC Focus step is ')
      .replace(/WHAT:/gi, ' What needs to be done: ')
      .replace(/HOW:/gi, ' How they should sell: ')
      .replace(/WHY:/gi, ' Why it matters: ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setPlayingLogId(null);
    utterance.onerror = () => setPlayingLogId(null);
    setPlayingLogId(logId);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setPlayingLogId(null);
  };

  if (!isOpen || !employee) return null;

  // 1. Gather historical data for this associate
  const sortedPeriods = Object.keys(rosterHistory).sort((a, b) => {
    const parsePeriod = (p) => {
      const [month, year] = p.split(' ');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => month.startsWith(m)) || 0;
      return new Date(parseInt(year), monthIdx);
    };
    return parsePeriod(a) - parsePeriod(b);
  });

  const historyPoints = sortedPeriods.map(period => {
    const emp = rosterHistory[period]?.find(e => e.id === employee.id || e.name === employee.name);
    return {
      period,
      found: !!emp,
      hours: emp?.hours || 0,
      memberships: emp?.memberships || 0,
      creditCards: emp?.creditCards || 0,
      warranty: emp?.warranty || 0,
      surveys: emp?.surveys === 0.2 ? 2.0 : (emp?.surveys || 5.0), // normalize failing
      rph: emp?.rph || 0,
      basket: emp?.basket || 0,
      m365: emp?.m365 || 0,
      audio: emp?.audio || 0
    };
  });

  // Filter out periods where employee was not on roster
  const activeHistoryPoints = historyPoints.filter(h => h.found);

  // 2. Filter coaching logs & commitments for this employee
  const associateLogs = coachingLogs.filter(log => 
    log.employeeId === employee.id || 
    log.employeeName === employee.name ||
    (log.employeeName && log.employeeName.startsWith(employee.name))
  );

  const associateTasks = followUpTasks.filter(task => 
    task.employeeId === employee.id || 
    task.employeeName === employee.name
  );

  // Active department goals
  const activeGoals = deptGoals[employee.dept] || { memberships: 8, creditCards: 12.5, warranty: 11, surveys: 1, rph: 640 };



  // Helper to parse markdown-like bold items in log notes
  const formatMarkdownNotes = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => {
      if (line.startsWith('##')) {
        return <h4 key={i} style={{ color: 'var(--bby-yellow)', fontSize: '0.95rem', margin: '0.75rem 0 0.4rem 0', fontFamily: 'var(--font-heading)' }}>{line.replace(/##/g, '').trim()}</h4>;
      }
      if (line.startsWith('* **')) {
        const parts = line.replace(/^\*\s+/, '').split('**');
        const label = parts[1] || '';
        const desc = parts.slice(2).join('**').trim();
        return (
          <p key={i} style={{ margin: '0.25rem 0', fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#fff' }}>{label}</strong> {desc}
          </p>
        );
      }
      return <p key={i} style={{ margin: '0.25rem 0', fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>{line}</p>;
    });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          border: '2px solid var(--bby-blue)', 
          maxWidth: '750px', 
          width: '95%',
          background: '#0c0f18',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-glass)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(0, 70, 190, 0.15), transparent)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                {employee.name}
              </h3>
              <span className="tag-pill tag-pill-active" style={{ fontSize: '0.75rem', background: 'var(--bby-blue)' }}>
                {employee.dept}
              </span>
              {employee.focus5 && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#fff', 
                  background: 'var(--error)', 
                  fontWeight: 800, 
                  padding: '0.15rem 0.4rem', 
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  🔥 FOCUS 5
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Associate Profile & Coaching Dashboard
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
              {(() => {
                const cvi = calculateCVI(employee, rosterHistory, activePeriod);
                let badgeBg = 'rgba(255, 255, 255, 0.05)';
                let badgeColor = 'var(--text-secondary)';
                let badgeBorder = 'rgba(255, 255, 255, 0.1)';
                if (cvi.includes('Accelerating')) {
                  badgeBg = 'rgba(16, 185, 129, 0.15)';
                  badgeColor = 'var(--success)';
                  badgeBorder = 'rgba(16, 185, 129, 0.3)';
                } else if (cvi.includes('Needs Review')) {
                  badgeBg = 'rgba(239, 68, 68, 0.15)';
                  badgeColor = 'var(--error)';
                  badgeBorder = 'rgba(239, 68, 68, 0.3)';
                } else if (cvi.includes('Neutral')) {
                  badgeBg = 'rgba(245, 158, 11, 0.15)';
                  badgeColor = 'var(--warning)';
                  badgeBorder = 'rgba(245, 158, 11, 0.3)';
                }
                return (
                  <span 
                    title="Coaching Velocity Index (Month over Month growth velocity)"
                    style={{ 
                      fontSize: '0.7rem', 
                      background: badgeBg, 
                      border: `1px solid ${badgeBorder}`, 
                      color: badgeColor, 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '6px', 
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    📈 CVI: {cvi}
                  </span>
                );
              })()}
            </div>
          </div>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }} 
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.02)', 
          borderBottom: '1px solid var(--border-glass)' 
        }}>
          <button 
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'trends' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'trends' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp size={16} /> Performance Trends
          </button>
          <button 
            className={`tab-btn ${activeTab === 'coaching' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'coaching' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'coaching' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('coaching')}
          >
            <ClipboardList size={16} /> Coaching History ({associateLogs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'commitments' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'commitments' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'commitments' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('commitments')}
          >
            <Calendar size={16} /> Commitments ({associateTasks.length})
          </button>
        </div>

        {/* Modal Body content scroll area */}
        <div style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          
          {/* TAB 1: Performance Trends */}
          {activeTab === 'trends' && (
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
                    <MetricSparkline dataPoints={activeHistoryPoints.map(p => p.memberships)} color="var(--bby-blue)" />
                  </div>

                  {/* Row: BP Credit Cards */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>BP CC Submitted Apps</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map(p => p.creditCards)} color="var(--bby-yellow)" />
                  </div>

                  {/* Row: Warranty / GSP Attach */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>GSP / AppleCare+ Attach (%)</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map(p => p.warranty)} color="#10b981" />
                  </div>

                  {/* Row: RPH Performance */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Revenue Per Hour ($)</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map(p => p.rph)} color="#8b5cf6" />
                  </div>

                  {/* Row: Survey CSAT */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Survey Rating CSAT</span>
                    <MetricSparkline dataPoints={activeHistoryPoints.map(p => p.surveys)} color="#f43f5e" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  <span>{activeHistoryPoints[0]?.period || 'Start'}</span>
                  <span>{activeHistoryPoints[activeHistoryPoints.length - 1]?.period || 'Active'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Coaching logs history list */}
          {activeTab === 'coaching' && (
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
                  {associateLogs.map((log) => {
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
          )}

          {/* TAB 3: Commitments Follow-up Tasks */}
          {activeTab === 'commitments' && (
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
                  {associateTasks.map((task) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
