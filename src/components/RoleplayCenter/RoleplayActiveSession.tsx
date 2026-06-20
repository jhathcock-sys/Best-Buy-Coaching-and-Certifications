import React from 'react';
import { ArrowLeft, Send, Users, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, MessageSquare, PlusCircle, User, Loader2, Sparkles, RefreshCw, XCircle, BookOpen } from 'lucide-react';

export default function RoleplayActiveSession({ 
  apiKey,
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
  roster,
  completedSteps,
  currentActiveStep,
  isEvaluating,
  setSessionActive,
  stepHint
 }) {
  return (
    <>
        {isEvaluating ? (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem', minHeight: '500px', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <div className="skeleton-pulse" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', border: '8px solid rgba(255, 230, 0, 0.05)', borderTopColor: 'var(--bby-yellow)', animation: 'spin 1.5s linear infinite' }}></div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <Sparkles size={36} color="var(--bby-yellow)" className="typing-dots" />
              </div>
            </div>
            
            <div style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>AI Performance Audit in progress</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Gemini is grading your consultative discovery questions, verifying your membership values pitch, checking GSP warranty attachments, and parsing final credit card close rewards.
              </p>
            </div>

            <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <div className="skeleton-pulse" style={{ height: '12px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }}></div>
              <div className="skeleton-pulse" style={{ height: '12px', width: '80%', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', alignSelf: 'center' }}></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Control Bar */}
          <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button className="btn btn-secondary btn-icon" onClick={() => setSessionActive(false)}>
                <ArrowLeft size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={selectedScenario.avatar} alt="" className="profile-avatar" />
                <div>
                  <h3 style={{ fontSize: '1.05rem' }}>{selectedScenario.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Practice: {selectedScenario.title}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {apiKey && apiKey.trim().length > 10 ? (
                <span className="tag-pill" style={{ background: 'var(--info-glow)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#67e8f9' }}>
                  <Sparkles size={12} fill="#67e8f9" /> Gemini Generative Active
                </span>
              ) : (
                <span className="tag-pill" style={{ background: 'var(--warning-glow)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fde047' }}>
                  Sandbox Simulator Active
                </span>
              )}
              <button className="btn btn-secondary" onClick={() => startRoleplay(selectedScenario)}>
                <RefreshCw size={14} /> Restart
              </button>
              <button className="btn btn-accent" onClick={endRoleplay} disabled={isLoading}>
                Complete Session & Evaluate
              </button>
            </div>
          </div>

          {/* Sales Flow Progress Bar */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="sales-flow-tracker">
              <div 
                className="sales-flow-progress-bar" 
                style={{ 
                  width: `${
                    completedSteps.close ? 100 :
                    completedSteps.protect ? 80 :
                    completedSteps.recommend ? 60 :
                    completedSteps.discover ? 40 :
                    completedSteps.connect ? 20 : 0
                  }%` 
                }} 
              />
              <div className={`flow-step ${completedSteps.connect ? 'completed' : currentActiveStep === 'connect' ? 'active' : 'pending'}`}>
                <div className="flow-node">1</div>
                <div className="flow-label">Connect</div>
              </div>
              <div className={`flow-step ${completedSteps.discover ? 'completed' : currentActiveStep === 'discover' ? 'active' : 'pending'}`}>
                <div className="flow-node">2</div>
                <div className="flow-label">Discover</div>
              </div>
              <div className={`flow-step ${completedSteps.recommend ? 'completed' : currentActiveStep === 'recommend' ? 'active' : 'pending'}`}>
                <div className="flow-node">3</div>
                <div className="flow-label">Recommend</div>
              </div>
              <div className={`flow-step ${completedSteps.protect ? 'completed' : currentActiveStep === 'protect' ? 'active' : 'pending'}`}>
                <div className="flow-node">4</div>
                <div className="flow-label">Protect</div>
              </div>
              <div className={`flow-step ${completedSteps.close ? 'completed' : currentActiveStep === 'close' ? 'active' : 'pending'}`}>
                <div className="flow-node">5</div>
                <div className="flow-label">Close</div>
              </div>
            </div>
          </div>

          {/* Main Chat Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
            
            {/* Dialogue Arena */}
            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-bubble ${m.sender === 'advisor' ? 'bubble-advisor' : 'bubble-customer'}`}
                  >
                    {m.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-bubble bubble-customer" style={{ display: 'flex', alignItems: 'center', width: '80px', padding: '0.75rem 1rem' }}>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-bar">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Type your response to the customer..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                />
                <button className="btn btn-primary btn-icon" onClick={sendMessage} disabled={isLoading}>
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Sidebar Active Guidance Coach */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ borderColor: 'rgba(0, 70, 190, 0.3)', background: 'rgba(0, 70, 190, 0.05)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--bby-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles size={16} /> Live Coaching Guide
                </h4>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <h5 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.25rem' }}>{stepHint.title}</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{stepHint.hint}</p>
                </div>
                <div>
                  <h5 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BookOpen size={12} /> Pro-Tip Checklist
                  </h5>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: 1.4 }}>
                    <li>Avoid saying "warranty"—use "protection package" or "peace of mind."</li>
                    <li>Always offer My Best Buy Total or Plus options on premium hardware.</li>
                    <li>Highlight 10% back in rewards or financing to overcome price hurdles.</li>
                  </ul>
                </div>
              </div>

              <div className="glass-card">
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Customer Profile</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Needs:</strong> {selectedScenario.needs}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}><strong>Style:</strong> {selectedScenario.difficulty === 'Easy' ? 'Quickly cooperative' : 'Will bring up multiple financial/risk objections.'}</p>
              </div>
          </div>
          </div>
          </div>
        )}
    </>
  );
}
