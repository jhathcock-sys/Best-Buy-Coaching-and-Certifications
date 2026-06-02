import React, { useState, useEffect } from 'react';
import { EMPLOYEE_SCENARIOS, runOfflineEmployeeCoachingStep, evaluateCoachingSession, generateCoachingLogGemini } from '../services/ai';
import { Users, Sparkles, MessageSquare, ArrowLeft, RefreshCw, Send, HelpCircle, FileText, Check, Copy, AlertCircle } from 'lucide-react';

export default function CoachSimulator({ apiKey, playbookSettings, customScenarios = [], preselectedEmployee, clearPreselectedEmployee, prefillBuilderData, clearPrefillBuilderData, onImportScenario, initialTab = 'sim' }) {
  // Tabs: 'sim' (coaching practice simulation), 'builder' (4-section coaching log builder)
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // GROW Simulator States

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [currentCoachStep, setCurrentCoachStep] = useState('goal');
  const [completedCoachSteps, setCompletedCoachSteps] = useState({
    goal: false,
    reality: false,
    options: false,
    will: false
  });
  const [evaluation, setEvaluation] = useState(null);
  
  // NLP Scenario Importer States
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [parseLogs, setParseLogs] = useState(null);

  // 4-Section Coaching Log Builder States
  const [builderForm, setBuilderForm] = useState({
    employeeName: '',
    what: '',
    how: '',
    why: '',
    strengths: '',
    metricGap: 'Memberships',
    gapDetails: '',
    expectation: '',
    validation: ''
  });
  const [isGeneratingLog, setIsGeneratingLog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Pre-configured Best Buy Templates
  const TEMPLATES = {
    memberships: {
      employeeName: 'Jordan',
      what: 'Introduce My Best Buy Plus & Total memberships earlier during needs discovery.',
      how: 'Ask the customer how they currently handle setup and support, and position Total as an umbrella safety shield covering setup and support.',
      why: 'Gives the customer peace of mind, unlocks exclusive member pricing, and drives customer loyalty.',
      strengths: 'Outstanding customer greetings, warm rapport building, and excellent product knowledge.',
      metricGap: 'Memberships',
      gapDetails: 'Membership Attach is at 2.1% vs store goal of 5.0%.',
      expectation: 'Achieve a consistent 5.0% membership attach rate over the next two weeks.',
      validation: 'Leader will perform 3 side-by-side floor observations and check weekly reporting.'
    },
    gsp: {
      employeeName: 'Marcus',
      what: 'Recommend Geek Squad Protection (GSP) or AppleCare+ during the product demo.',
      how: 'Tie protection directly to their usage. For example: "Since your son is carrying this around college classes, drop and spill coverage is crucial."',
      why: 'Saves the customer from costly repair bills and ensures their tech remains operational for college.',
      strengths: 'Asks fantastic discovery questions and is highly professional and polite.',
      metricGap: 'Warranty/GSP',
      gapDetails: 'GSP Attach rate is currently 4.8% vs store goal of 12.0%.',
      expectation: 'Offer GSP on 100% of qualified transactions to hit 10% GSP attach rate by next week.',
      validation: 'Leader will audit hardware protection attach rates on the Sunday report and run checkout register observation logs.'
    },
    card: {
      employeeName: 'Taylor',
      what: 'Pitch the My Best Buy Credit Card to resolve purchase budget barriers.',
      how: 'Propose the 12-month interest-free financing or 10% back in rewards early when customers look hesitant about high-end pricing.',
      why: 'Gives the customer flexible buying power and rewards them heavily on their purchase today.',
      strengths: 'Matches solutions perfectly and is great at closing sales.',
      metricGap: 'BBY Credit Card',
      gapDetails: 'BBY Credit Card apps are at 2 submissions vs monthly goal of 8.',
      expectation: 'Propose financing or rewards on all transactions exceeding $300 today.',
      validation: 'Validate through counter observation side-by-sides and check submitted apps weekly.'
    },
    surveys: {
      employeeName: 'Alex',
      what: 'Maintain deep emotional rapport and ask for a 5-Star Survey feedback.',
      how: 'Be human throughout the sale, write your name on the receipt card, and say: "I hope I made your tech easy today. Please let me know how I did on the survey!"',
      why: 'Helps us track and improve store experience and rewards advisors for great customer service.',
      strengths: 'Technically competent, highly efficient at checkout processing.',
      metricGap: '5-Star Surveys',
      gapDetails: 'Average customer survey index is at 4.2 stars vs goal of 4.8 stars.',
      expectation: 'Increase 5-Star ratings to maintain a 4.8+ survey index over the next 30 days.',
      validation: 'Audit 5-star comments weekly and observe customer checkout interactions.'
    }
  };

  // Handle preselected coaching from Store Roster
  useEffect(() => {
    if (preselectedEmployee) {
      const displayAvatar = preselectedEmployee.dept === 'Computing' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' : 
                            preselectedEmployee.dept === 'Home Theatre' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' :
                            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
      
      const dynamicScen = {
        id: `roster-${preselectedEmployee.id}`,
        title: `Coaching Roster: ${preselectedEmployee.name}`,
        role: 'Employee',
        name: `${preselectedEmployee.name} (${preselectedEmployee.dept})`,
        avatar: displayAvatar,
        description: `Roster coaching for last month's performance data. Metric Gap: ${preselectedEmployee.gap}`,
        metricGap: preselectedEmployee.gap,
        initialGreeting: `Hi boss. I saw last month's performance data. I know my numbers are low on my gap for ${preselectedEmployee.gap}, but I feel like I'm trying. Customers just say no. What should I do differently?`,
        personality: 'Defensive initially, but opens up to GROW coaching prompts.',
        coachingGoal: `Coaching plan for ${preselectedEmployee.name} based on retail metrics.`
      };
      
      setActiveTab('sim');
      startCoaching(dynamicScen);
      clearPreselectedEmployee();
    }
  }, [preselectedEmployee]);

  // Handle prefilled Coaching Log Builder from Store Roster
  useEffect(() => {
    if (prefillBuilderData) {
      const getPrefillGapType = () => {
        const gap = (prefillBuilderData.gap || '').toLowerCase();
        if (gap.includes('membership')) return 'Memberships';
        if (gap.includes('card') || gap.includes('credit')) return 'BBY Credit Card';
        if (gap.includes('gsp') || gap.includes('warranty') || gap.includes('protection')) return 'Warranty/GSP';
        if (gap.includes('survey')) return '5-Star Surveys';
        return 'RPH';
      };

      setBuilderForm({
        employeeName: prefillBuilderData.name || '',
        what: '',
        how: '',
        why: '',
        strengths: (prefillBuilderData.memberships || 0) >= 5.0 ? 'Incredible membership attach rate and strong floor presence!' : 'Friendly greetings, proactive attitude on the floor.',
        metricGap: getPrefillGapType(),
        gapDetails: `${prefillBuilderData.gap || ''} (RPH: $${prefillBuilderData.rph || 0}, surveys: ${prefillBuilderData.surveys || 0})`,
        expectation: `Raise metrics to meet store benchmarks over the next 14 days.`,
        validation: `Store leader will perform counter observations and check weekly reporting.`
      });
      
      setActiveTab('builder');
      clearPrefillBuilderData();
    }
  }, [prefillBuilderData]);

  const loadTemplate = (type) => {
    if (TEMPLATES[type]) {
      setBuilderForm(TEMPLATES[type]);
    }
  };

  // Run a generative auto-fill using Gemini AI
  const handleAIFillCoachingLog = async () => {
    if (!apiKey || apiKey.trim().length < 10) return;
    if (!builderForm.employeeName.trim()) {
      alert("Please enter the Employee Name first so the AI can customize the log!");
      return;
    }
    
    setIsGeneratingLog(true);
    try {
      const data = await generateCoachingLogGemini(
        apiKey,
        builderForm.employeeName,
        builderForm.metricGap,
        builderForm.gapDetails || "Needs performance coaching to meet store targets",
        builderForm.strengths,
        playbookSettings
      );
      
      if (data) {
        setBuilderForm(prev => ({
          ...prev,
          what: data.what,
          how: data.how,
          why: data.why,
          strengths: data.strengths,
          expectation: data.expectation,
          validation: data.validation
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLog(false);
    }
  };

  // Compile formatted Markdown output
  const compileCoachingLogText = () => {
    return `### BEST BUY COACHING LOG: ${builderForm.employeeName.toUpperCase()}
Date: ${new Date().toLocaleDateString()}
Metric Focus: ${builderForm.metricGap}

--------------------------------------------------
1. THE CORE OBJECTIVE (WHAT / HOW / WHY)
--------------------------------------------------
* WHAT we need them to do:
  ${builderForm.what || 'Pending...'}

* HOW we need them to do it:
  ${builderForm.how || 'Pending...'}

* WHY we need them to do it:
  ${builderForm.why || 'Pending...'}

--------------------------------------------------
2. CURRENT STRENGTHS (DOING WELL)
--------------------------------------------------
* What they are currently doing well:
  ${builderForm.strengths || 'Pending...'}

--------------------------------------------------
3. PERFORMANCE METRIC GAP
--------------------------------------------------
* Gap we are trying to fill:
  ${builderForm.gapDetails || 'Pending...'}

--------------------------------------------------
4. EXPECTATIONS & VALIDATION METHOD
--------------------------------------------------
* Expectation of results:
  ${builderForm.expectation || 'Pending...'}

* How we will validate:
  ${builderForm.validation || 'Pending...'}`;
  };

  const handleCopyToClipboard = () => {
    const text = compileCoachingLogText();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const startCoaching = (employee) => {
    setSelectedEmployee(employee);
    setSessionActive(true);
    setMessages([
      { sender: 'employee', text: employee.initialGreeting }
    ]);
    setCompletedCoachSteps({
      goal: false,
      reality: false,
      options: false,
      will: false
    });
    setCurrentCoachStep('goal');
    setEvaluation(null);
  };

  const finishCoaching = () => {
    const history = {
      messages: messages,
      completedCoachSteps: completedCoachSteps,
      currentCoachStep: currentCoachStep
    };
    const evalResult = evaluateCoachingSession(history);
    setEvaluation(evalResult);
  };

  const handleImportPastCoaching = () => {
    if (!importText.trim()) {
      alert("Please paste some coaching text first!");
      return;
    }
    
    let name = "Advisor";
    let gap = "Memberships";
    
    // NLP parsing
    const nameMatch = importText.match(/(?:coaching log|employee|name|advisor):\s*([a-zA-Z\s\/]+)/i) || 
                      importText.match(/(?:log for|coaching):\s*([a-zA-Z\s\/]+)/i) ||
                      importText.match(/^([a-zA-Z\s\/]+)\s+(?:is struggling|has a gap|needs)/im);
                      
    if (nameMatch) {
      name = nameMatch[1].trim().split('\n')[0].split('(')[0].trim();
    }
    
    const gapMatch = importText.match(/(?:gap|opportunity|focus|metric):\s*([a-zA-Z0-9\s%\-\+\/\$]+)/i) ||
                     importText.match(/(?:struggling with|low on):\s*([a-zA-Z0-9\s%\-\+\/\$]+)/i);
                     
    if (gapMatch) {
      gap = gapMatch[1].trim().split('\n')[0].trim();
    } else {
      const lowerText = importText.toLowerCase();
      if (lowerText.includes('membership') || lowerText.includes('total') || lowerText.includes('plus')) {
        gap = 'Memberships';
      } else if (lowerText.includes('credit card') || lowerText.includes('card') || lowerText.includes('app')) {
        gap = 'BBY Credit Cards';
      } else if (lowerText.includes('gsp') || lowerText.includes('warranty') || lowerText.includes('protection')) {
        gap = 'GSP Attach';
      } else if (lowerText.includes('survey') || lowerText.includes('csat') || lowerText.includes('5-star')) {
        gap = '5-Star Surveys';
      } else if (lowerText.includes('rph') || lowerText.includes('revenue')) {
        gap = 'RPH';
      }
    }
    
    const customScen = {
      id: `imported-${Date.now()}`,
      title: `Imported: ${name} (${gap})`,
      role: 'Employee',
      name: `${name} (Imported)`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: `Custom scenario extracted from pasted coaching notes. Focus Area: ${gap}.`,
      metricGap: gap,
      initialGreeting: `Hey Boss. I read your feedback notes about my gap in ${gap}. I want to do better, but I'm really struggling on the floor. Can you help me figure out what I should do?`,
      personality: 'Receptive and willing to learn, but needs specific, actionable guidance.',
      coachingGoal: `Coach ${name} to close their performance gap in ${gap}.`
    };
    
    if (onImportScenario) {
      onImportScenario(customScen);
    }
    
    setParseLogs({ name, gap });
    setImportSuccess(true);
    setImportText('');
    setTimeout(() => {
      setImportSuccess(false);
    }, 5000);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const currentMsg = inputVal;
    setInputVal('');
    
    setMessages(prev => [...prev, { sender: 'coach', text: currentMsg }]);
    
    setTimeout(() => {
      const history = {
        messages: messages,
        completedCoachSteps: completedCoachSteps,
        currentCoachStep: currentCoachStep
      };
      
      const nextState = runOfflineEmployeeCoachingStep(currentMsg, history, selectedEmployee);
      
      setMessages(nextState.messages);
      setCompletedCoachSteps(nextState.completedCoachSteps);
      setCurrentCoachStep(nextState.currentCoachStep);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Platform Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Leader Coaching Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Practice roleplaying coaching conversations or document structured employee feedback logs.</p>
        </div>

        {/* Tab Switcher */}
        {!sessionActive && (
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <button 
              className={`btn ${activeTab === 'sim' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
              onClick={() => setActiveTab('sim')}
            >
              GROW Practice Simulator
            </button>
            <button 
              className={`btn ${activeTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
              onClick={() => setActiveTab('builder')}
            >
              4-Section Log Builder
            </button>
          </div>
        )}
      </div>

      {/* ==========================================
          TAB 1: GROW SIMULATOR & IMPORTER VIEW
          ========================================== */}
      {activeTab === 'sim' && !sessionActive && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Active Employees List */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users color="var(--bby-blue)" size={22} /> Employee Coaching Scenarios
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.75rem' }}>
              Select an advisor to run a simulated GROW coaching conversation. Guide them behaviorally to address their metric targets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[...(Array.isArray(EMPLOYEE_SCENARIOS) ? EMPLOYEE_SCENARIOS : []), ...(Array.isArray(customScenarios) ? customScenarios : [])].map(employee => (
                <div 
                  key={employee.id} 
                  style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={employee.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--bby-blue)' }} />
                    <div>
                      <h3 style={{ fontSize: '0.95rem' }}>{employee.name}</h3>
                      <span className="tag-pill" style={{ background: 'var(--error-glow)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginTop: '0.25rem' }}>
                        Gap: {employee.metricGap}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {employee.description}
                  </p>

                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => startCoaching(employee)}>
                    Practice Coaching {employee.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Past Coachings Importer */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles color="var(--bby-yellow)" size={22} /> Past Coaching Importer
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.5rem' }}>
                Have coachings you generated in Gemini or past emails? Paste the coaching notes here. The local parser will extract performance parameters and build a custom simulation!
              </p>

              <div className="form-group">
                <label className="form-label">Paste Past Coaching Transcript / Text:</label>
                <textarea 
                  className="form-control" 
                  rows={8}
                  style={{ resize: 'none', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  placeholder={`Example:\nJordan is struggling with Credit Cards today. She feels it's too pushy and gets awkward. Gaps: BBY Credit Card attachment. Goals: Pitch financing early during screen discussions...`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>
            </div>

            <div>
              {importSuccess && parseLogs && (
                <div style={{ padding: '1rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.8rem', color: '#a7f3d0', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}><Check size={14} /> IMPORT COMPLETED SUCCESSFULY!</div>
                  <div><strong>Employee Scoped:</strong> {parseLogs.name}</div>
                  <div><strong>Gap Identified:</strong> {parseLogs.gap}</div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.75rem', marginTop: '0.25rem' }}>"Custom scenario added to Advisor Practice dropdown."</div>
                </div>
              )}
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleImportPastCoaching}>
                Execute NLP Text Extraction
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: 4-SECTION COACHING LOG BUILDER VIEW
          ========================================== */}
      {activeTab === 'builder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          
          {/* Left Column: Form Fields */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Quick Templates Selector */}
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', color: '#fff' }}>Load Standard Templates:</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => loadTemplate('memberships')}>
                  Membership Gap
                </button>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => loadTemplate('gsp')}>
                  GSP / Warranty
                </button>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => loadTemplate('card')}>
                  Credit Cards
                </button>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => loadTemplate('surveys')}>
                  5-Star Surveys
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee Name:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter Employee Name"
                    value={builderForm.employeeName}
                    onChange={(e) => setBuilderForm({ ...builderForm, employeeName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Metric Gap Focus:</label>
                  <select 
                    className="form-control"
                    value={builderForm.metricGap}
                    onChange={(e) => setBuilderForm({ ...builderForm, metricGap: e.target.value })}
                  >
                    <option value="Memberships">Memberships (Plus/Total)</option>
                    <option value="BBY Credit Card">BBY Credit Card</option>
                    <option value="Warranty/GSP">Warranty / GSP</option>
                    <option value="5-Star Surveys">5-Star Surveys</option>
                    <option value="RPH">RPH (Revenue Per Hour)</option>
                  </select>
                </div>
              </div>

              {/* Section 1: The Core Objective */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(0,70,190,0.02)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--bby-yellow)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                  SECTION 1: THE CORE OBJECTIVE (WHAT / HOW / WHY)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">WHAT we need them to do:</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Introduce protection plans earlier during product discovery."
                      value={builderForm.what}
                      onChange={(e) => setBuilderForm({ ...builderForm, what: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">HOW we need them to do it:</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Ask if the customer has drops/spill concerns and describe protection covering screen cracks."
                      value={builderForm.how}
                      onChange={(e) => setBuilderForm({ ...builderForm, how: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WHY we need them to do it:</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Protects the customer investment and drives store protection indices."
                      value={builderForm.why}
                      onChange={(e) => setBuilderForm({ ...builderForm, why: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Currently doing well */}
              <div className="form-group">
                <label className="form-label">SECTION 2: What they are currently doing well:</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="e.g. Great friendly greetings and congratulations on college major."
                  value={builderForm.strengths}
                  onChange={(e) => setBuilderForm({ ...builderForm, strengths: e.target.value })}
                />
              </div>

              {/* Section 3: Metric Gap */}
              <div className="form-group">
                <label className="form-label">SECTION 3: Metric Gap details:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. GSP attach is 4.8% vs store goal of 12.0%"
                  value={builderForm.gapDetails}
                  onChange={(e) => setBuilderForm({ ...builderForm, gapDetails: e.target.value })}
                />
              </div>

              {/* Section 4: Expectations & Validation */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(16,185,129,0.02)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--success)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                  SECTION 4: EXPECTATIONS & VALIDATION
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expectations of results (SMART target):</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Elevate GSP Attach to 10% by next week."
                      value={builderForm.expectation}
                      onChange={(e) => setBuilderForm({ ...builderForm, expectation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">How leaders will validate / audit results:</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Leader will perform 3 side-by-side floor observations and check weekly reporting."
                      value={builderForm.validation}
                      onChange={(e) => setBuilderForm({ ...builderForm, validation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* AI Auto-generate helper block */}
              {apiKey && apiKey.trim().length > 10 ? (
                <button 
                  className="btn btn-accent" 
                  style={{ width: '100%', marginTop: '0.5rem' }} 
                  onClick={handleAIFillCoachingLog}
                  disabled={isGeneratingLog}
                >
                  {isGeneratingLog ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Generating Plan...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <Sparkles size={16} /> Auto-Generate 4-Section Coaching Plan using Gemini
                    </div>
                  )}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={14} />
                  <span>Configure your Google AI Studio API key in the **Playbook Studio** to unlock AI Auto-Fills.</span>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Dynamic Formatted Output Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--info)" /> Coaching Log Preview
                </h3>
                <span className="tag-pill" style={{ fontSize: '0.7rem' }}>Best Buy Standard Layout</span>
              </div>

              <textarea 
                className="form-control" 
                style={{ 
                  flex: 1, 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem', 
                  lineHeight: 1.4, 
                  background: 'rgba(11,15,25,0.7)', 
                  borderColor: 'rgba(255,255,255,0.05)', 
                  resize: 'none',
                  minHeight: '400px'
                }}
                readOnly
                value={compileCoachingLogText()}
              />

              {copySuccess && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--success-glow)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', fontSize: '0.8rem', color: '#a7f3d0', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} /> Coaching Log copied to clipboard! Ready to paste.
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={handleCopyToClipboard}
              >
                <Copy size={16} /> Copy Formatted Coaching Log
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 1 - SUBSECTION: ACTIVE COACHING ARENA
          ========================================== */}
      {sessionActive && !evaluation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => startCoaching(selectedEmployee)}>
                <RefreshCw size={14} /> Restart
              </button>
              <button className="btn btn-accent" onClick={finishCoaching}>
                Complete Coaching Session
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="sales-flow-tracker" style={{ padding: '0 2rem' }}>
              <div 
                className="sales-flow-progress-bar" 
                style={{ 
                  width: `${
                    completedCoachSteps.will ? 100 :
                    completedCoachSteps.options ? 66 :
                    completedCoachSteps.reality ? 33 : 0
                  }%` 
                }} 
              />
              <div className={`flow-step ${completedCoachSteps.goal ? 'completed' : currentCoachStep === 'goal' ? 'active' : 'pending'}`}>
                <div className="flow-node">G</div>
                <div className="flow-label">Goal</div>
              </div>
              <div className={`flow-step ${completedCoachSteps.reality ? 'completed' : currentCoachStep === 'reality' ? 'active' : 'pending'}`}>
                <div className="flow-node">R</div>
                <div className="flow-label">Reality</div>
              </div>
              <div className={`flow-step ${completedCoachSteps.options ? 'completed' : currentCoachStep === 'options' ? 'active' : 'pending'}`}>
                <div className="flow-node">O</div>
                <div className="flow-label">Options</div>
              </div>
              <div className={`flow-step ${completedCoachSteps.will ? 'completed' : currentCoachStep === 'will' ? 'active' : 'pending'}`}>
                <div className="flow-node">W</div>
                <div className="flow-label">Will</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
            
            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-bubble ${m.sender === 'coach' ? 'bubble-coach-active' : 'bubble-employee-active'}`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="chat-input-bar">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Ask a coaching question, show empathy, or discuss action steps..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="btn btn-primary btn-icon" onClick={handleSend}>
                  <Send size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-card" style={{ background: 'rgba(0, 70, 190, 0.05)', borderColor: 'rgba(0, 70, 190, 0.2)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--bby-yellow)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <HelpCircle size={14} /> GROW Active Phase Guide
                </h4>
                
                {currentCoachStep === 'goal' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Goal Stage:</strong> Get Jordan/Marcus to define their goals. What do they think their targets should be?
                  </p>
                )}
                {currentCoachStep === 'reality' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Reality Stage:</strong> Uncover the obstacles. Show empathy! (e.g. "I understand that can feel uncomfortable"). Ask: Where do you feel the sales flow breaks down?
                  </p>
                )}
                {currentCoachStep === 'options' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Options Stage:</strong> Brainstorm together! Ask: What could we try next time? What options do you see?
                  </p>
                )}
                {currentCoachStep === 'will' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Will Stage:</strong> Establish commitment. Set concrete behavioral action steps. Agree on a follow-up review.
                  </p>
                )}
              </div>

              <div className="glass-card">
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Coaching Standards</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  At Best Buy, we lead with humanity. Avoid commanding or lecturing. Instead, ask open-ended questions that guide employees to discover solutions themselves.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* EVALUATION VIEW FOR MANAGERS */}
      {evaluation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Coaching Effectiveness Report</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Evaluates manager capability in GROW framework behavioral coaching.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => startCoaching(selectedEmployee)}>
                <RefreshCw size={14} /> Practice Again
              </button>
              <button className="btn btn-primary" onClick={() => setSessionActive(false)}>
                Return to Employees List
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem' }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="55" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="65" 
                    cy="65" 
                    r="55" 
                    stroke="var(--bby-yellow)" 
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 55}
                    strokeDashoffset={2 * Math.PI * 55 - (evaluation.score / 100) * (2 * Math.PI * 55)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>{evaluation.score}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rating</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
                {evaluation.passed ? "COACHING APPROVED" : "DEVELOPMENT ADVISED"}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                Target coaching score is 75% or higher, showing alignment to GROW core behaviors.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--bby-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} /> Coaching Evaluation Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
                <div className="gauge-row">
                  <span>Active Empathy & Listening</span>
                  <div className="gauge-progress-bar">
                    <div className="gauge-progress-fill" style={{ width: `${evaluation.details.empathy}%`, background: 'var(--success)' }} />
                  </div>
                  <span>{evaluation.details.empathy}/100</span>
                </div>
                <div className="gauge-row">
                  <span>GROW Structure Alignment</span>
                  <div className="gauge-progress-bar">
                    <div className="gauge-progress-fill" style={{ width: `${evaluation.details.structure}%`, background: 'var(--bby-yellow)' }} />
                  </div>
                  <span>{evaluation.details.structure}/100</span>
                </div>
                <div className="gauge-row">
                  <span>Actionable Follow-up Commitment</span>
                  <div className="gauge-progress-bar">
                    <div className="gauge-progress-fill" style={{ width: `${evaluation.details.actionable}%`, background: 'var(--info)' }} />
                  </div>
                  <span>{evaluation.details.actionable}/100</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>Feedback & Development Tips</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {evaluation.feedback}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
