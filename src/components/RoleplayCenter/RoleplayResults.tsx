// @ts-nocheck
import React from 'react';
import { Send, Users, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, MessageSquare, PlusCircle, User, Loader2, Sparkles, RefreshCw, XCircle } from 'lucide-react';

export default function RoleplayResults({ 
  allScenarios,
  selectedScenario,
  setSelectedScenario,
  complexity,
  setComplexity,
  customerTone,
  setCustomerTone,
  startRoleplay,
  messages,
  inputText,
  setInputText,
  sendMessage,
  isLoading,
  messagesEndRef,
  endRoleplay,
  evaluation,
  saveAndReturn,
  roster
 }) {
  return (
    <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Bar */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Roleplay Performance Report</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Evaluated using Best Buy Consultative Sales Rubrics.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => startRoleplay(selectedScenario)}>
                <RefreshCw size={14} /> Practice Again
              </button>
              <button className="btn btn-primary" onClick={() => setActiveView('dashboard')}>
                Return to Dashboard
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Left Box: Score Dial & Passed Status */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem' }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    stroke={evaluation.passed ? "var(--success)" : "var(--error)"} 
                    strokeWidth="12" 
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={2 * Math.PI * 70 - (evaluation.overallScore / 100) * (2 * Math.PI * 70)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{evaluation.overallScore}%</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score Rating</span>
                </div>
              </div>

              {evaluation.passed ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                    <Sparkles size={24} fill="var(--bby-yellow)" /> PRACTICE TARGET MET!
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                    Congratulations! You scored 80% or higher and demonstrated full competency in consultative selling.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                    <CheckCircle size={24} /> PRACTICE APPROVED
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                    Solid effort! Review the GROW options below and retry to improve your score. Goal is 80%+.
                  </p>
                </div>
              )}
            </div>

            {/* Middle Box: Sales Flow Stage Checklist Breakdown */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Sales Flow Stage Breakdown</h3>
              
              <div className="gauge-row">
                <span>Connect (Greeting & Welcome)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${evaluation.breakdown.connect}%`, background: 'var(--bby-blue)' }} />
                </div>
                <span>{evaluation.breakdown.connect}%</span>
              </div>
              <div className="gauge-row">
                <span>Discover (Open-ended Questions)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${evaluation.breakdown.discover}%`, background: 'var(--info)' }} />
                </div>
                <span>{evaluation.breakdown.discover}%</span>
              </div>
              <div className="gauge-row">
                <span>Recommend (Product & Support Match)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${evaluation.breakdown.recommend}%`, background: 'var(--bby-yellow)' }} />
                </div>
                <span>{evaluation.breakdown.recommend}%</span>
              </div>
              <div className="gauge-row">
                <span>Protect (Geek Squad Protection / AppleCare)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${evaluation.breakdown.protect}%`, background: 'var(--success)' }} />
                </div>
                <span>{evaluation.breakdown.protect}%</span>
              </div>
              <div className="gauge-row">
                <span>Close (BBY Card Financing Pitch)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${evaluation.breakdown.close}%`, background: 'var(--error)' }} />
                </div>
                <span>{evaluation.breakdown.close}%</span>
              </div>
            </div>

            {/* Right Box: Best Buy Core Values */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Best Buy Human-Centric Values</h3>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(0, 70, 190, 0.05)', border: '1px solid rgba(0, 70, 190, 0.15)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{evaluation.values.beHuman}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>Be Human</div>
                </div>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(255, 230, 0, 0.03)', border: '1px solid rgba(255, 230, 0, 0.15)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{evaluation.values.makeItEasy}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>Make it Easy</div>
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{evaluation.values.showWhatPossible}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>Show What's Possible</div>
              </div>
            </div>

          </div>

          {/* GROW Feedback Report Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
              <Sparkles size={20} /> Actionable GROW Coaching Plan
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>G - Coaching Goal</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {evaluation.growReport.goal}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>R - Current Reality</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {evaluation.growReport.reality}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#fff' }}>O - Options for Practice</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
                  {evaluation.growReport.options.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>W - Advisor Will / Commitment</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {evaluation.growReport.will}
                </p>
              </div>
            </div>
          </div>

        </div>
    </>
  );
}
