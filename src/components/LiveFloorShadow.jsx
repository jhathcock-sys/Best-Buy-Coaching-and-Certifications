import { useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';
import { generateCoachingLogGemini } from '../services/ai';

export default function LiveFloorShadow({ 
  roster = [], 
  onLogCoachingSession, 
  onAddFollowUpTask, 
  onNavigate, 
  preselectedEmployee, 
  clearPreselectedEmployee,
  playbookSettings,
  apiKey
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [department, setDepartment] = useState('General Sales');
  const [isGenerating, setIsGenerating] = useState(false);

  const [prevPreselectedEmployee, setPrevPreselectedEmployee] = useState(preselectedEmployee);

  if (preselectedEmployee !== prevPreselectedEmployee) {
    setPrevPreselectedEmployee(preselectedEmployee);
    if (preselectedEmployee) {
      setSelectedEmpId(preselectedEmployee.id || '');
      setTimeout(() => {
        if (clearPreselectedEmployee) clearPreselectedEmployee();
      }, 50);
    }
  }
  
  // DISC Checklist States
  const [checklist, setChecklist] = useState({
    // Discover
    greeting: false,
    nameExchange: false,
    setupProbe: false,
    specQuestions: false,
    avoidedForbidden: false,
    // Inspire
    builtRapport: false,
    emotionalDriver: false,
    demoProduct: false,
    membershipBenefits: false,
    // Solve
    membershipPitched: false,
    warrantyAttached: false,
    solutionMatched: false,
    // Close
    creditCardPitched: false,
    handledObjections: false,
    surveyRequested: false,
    sleeveReceipt: false
  });

  // Final Details
  const [strengths, setStrengths] = useState('');
  const [gapDetails, setGapDetails] = useState('');
  const [followUpAction, setFollowUpAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // UI status
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [compiledLog, setCompiledLog] = useState('');

  // Find selected employee object
  const selectedEmployee = roster.find(emp => emp.id === selectedEmpId);

  // Handle employee dropdown select
  const handleSelectEmployee = (empId) => {
    setSelectedEmpId(empId);
    const emp = roster.find(e => e.id === empId);
    if (emp) {
      setDepartment(emp.dept || 'General Sales');
      // Set some pre-filled gaps if they have one
      if (emp.gap && emp.gap !== 'None') {
        setGapDetails(`Associate has an active performance focus: ${emp.gap}`);
      } else {
        setGapDetails('');
      }
    }
  };

  const toggleChecklistItem = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Compile the GROW log format
  const generateGrowLog = () => {
    const empName = selectedEmployee ? selectedEmployee.name : 'Advisor';
    
    // Group checklist items for strengths/gaps output
    const discoverStrengths = [];
    const discoverGaps = [];
    if (checklist.greeting) discoverStrengths.push("Initiated a friendly, welcoming greeting within 10 seconds/10 feet"); else discoverGaps.push("Initiate friendly, welcoming greeting within 10 seconds/10 feet");
    if (checklist.nameExchange) discoverStrengths.push("Exchanged names and introduced self"); else discoverGaps.push("Exchange names and introduce self");
    if (checklist.setupProbe) discoverStrengths.push("Probed customer's setup/environment"); else discoverGaps.push("Probe environment setup/use case");
    if (checklist.specQuestions) discoverStrengths.push("Asked open-ended lifestyle/spec questions"); else discoverGaps.push("Ask open-ended spec/lifestyle questions");
    if (checklist.avoidedForbidden) discoverStrengths.push("Avoided forbidden retail words"); else discoverGaps.push("Avoid forbidden vocabulary (e.g., 'warranty', 'deal')");

    const inspireStrengths = [];
    const inspireGaps = [];
    if (checklist.builtRapport) inspireStrengths.push("Connected personally / built human rapport"); else inspireGaps.push("Connect personally / build human rapport (Family, Occupation, Recreation)");
    if (checklist.emotionalDriver) inspireStrengths.push("Uncovered customer emotional driver"); else inspireGaps.push("Uncover the emotional driver/purpose behind the purchase");
    if (checklist.demoProduct) inspireStrengths.push("Demonstrated product/service features"); else inspireGaps.push("Demonstrate product/service features physically or digitally");
    if (checklist.membershipBenefits) inspireStrengths.push("Shared membership benefits (Plus/Total) during demo"); else inspireGaps.push("Share membership benefits during the product demo");

    const solveStrengths = [];
    const solveGaps = [];
    if (checklist.membershipPitched) solveStrengths.push("Pitched My Best Buy Plus/Total to support solution"); else solveGaps.push("Pitch My Best Buy Plus/Total to support the complete solution");
    if (checklist.warrantyAttached) solveStrengths.push("Attached GSP protection / AppleCare+"); else solveGaps.push("Attach GSP protection or AppleCare+");
    if (checklist.solutionMatched) solveStrengths.push("Matched the complete solution"); else solveGaps.push("Match the complete solution (hardware + services + accessories)");

    const closeStrengths = [];
    const closeGaps = [];
    if (checklist.creditCardPitched) closeStrengths.push("Pitched Best Buy Credit Card financing/rewards"); else closeGaps.push("Pitch Best Buy Credit Card financing/rewards early");
    if (checklist.handledObjections) closeStrengths.push("Handled customer objections professionally"); else closeGaps.push("Acknowledge and handle customer objections professionally");
    if (checklist.surveyRequested) closeStrengths.push("Requested customer feedback via 5-Star Survey"); else closeGaps.push("Request customer feedback via 5-Star Survey");
    if (checklist.sleeveReceipt) closeStrengths.push("Receipt in sleeve with written advisor name"); else closeGaps.push("Place receipt in sleeve with written advisor name and thank customer");

    const allStrengths = [...discoverStrengths, ...inspireStrengths, ...solveStrengths, ...closeStrengths];
    const allGaps = [...discoverGaps, ...inspireGaps, ...solveGaps, ...closeGaps];

    // Determine primary DISC focus
    let discFocus = 'Solve';
    if (discoverGaps.length > inspireGaps.length && discoverGaps.length > solveGaps.length && discoverGaps.length > closeGaps.length) {
      discFocus = 'Discover';
    } else if (inspireGaps.length > discoverGaps.length && inspireGaps.length > solveGaps.length && inspireGaps.length > closeGaps.length) {
      discFocus = 'Inspire';
    } else if (closeGaps.length > discoverGaps.length && closeGaps.length > inspireGaps.length && closeGaps.length > solveGaps.length) {
      discFocus = 'Close';
    }

    const todayDate = new Date().toLocaleDateString();

    return `## 📋 Coaching Plan: ${empName} (Live Floor Shadowing) — DISC Focus: ${discFocus}

* **What**: Reinforce Best Buy's DISC sales model, specifically targeting: ${discFocus} phase execution.
* **How**: Practice and build consistency in customer interactions. Focus on:
${allGaps.map(g => `  - ${g}`).join('\n') || '  - Maintaining current high performance standard.'}
* **Why**: To drive department benchmarks (RPH, GSP%, memberships attach) and deliver excellent, customer-centric checkout scores.
* **Behavior**: Focus on executing all checked/unchecked DISC points on the sales floor.
* **Validation**: Leader will perform a follow-up shadowing session on ${followUpDate || 'the next scheduled shift'}.

---
### 🔍 Background & Performance Context
* **Observed Strengths**: ${strengths || (allStrengths.length > 0 ? allStrengths.slice(0, 3).join(', ') : 'Demonstrated warm client engagement.')}
* **Performance Gap / Metric Focus**: ${gapDetails || (allGaps.length > 0 ? `Needs focus on: ${allGaps.slice(0, 2).join(', ')}` : 'None identified.')}
* **Follow-up Action**: ${followUpAction || 'Observe checkout interaction next week.'}
* **Coaching Date**: ${todayDate}`;
  };

  const handleCompileAndLog = async () => {
    if (!selectedEmpId) {
      alert("Please select an associate first.");
      return;
    }
    if (!followUpDate) {
      alert("Please select a follow-up date for the commitment tracker.");
      return;
    }

    setIsGenerating(true);
    let logText;

    try {
      if (playbookSettings?.useGemini && apiKey?.trim().length > 10) {
        // Assemble checklist details for prompt context
        const discoverStrengths = [];
        const discoverGaps = [];
        if (checklist.greeting) discoverStrengths.push("Initiated a friendly, welcoming greeting within 10 seconds/10 feet"); else discoverGaps.push("Initiate friendly, welcoming greeting within 10 seconds/10 feet");
        if (checklist.nameExchange) discoverStrengths.push("Exchanged names and introduced self"); else discoverGaps.push("Exchange names and introduce self");
        if (checklist.setupProbe) discoverStrengths.push("Probed customer's setup/environment"); else discoverGaps.push("Probe environment setup/use case");
        if (checklist.specQuestions) discoverStrengths.push("Asked open-ended lifestyle/spec questions"); else discoverGaps.push("Ask open-ended spec/lifestyle questions");
        if (checklist.avoidedForbidden) discoverStrengths.push("Avoided forbidden retail words"); else discoverGaps.push("Avoid forbidden vocabulary (e.g., 'warranty', 'deal')");

        const inspireStrengths = [];
        const inspireGaps = [];
        if (checklist.builtRapport) inspireStrengths.push("Connected personally / built human rapport"); else inspireGaps.push("Connect personally / build human rapport (Family, Occupation, Recreation)");
        if (checklist.emotionalDriver) inspireStrengths.push("Uncovered customer emotional driver"); else inspireGaps.push("Uncover the emotional driver/purpose behind the purchase");
        if (checklist.demoProduct) inspireStrengths.push("Demonstrated product/service features"); else inspireGaps.push("Demonstrate product/service features physically or digitally");
        if (checklist.membershipBenefits) inspireStrengths.push("Shared membership benefits (Plus/Total) during demo"); else inspireGaps.push("Share membership benefits during the product demo");

        const solveStrengths = [];
        const solveGaps = [];
        if (checklist.membershipPitched) solveStrengths.push("Pitched My Best Buy Plus/Total to support solution"); else solveGaps.push("Pitch My Best Buy Plus/Total to support the complete solution");
        if (checklist.warrantyAttached) solveStrengths.push("Attached GSP protection / AppleCare+"); else solveGaps.push("Attach GSP protection or AppleCare+");
        if (checklist.solutionMatched) solveStrengths.push("Matched the complete solution"); else solveGaps.push("Match the complete solution (hardware + services + accessories)");

        const closeStrengths = [];
        const closeGaps = [];
        if (checklist.creditCardPitched) closeStrengths.push("Pitched Best Buy Credit Card financing/rewards"); else closeGaps.push("Pitch Best Buy Credit Card financing/rewards early");
        if (checklist.handledObjections) closeStrengths.push("Handled customer objections professionally"); else closeGaps.push("Acknowledge and handle customer objections professionally");
        if (checklist.surveyRequested) closeStrengths.push("Requested customer feedback via 5-Star Survey"); else closeGaps.push("Request customer feedback via 5-Star Survey");
        if (checklist.sleeveReceipt) closeStrengths.push("Receipt in sleeve with written advisor name"); else closeGaps.push("Place receipt in sleeve with written advisor name and thank customer");

        const allGaps = [...discoverGaps, ...inspireGaps, ...solveGaps, ...closeGaps];

        let discFocus = 'Solve';
        if (discoverGaps.length > inspireGaps.length && discoverGaps.length > solveGaps.length && discoverGaps.length > closeGaps.length) {
          discFocus = 'Discover';
        } else if (inspireGaps.length > discoverGaps.length && inspireGaps.length > solveGaps.length && inspireGaps.length > closeGaps.length) {
          discFocus = 'Inspire';
        } else if (closeGaps.length > discoverGaps.length && closeGaps.length > inspireGaps.length && closeGaps.length > solveGaps.length) {
          discFocus = 'Close';
        }

        const rawObservation = `DISC Behavior Checklist Summary:\n- Checked (Strengths): ${[...discoverStrengths, ...inspireStrengths, ...solveStrengths, ...closeStrengths].join(', ') || 'None'}\n- Unchecked (Gaps): ${allGaps.join(', ') || 'None'}`;

        const aiResponse = await generateCoachingLogGemini(
          apiKey,
          selectedEmployee.name,
          `Floor Shadowing: ${discFocus} Focus`,
          gapDetails || `Needs reinforcement in: ${allGaps.slice(0, 2).join(', ')}`,
          strengths || [...discoverStrengths, ...inspireStrengths, ...solveStrengths, ...closeStrengths].slice(0, 3).join(', '),
          rawObservation,
          playbookSettings,
          discFocus
        );

        if (aiResponse) {
          logText = `## 📋 Coaching Plan: ${selectedEmployee.name} (Live Floor Shadowing) — DISC Focus: ${aiResponse.discStep || discFocus}
          
* **What**: ${aiResponse.what}
* **How**: ${aiResponse.how}
* **Why**: ${aiResponse.why}
* **Behavior**: ${aiResponse.expectation}
* **Validation**: Leader observation will check on ${followUpDate}.

---
### 🔍 Background & Performance Context
* **Observed Strengths**: ${aiResponse.strengths || strengths || [...discoverStrengths, ...inspireStrengths, ...solveStrengths, ...closeStrengths].slice(0, 3).join(', ')}
* **Performance Gap / Metric Focus**: ${aiResponse.gapDetails || gapDetails || aiResponse.metricGap}
* **Follow-up Action**: ${followUpAction || 'Verify behaviors on the sales floor.'}
* **Coaching Date**: ${new Date().toLocaleDateString()}`;
        } else {
          logText = generateGrowLog();
        }
      } else {
        logText = generateGrowLog();
      }
    } catch (e) {
      console.error("AI coaching log generation failed, falling back to local template", e);
      logText = generateGrowLog();
    }

    setCompiledLog(logText);
    setIsGenerating(false);

    // 1. Copy to clipboard
    navigator.clipboard.writeText(logText).catch(err => {
      console.error("Failed to copy log to clipboard:", err);
    });

    // 2. Add coaching log to history
    if (onLogCoachingSession) {
      onLogCoachingSession({
        employeeId: selectedEmployee.id,
        customerName: selectedEmployee.name,
        category: 'Live Shadowing',
        avatar: selectedEmployee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        score: Math.round(
          (Object.values(checklist).filter(Boolean).length / Object.keys(checklist).length) * 100
        ),
        notes: logText
      });
    }

    // 3. Add follow-up task commitment
    if (onAddFollowUpTask) {
      onAddFollowUpTask({
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.id,
        department: department,
        action: followUpAction || `Follow-up floor shadowing observation.`,
        dueDate: followUpDate,
        completed: false
      });
    }

    // 4. Trigger success screen overlay
    setShowSuccessOverlay(true);
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setSelectedEmpId('');
    setDepartment('General Sales');
    setChecklist({
      greeting: false,
      nameExchange: false,
      setupProbe: false,
      specQuestions: false,
      avoidedForbidden: false,
      builtRapport: false,
      emotionalDriver: false,
      demoProduct: false,
      membershipBenefits: false,
      membershipPitched: false,
      warrantyAttached: false,
      solutionMatched: false,
      creditCardPitched: false,
      handledObjections: false,
      surveyRequested: false,
      sleeveReceipt: false
    });
    setStrengths('');
    setGapDetails('');
    setFollowUpAction('');
    setFollowUpDate('');
    setShowSuccessOverlay(false);
    setCompiledLog('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      
      {/* Success Overlay Screen */}
      {showSuccessOverlay && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '1.5rem', borderRadius: '50%', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
            <Check size={48} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>Coaching Logged & Copied!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6 }}>
            The shadowing session has been compiled into a GROW log, copied to your clipboard (ready to paste in Connect/Workday), saved to your history hub, and added to the validation commitments tracker.
          </p>

          <div className="glass-card" style={{ width: '100%', textAlign: 'left', background: 'rgba(11, 15, 25, 0.8)', border: '1px solid var(--border-glass)', padding: '1.25rem', maxHeight: '250px', overflowY: 'auto' }}>
            <pre style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {compiledLog}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onNavigate('dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleResetForm}>
              New Shadowing
            </button>
          </div>
        </div>
      )}

      {!showSuccessOverlay && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={36} color="var(--bby-blue)" /> Live Floor Shadowing Console
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Observe sales behaviors in real-time and compile them instantly into a GROW feedback log.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
              Cancel
            </button>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', width: '100%', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: currentStep >= 1 ? 1 : 0.5 }}>
                <span className={`stepper-btn ${currentStep === 1 ? 'active' : ''}`} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid', borderColor: currentStep >= 1 ? 'var(--bby-blue)' : 'var(--text-muted)', background: currentStep === 1 ? 'var(--bby-blue)' : 'transparent', color: '#fff', fontWeight: 'bold' }}>1</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: currentStep === 1 ? '#fff' : 'var(--text-secondary)' }}>Advisor Selection</span>
              </div>
              <div style={{ height: '2px', background: 'var(--border-glass)', flex: 1, margin: '0 1rem' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: currentStep >= 2 ? 1 : 0.5 }}>
                <span className={`stepper-btn ${currentStep === 2 ? 'active' : ''}`} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid', borderColor: currentStep >= 2 ? 'var(--bby-blue)' : 'var(--text-muted)', background: currentStep === 2 ? 'var(--bby-blue)' : 'transparent', color: '#fff', fontWeight: 'bold' }}>2</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: currentStep === 2 ? '#fff' : 'var(--text-secondary)' }}>Checklist (DISC)</span>
              </div>
              <div style={{ height: '2px', background: 'var(--border-glass)', flex: 1, margin: '0 1rem' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: currentStep >= 3 ? 1 : 0.5 }}>
                <span className={`stepper-btn ${currentStep === 3 ? 'active' : ''}`} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid', borderColor: currentStep >= 3 ? 'var(--bby-blue)' : 'var(--text-muted)', background: currentStep === 3 ? 'var(--bby-blue)' : 'transparent', color: '#fff', fontWeight: 'bold' }}>3</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: currentStep === 3 ? '#fff' : 'var(--text-secondary)' }}>Action Plan</span>
              </div>
            </div>
          </div>

          {/* Wizard Content Panels */}
          <div className="glass-card" style={{ padding: '2.5rem', minHeight: '350px' }}>
            
            {/* Step 1: Selection */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="var(--bby-blue)" /> Select Advisor for Observation
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Associate Name
                    </label>
                    <select 
                      value={selectedEmpId} 
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px', padding: '0.55rem 1.25rem' }}
                    >
                      <option value="">-- Choose Associate --</option>
                      {roster.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.dept})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Department Focus
                    </label>
                    <select 
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)}
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px', padding: '0.55rem 1.25rem' }}
                    >
                      <option value="Front End">Front End</option>
                      <option value="General Sales">General Sales</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Computing">Computing</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Home Theatre">Home Theatre</option>
                      <option value="Geek Squad">Geek Squad</option>
                    </select>
                  </div>
                </div>

                {selectedEmployee && (
                  <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,70,190,0.06)', border: '1px solid rgba(0,70,190,0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{selectedEmployee.name}</span>
                      <span className="tag-pill tag-pill-active">{selectedEmployee.dept}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>Hours: <strong style={{ color: '#fff' }}>{selectedEmployee.hours}</strong></div>
                      <div>Memberships: <strong style={{ color: '#fff' }}>{selectedEmployee.memberships}</strong></div>
                      <div>BBY Cards: <strong style={{ color: '#fff' }}>{selectedEmployee.creditCards}</strong></div>
                      <div>GSP Attach: <strong style={{ color: '#fff' }}>{selectedEmployee.warranty}%</strong></div>
                    </div>
                    {selectedEmployee.gap && selectedEmployee.gap !== 'None' && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#ffe600' }}>
                        <AlertCircle size={14} /> Gap focus: {selectedEmployee.gap}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Checklist */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--bby-blue)" /> Behavior Checklist (DISC Model)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  
                  {/* Discover Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--bby-blue)', borderBottom: '1px solid rgba(0,70,190,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Discover
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.greeting} onChange={() => toggleChecklistItem('greeting')} />
                        Friendly welcome within 10s / 10ft
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.nameExchange} onChange={() => toggleChecklistItem('nameExchange')} />
                        Exchanged names / introduced self
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.setupProbe} onChange={() => toggleChecklistItem('setupProbe')} />
                        Probed customer environment setup
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.specQuestions} onChange={() => toggleChecklistItem('specQuestions')} />
                        Asked open-ended spec/usage questions
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.avoidedForbidden} onChange={() => toggleChecklistItem('avoidedForbidden')} />
                        Avoided forbidden retail vocabulary
                      </label>
                    </div>
                  </div>

                  {/* Inspire Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--info)', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Inspire
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.builtRapport} onChange={() => toggleChecklistItem('builtRapport')} />
                        Connected personally / built human rapport
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.emotionalDriver} onChange={() => toggleChecklistItem('emotionalDriver')} />
                        Uncovered customer emotional driver
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.demoProduct} onChange={() => toggleChecklistItem('demoProduct')} />
                        Demonstrated product/service features
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.membershipBenefits} onChange={() => toggleChecklistItem('membershipBenefits')} />
                        Shared membership benefits during demo
                      </label>
                    </div>
                  </div>

                  {/* Solve Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--success)', borderBottom: '1px solid rgba(16,185,129,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Solve
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.membershipPitched} onChange={() => toggleChecklistItem('membershipPitched')} />
                        Pitched Plus/Total support solution
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.warrantyAttached} onChange={() => toggleChecklistItem('warrantyAttached')} />
                        Attached protection (GSP/AppleCare+)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.solutionMatched} onChange={() => toggleChecklistItem('solutionMatched')} />
                        Matched the complete solution
                      </label>
                    </div>
                  </div>

                  {/* Close Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--warning)', borderBottom: '1px solid rgba(245,158,11,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Close
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.creditCardPitched} onChange={() => toggleChecklistItem('creditCardPitched')} />
                        Pitched Credit Card rewards/financing
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.handledObjections} onChange={() => toggleChecklistItem('handledObjections')} />
                        Acknowledged and handled objections
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.surveyRequested} onChange={() => toggleChecklistItem('surveyRequested')} />
                        Requested feedback via 5-Star Survey
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.sleeveReceipt} onChange={() => toggleChecklistItem('sleeveReceipt')} />
                        Receipt in sleeve with written advisor name
                      </label>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 3: Action Details */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--bby-blue)" /> Action Plan & Follow-Up Commitments
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Observed Strengths Summary
                    </label>
                    <textarea 
                      value={strengths} 
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="e.g. Great pace, professional tone, avoided pushiness"
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '80px', resize: 'none', padding: '0.5rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Performance Gap Details
                    </label>
                    <textarea 
                      value={gapDetails} 
                      onChange={(e) => setGapDetails(e.target.value)}
                      placeholder="e.g. Missed survey pitch, didn't write name on receipt sleeve"
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '80px', resize: 'none', padding: '0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Follow-up Observation Commitment Action
                    </label>
                    <input 
                      type="text"
                      value={followUpAction} 
                      onChange={(e) => setFollowUpAction(e.target.value)}
                      placeholder="e.g. Shadow 3 customer checkouts to verify survey ask"
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Follow-up Date
                    </label>
                    <input 
                      type="date"
                      value={followUpDate} 
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px' }}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 3 ? (
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (currentStep === 1 && !selectedEmpId) {
                    alert("Please select an associate first.");
                    return;
                  }
                  setCurrentStep(prev => prev + 1);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleCompileAndLog}
                disabled={isGenerating}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success)', borderColor: 'var(--success)' }}
              >
                {isGenerating ? (
                  <>
                    <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Clipboard size={16} /> Compile & Log
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}

    </div>
  );
}
