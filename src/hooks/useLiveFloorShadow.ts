// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { generateCoachingLogGemini } from '../services/ai';

export function useLiveFloorShadow({
  roster,
  onLogCoachingSession,
  onAddFollowUpTask,
  onNavigate,
  preselectedEmployee,
  clearPreselectedEmployee,
  playbookSettings,
  apiKey
}) {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [department, setDepartment] = useState('General Sales');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customerPersona, setCustomerPersona] = useState('');
  const [customPersona, setCustomPersona] = useState('');

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
  const [notes, setNotes] = useState('');
  const [coachingInsight, setCoachingInsight] = useState('');

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

        const rawObservation = `DISC Behavior Checklist Summary:\n- Checked (Strengths): ${[...discoverStrengths, ...inspireStrengths, ...solveStrengths, ...closeStrengths].join(', ') || 'None'}\n- Unchecked (Gaps): ${allGaps.join(', ') || 'None'}\n- Supervisor Raw Voice Dictation/Notes: ${notes || 'None'}`;

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

  return {
    currentStep, setCurrentStep,
    selectedEmpId, setSelectedEmpId,
    selectedEmployee,
    handleSelectEmployee,
    department, setDepartment,
    isGenerating, setIsGenerating,
    checklist, setChecklist,
    customerPersona, setCustomerPersona,
    customPersona, setCustomPersona,
    notes, setNotes,
    coachingInsight, setCoachingInsight,
    strengths, setStrengths,
    gapDetails, setGapDetails,
    followUpAction, setFollowUpAction,
    followUpDate, setFollowUpDate,
    handleGenerateCoaching: generateGrowLog,
    handleComplete: handleCompileAndLog
  };
}
