import React, { useState, useEffect, useRef, useMemo } from 'react';
import { STANDARD_SCENARIOS, runOfflineSimulationStep, runGeminiSimulationStep, evaluateSessionOffline, evaluateSessionGemini } from '../services/ai';
import { MessageSquare, ArrowLeft, RefreshCw, Send, Award, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RoleplayCenter({ playbookSettings, onCompleteRoleplay, customScenarios = [] }) {
  const { apiKey, setActiveView } = useApp();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [currentActiveStep, setCurrentActiveStep] = useState('connect');
  const [completedSteps, setCompletedSteps] = useState({
    connect: false,
    discover: false,
    recommend: false,
    protect: false,
    close: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  
  const chatBottomRef = useRef(null);

  const allScenarios = useMemo(() => [...STANDARD_SCENARIOS, ...customScenarios], [customScenarios]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const startRoleplay = (scenario) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    setEvaluation(null);
    setCurrentActiveStep('connect');
    setCompletedSteps({
      connect: false,
      discover: false,
      recommend: false,
      protect: false,
      close: false
    });
    setMessages([
      { sender: 'customer', text: scenario.initialGreeting }
    ]);
  };

  const handleSend = async () => {
    if (!inputVal.trim() || isLoading) return;
    const currentMsg = inputVal;
    setInputVal('');
    
    // Optimistically add advisor's response
    setMessages(prev => [...prev, { sender: 'advisor', text: currentMsg }]);
    setIsLoading(true);
    
    try {
      const history = {
        messages: messages,
        completedSteps: completedSteps,
        currentActiveStep: currentActiveStep,
        metrics: {}
      };
      
      let nextState;
      if (apiKey && apiKey.trim().length > 10) {
        // Use live Gemini Generative AI
        nextState = await runGeminiSimulationStep(apiKey, currentMsg, history, selectedScenario, playbookSettings);
      } else {
        // Use standard offline Sandbox dialog engine
        nextState = runOfflineSimulationStep(currentMsg, history, selectedScenario, playbookSettings);
      }
      
      // Update states
      setMessages(nextState.messages);
      setCompletedSteps(nextState.completedSteps);
      setCurrentActiveStep(nextState.currentActiveStep);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const endAndEvaluate = async () => {
    setIsLoading(true);
    setIsEvaluating(true);
    try {
      const history = {
        messages: messages,
        completedSteps: completedSteps
      };
      
      let result;
      const isProMode = playbookSettings.aiMode === 'pro';
      const hasApiKey = apiKey && apiKey.trim().length > 10;
      
      if (isProMode) {
        const response = await fetch('/api/audit-dialogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history,
            scenario: selectedScenario,
            playbookSettings
          })
        });
        if (!response.ok) throw new Error('Premium dialogue audit failed.');
        result = await response.json();
      } else if (hasApiKey) {
        result = await evaluateSessionGemini(apiKey, history, selectedScenario, playbookSettings);
      } else {
        result = evaluateSessionOffline(history, selectedScenario, playbookSettings);
      }
      
      setEvaluation(result);
      
      // Notify parent system to update employee dashboard metrics
      onCompleteRoleplay({
        scenarioId: selectedScenario.id,
        category: selectedScenario.category,
        customerName: selectedScenario.name,
        avatar: selectedScenario.avatar,
        score: result.overallScore,
        passed: result.passed,
        growReport: result.growReport,
        metrics: result.overallScore >= 80 ? {
          memberships: completedSteps.recommend ? 100 : 0,
          creditCards: completedSteps.close ? 1 : 0,
          warranty: completedSteps.protect ? 100 : 0,
          surveys: completedSteps.connect ? 5.0 : 3.0,
          rph: completedSteps.close ? 1380 : 950
        } : null
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsEvaluating(false);
    }
  };

  const getStepHint = () => {
    switch (currentActiveStep) {
      case 'connect':
        return {
          title: 'Step 1: Connect / Welcome',
          hint: 'Welcome the customer in a warm, empathetic way. Ask for their name and build rapport (e.g. congratulations on their son going to college).'
        };
      case 'discover':
        return {
          title: 'Step 2: Discover / Understand',
          hint: 'Ask open-ended questions! Uncover their exact requirements (major, daily computer usage, portability desires, setup preferences).'
        };
      case 'recommend':
        return {
          title: 'Step 3: Sell / Recommend',
          hint: 'Propose a premium computer (e.g. MacBook or HP Spectre) and introduce My Best Buy Plus/Total membership to unlock support and price savings.'
        };
      case 'protect':
        return {
          title: 'Step 4: GSP / Protect',
          hint: 'Recommend Geek Squad Protection or AppleCare+, highlighting coverages for accidental drops, liquid spills, and repairs.'
        };
      case 'close':
        return {
          title: 'Step 5: BBY Card / Close',
          hint: 'Pitch the Best Buy Credit Card offering 12-month interest-free financing or 10% back in rewards. Confidently ask for the sale!'
        };
      default:
        return {
          title: 'Simulation Complete',
          hint: 'Great job! Click Complete Session & Evaluate in the upper right to get your performance feedback.'
        };
    }
  };

  const stepHint = getStepHint();

  return (
    <div>
      {/* 1. SCENARIOS SELECTOR VIEW */}
      {!sessionActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Consultative Practice Arena</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Select a customer profile to practice the Best Buy sales process and test your consultative skills.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {allScenarios.map(scenario => (
              <div key={scenario.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="tag-pill tag-pill-active">{scenario.category}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: scenario.difficulty === 'Hard' ? 'var(--error)' : scenario.difficulty === 'Medium' ? 'var(--warning)' : 'var(--success)' 
                    }}>
                      {scenario.difficulty.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={scenario.avatar} alt="" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid var(--bby-blue)', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{scenario.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customer: {scenario.name}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {scenario.description}
                  </p>
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => startRoleplay(scenario)}>
                  Launch Roleplay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LIVE SIMULATION PLAY ARENA */}
      {sessionActive && !evaluation && (
        isEvaluating ? (
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
              <button className="btn btn-accent" onClick={endAndEvaluate} disabled={isLoading}>
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
                <div ref={chatBottomRef} />
              </div>

              <div className="chat-input-bar">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Type your response to the customer..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={isLoading}>
                  <Send size={16} />
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
        )
      )}

      {/* 3. EVALUATION FEEDBACK DASHBOARD VIEW */}
      {evaluation && (
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
      )}
    </div>
  );
}
