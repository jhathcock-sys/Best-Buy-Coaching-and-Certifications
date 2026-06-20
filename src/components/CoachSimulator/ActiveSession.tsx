import React from 'react';
import { ArrowLeft, Mic, MicOff, Send, HelpCircle, FileText, RefreshCw, Check } from 'lucide-react';

export default function ActiveSession({
  selectedEmployee,
  sessionActive,
  setSessionActive,
  messages,
  evaluation,
  isEvaluating,
  finishCoaching,
  handleSend,
  inputVal,
  setInputVal,
  isThinking,
  completedCoachSteps,
  currentCoachStep,
  isVoiceMode,
  toggleVoiceMode,
  isListening,
  handleMicClick,
  playbookSettings
}) {
  if (!sessionActive || !selectedEmployee) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {!evaluation ? (
        <>
          <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="btn btn-secondary btn-icon" onClick={() => setSessionActive(false)}>
                <ArrowLeft size={16} />
              </button>
              <img src={selectedEmployee.avatar} alt="" className="profile-avatar" />
              <div>
                <h3 style={{ fontSize: '1.05rem' }}>Coaching: {selectedEmployee.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Opportunity Gap: {selectedEmployee.metricGap}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className={`btn ${isVoiceMode ? 'btn-accent' : 'btn-secondary'}`} 
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                onClick={toggleVoiceMode}
              >
                {isVoiceMode ? <Mic size={16} /> : <MicOff size={16} />}
                Voice Mode {isVoiceMode ? 'ON' : 'OFF'}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={finishCoaching} 
                disabled={isEvaluating}
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
              >
                {isEvaluating ? 'Evaluating...' : 'Finish & Evaluate Session'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ flex: 2, display: 'flex', flexDirection: 'column', height: '65vh', minHeight: '500px', padding: 0 }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Roleplay Chat</h4>
              </div>
              
              <div className="chat-container" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ 
                    alignSelf: msg.sender === 'coach' ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    background: msg.sender === 'coach' ? 'var(--bby-blue)' : 'rgba(255,255,255,0.08)',
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    borderBottomRightRadius: msg.sender === 'coach' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.sender === 'employee' ? '4px' : '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.text}</p>
                  </div>
                ))}
                {isThinking && (
                  <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                    <div className="skeleton-pulse" style={{ height: '12px', width: '120px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px' }}></div>
                  </div>
                )}
              </div>

              <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {isVoiceMode ? (
                    <button 
                      className={`btn ${isListening ? 'btn-accent pulse-animation' : 'btn-secondary'}`} 
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1rem' }}
                      onClick={handleMicClick}
                    >
                      {isListening ? (
                        <>
                          <Mic size={20} />
                          Listening... Tap to stop
                        </>
                      ) : (
                        <>
                          <MicOff size={20} style={{ opacity: 0.6 }} />
                          Tap Mic to Speak
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Type your response..."
                        style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal, isVoiceMode, null)}
                        disabled={isThinking}
                      />
                      <button 
                        className="btn btn-primary btn-icon" 
                        onClick={() => handleSend(inputVal, isVoiceMode, null)}
                        disabled={isThinking || !inputVal.trim()}
                        style={{ width: '48px', height: '48px', borderRadius: '12px' }}
                      >
                        <Send size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} color="var(--info)" /> GROW Coaching Model
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className={`grow-step-card ${currentCoachStep === 'goal' ? 'active' : ''} ${completedCoachSteps.goal ? 'completed' : ''}`}>
                    <div className="grow-step-header">
                      <span>Goal</span>
                      {completedCoachSteps.goal && <Check size={14} color="var(--success)" />}
                    </div>
                    <p>Establish what the advisor wants to achieve. What is the metric target?</p>
                  </div>
                  
                  <div className={`grow-step-card ${currentCoachStep === 'reality' ? 'active' : ''} ${completedCoachSteps.reality ? 'completed' : ''}`}>
                    <div className="grow-step-header">
                      <span>Reality</span>
                      {completedCoachSteps.reality && <Check size={14} color="var(--success)" />}
                    </div>
                    <p>Discuss the current situation. What barriers are they facing on the floor?</p>
                  </div>
                  
                  <div className={`grow-step-card ${currentCoachStep === 'options' ? 'active' : ''} ${completedCoachSteps.options ? 'completed' : ''}`}>
                    <div className="grow-step-header">
                      <span>Options</span>
                      {completedCoachSteps.options && <Check size={14} color="var(--success)" />}
                    </div>
                    <p>Brainstorm behaviors. How can they use the DISC model to overcome barriers?</p>
                  </div>
                  
                  <div className={`grow-step-card ${currentCoachStep === 'will' ? 'active' : ''} ${completedCoachSteps.will ? 'completed' : ''}`}>
                    <div className="grow-step-header">
                      <span>Will</span>
                      {completedCoachSteps.will && <Check size={14} color="var(--success)" />}
                    </div>
                    <p>Commit to action. What exactly will they do next time?</p>
                  </div>
                </div>
                
                {playbookSettings?.useGemini ? (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h5 style={{ color: 'var(--success)', margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} /> AI Progress Tracking Active
                    </h5>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Gemini is analyzing your conversation and advancing the GROW steps automatically.</p>
                  </div>
                ) : (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <h5 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      Offline Mode Active
                    </h5>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>Progress tracking is simulated. Connect Gemini API for real-time NLP analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: evaluation.score >= 80 ? 'var(--success)' : evaluation.score >= 60 ? 'var(--warning)' : 'var(--error)' }}>
              Evaluation Score: {evaluation.score}%
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Roleplay complete. Here is the feedback on your coaching.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Strengths</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{evaluation.strengths || "Good effort."}</p>
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Opportunities</h4>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{evaluation.opportunities || "Focus on the GROW model."}</p>
            </div>
          </div>
          
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--bby-blue)' }}>Summary Feedback</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{evaluation.feedback}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setSessionActive(false);
              }}
            >
              Return to Roster
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                window.location.hash = '#store-roster';
              }}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <FileText size={16} /> Update Roster Gap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
