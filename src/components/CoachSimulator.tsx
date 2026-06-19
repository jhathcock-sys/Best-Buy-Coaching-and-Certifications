// @ts-nocheck
/* eslint-disable no-useless-escape */
import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  EMPLOYEE_SCENARIOS, 
  runOfflineEmployeeCoachingStep, 
  evaluateCoachingSession, 
  generateCoachingLogGemini, 
  generateCoachingLogLocal,
  isGeminiAvailable,
  runGeminiEmployeeCoachingStep,
  evaluateCoachingSessionGemini
} from '../services/ai';
import { 
  Users, Sparkles, ArrowLeft, RefreshCw, Send, HelpCircle, 
  FileText, Check, Copy, Volume2, Mic, MicOff 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CoachSimulator({ 
  playbookSettings, 
  customScenarios = [], 
  preselectedEmployee, 
  clearPreselectedEmployee, 
  prefillBuilderData, 
  clearPrefillBuilderData, 
  onImportScenario, 
  onLogCoachingSession,
  coachingLogs = [],
  initialTab = 'sim'
}) {
  const { apiKey, setActiveView } = useApp();
  const allEmployees = useMemo(() => [
    ...(Array.isArray(EMPLOYEE_SCENARIOS) ? EMPLOYEE_SCENARIOS : []), 
    ...(Array.isArray(customScenarios) ? customScenarios : [])
  ], [customScenarios]);

  // Tabs: 'sim' (coaching practice simulation), 'builder' (4-section coaching log builder)
  const [activeTab, setActiveTab] = useState(initialTab);
  const [outputViewMode, setOutputViewMode] = useState('grow'); // 'grow' or 'huddle'
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const [isThinking, setIsThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
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
    validation: '',
    discFocus: ['Solve'],
    rawObservation: ''
  });
  const [isGeneratingLog, setIsGeneratingLog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Speech synthesis states
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingSpeech) {
      if (isPausedSpeech) {
        window.speechSynthesis.resume();
        setIsPausedSpeech(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedSpeech(true);
      }
      return;
    }

    const text = outputViewMode === 'grow' ? compileCoachingLogText() : compileHuddleScriptText();
    // Clean up markdown formatting for better reading
    const cleanText = text
      .replace(/## 📋 /g, '')
      .replace(/## 💬 /g, '')
      .replace(/\* \*\*(.*?)\*\*/g, '$1')
      .replace(/\-\-\-/g, '')
      .replace(/### 🔍 /g, '')
      .replace(/\*/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };
    utterance.onerror = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    setIsPlayingSpeech(true);
    setIsPausedSpeech(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean up markdown formatting for better reading
    const cleanText = text
      .replace(/## 📋 /g, '')
      .replace(/## 💬 /g, '')
      .replace(/\* \*\*(.*?)\*\*/g, '$1')
      .replace(/---/g, '')
      .replace(/### 🔍 /g, '')
      .replace(/\*/g, '');
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceMode = () => {
    const nextMode = !isVoiceMode;
    setIsVoiceMode(nextMode);
    if (nextMode) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender !== 'coach') {
        speakText(lastMsg.text);
      }
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use a modern browser like Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      recognition.onerror = (event) => {
        toast.error("Speech recognition error.");
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      toast.error("Failed to start speech recognition.");
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Pre-configured Best Buy Templates
  const TEMPLATES = {
    memberships: {
      employeeName: 'Jordan',
      what: 'Introduce My Best Buy Plus & Total memberships earlier during needs discovery.',
      how: '[Discover] Ask open-ended questions about how they currently handle software setup, virus cleanups, and tech support. [Inspire] Position Total as an umbrella safety shield covering setup and support. [Solve] Recommend the My Best Buy Total membership to bundle their support costs under one single plan. [Close] Walk them through membership activation terms at checkout.',
      why: 'Gives the customer peace of mind, unlocks exclusive member pricing, and drives customer loyalty.',
      strengths: 'Outstanding customer greetings, warm rapport building, and excellent product knowledge.',
      metricGap: 'Memberships',
      gapDetails: 'Membership Attach is at 2.1% vs store goal of 5.0%.',
      expectation: 'Achieve a consistent 5.0% membership attach rate over the next two weeks.',
      validation: 'Leader will perform 3 side-by-side floor observations and check weekly reporting.',
      discFocus: 'Solve',
      rawObservation: ''
    },
    gsp: {
      employeeName: 'Marcus',
      what: 'Recommend Geek Squad Protection (GSP) or AppleCare+ during the product demo.',
      how: '[Discover] Uncover daily usage parameters, travel plans, or student college dorm settings. [Inspire] Paint a clear picture of stress-free ownership covering drops, spills, and screen cracks. [Solve] Recommend Geek Squad Protection or AppleCare+ during the hardware product demo. [Close] Ask for their confirmation to secure the device today.',
      why: 'Saves the customer from costly repair bills and ensures their tech remains operational for college.',
      strengths: 'Asks fantastic discovery questions and is highly professional and polite.',
      metricGap: 'Warranty/GSP',
      gapDetails: 'GSP Attach rate is currently 4.8% vs store goal of 12.0%.',
      expectation: 'Offer GSP on 100% of qualified transactions to hit 10% GSP attach rate by next week.',
      validation: 'Leader will audit hardware protection attach rates on the Sunday report and run checkout register observation logs.',
      discFocus: 'Solve',
      rawObservation: ''
    },
    card: {
      employeeName: 'Taylor',
      what: 'Pitch the My Best Buy Credit Card to resolve purchase budget barriers.',
      how: '[Discover] Learn about their buying budget and look for any hesitations about high-end product pricing. [Inspire] Explain the buying power of 12-month interest-free financing or 10% back in rewards on their first purchase today. [Solve] Introduce the Best Buy Card early in discovery as a payment solution. [Close] Ask for their permission to submit a quick registration application.',
      why: 'Gives the customer flexible buying power and rewards them heavily on their purchase today.',
      strengths: 'Matches solutions perfectly and is great at closing sales.',
      metricGap: 'BBY Credit Card',
      gapDetails: 'BBY Credit Card apps are at 2 submissions vs monthly goal of 8.',
      expectation: 'Propose financing or rewards on all transactions exceeding $300 today.',
      validation: 'Validate through counter observation side-by-sides and check submitted apps weekly.',
      discFocus: 'Discover',
      rawObservation: ''
    },
    surveys: {
      employeeName: 'Alex',
      what: 'Maintain deep emotional rapport and ask for a 5-Star Survey feedback.',
      how: '[Discover] Connect deeply with their usage needs to build deep human rapport. [Inspire] Share how much their personal feedback guides your team and shapes store performance. [Solve] Slow down the checkout process, write your name on the receipt sleeve card, and thank them. [Close] Warmly request their feedback on the 5-star survey today.',
      why: 'Helps us track and improve store experience and rewards advisors for great customer service.',
      strengths: 'Technically competent, highly efficient at checkout processing.',
      metricGap: '5-Star Surveys',
      gapDetails: 'Average customer survey index is at 4.2 stars vs goal of 4.8 stars.',
      expectation: 'Increase 5-Star ratings to maintain a 4.8+ survey index over the next 30 days.',
      validation: 'Audit 5-star comments weekly and observe customer checkout interactions.',
      discFocus: 'Close',
      rawObservation: ''
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
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('sim');
      // eslint-disable-next-line
      startCoaching(dynamicScen);
      
      const timer = setTimeout(() => {
        if (clearPreselectedEmployee) clearPreselectedEmployee();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBuilderForm({
        employeeName: prefillBuilderData.name || '',
        what: '',
        how: '',
        why: '',
        strengths: (prefillBuilderData.memberships || 0) >= 5.0 ? 'Incredible membership attach rate and strong floor presence!' : 'Friendly greetings, proactive attitude on the floor.',
        metricGap: getPrefillGapType(),
        gapDetails: `Active Gap Focus: ${prefillBuilderData.gap || 'None'} | Advisor Metrics Profile: RPH: $${prefillBuilderData.rph || 0}/hr, Memberships: ${prefillBuilderData.memberships || 0} Attach, BBY Cards: ${prefillBuilderData.creditCards || 0} Submissions, GSP Attach: ${prefillBuilderData.warranty || 0}%, CSAT Survey Score: ${prefillBuilderData.surveys || 0}★`,
        expectation: `Raise metrics to meet store benchmarks over the next 14 days.`,
        validation: `Store leader will perform counter observations and check weekly reporting.`,
        discFocus: ['Solve'],
        rawObservation: ''
      });
      
      setActiveTab('builder');
      
      const timer = setTimeout(() => {
        if (clearPrefillBuilderData) clearPrefillBuilderData();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillBuilderData]);

  const loadTemplate = (type) => {
    if (TEMPLATES[type]) {
      const template = TEMPLATES[type];
      setBuilderForm({
        ...template,
        discFocus: Array.isArray(template.discFocus) ? template.discFocus : [template.discFocus]
      });
    }
  };

  // Run a generative auto-fill using Gemini AI (or Local Offline Engine fallback)
  const handleAIFillCoachingLog = async () => {
    if (!builderForm.employeeName.trim()) {
      alert("Please enter the Employee Name first so the system can customize the log!");
      return;
    }
    
    setIsGeneratingLog(true);
    const isProMode = playbookSettings.aiMode === 'pro';
    const hasApiKey = apiKey && apiKey.trim().length > 10;
    
    try {
      if (isProMode) {
        const response = await fetch('/api/generate-coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: builderForm.employeeName,
            gapType: builderForm.metricGap,
            gapDetails: builderForm.gapDetails || "Needs performance coaching to meet store targets",
            positives: builderForm.strengths,
            rawObservation: builderForm.rawObservation,
            playbookSettings,
            selectedDiscSteps: builderForm.discFocus
          })
        });
        if (!response.ok) throw new Error('Premium coaching log generation failed.');
        const data = await response.json();
        if (data) {
          setBuilderForm(prev => ({
            ...prev,
            what: data.what,
            how: data.how,
            why: data.why,
            strengths: data.strengths || prev.strengths,
            expectation: data.expectation,
            validation: data.validation,
            discFocus: data.discStep ? (Array.isArray(prev.discFocus) ? [data.discStep] : data.discStep) : prev.discFocus
          }));
        }
      } else if (hasApiKey) {
        const data = await generateCoachingLogGemini(
          apiKey,
          builderForm.employeeName,
          builderForm.metricGap,
          builderForm.gapDetails || "Needs performance coaching to meet store targets",
          builderForm.strengths,
          builderForm.rawObservation,
          playbookSettings,
          builderForm.discFocus
        );
        
        if (data) {
          setBuilderForm(prev => ({
            ...prev,
            what: data.what,
            how: data.how,
            why: data.why,
            strengths: data.strengths || prev.strengths,
            expectation: data.expectation,
            validation: data.validation,
            discFocus: data.discStep ? (Array.isArray(prev.discFocus) ? [data.discStep] : data.discStep) : prev.discFocus
          }));
        }
      } else {
        // Local offline generator fallback
        // Add a small delay for premium feels and skeletals
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const localData = generateCoachingLogLocal(
          builderForm.employeeName,
          builderForm.metricGap,
          builderForm.gapDetails,
          builderForm.strengths,
          builderForm.rawObservation,
          builderForm.discFocus
        );
        
        setBuilderForm(prev => ({
          ...prev,
          what: localData.what,
          how: localData.how,
          why: localData.why,
          strengths: localData.strengths,
          expectation: localData.expectation,
          validation: localData.validation
        }));
      }
    } catch (e) {
      toast.error("Cloud generation failed, falling back to offline mode.");
      console.error(e);
      alert("An error occurred during cloud generation. Falling back to local offline generation.");
      const localData = generateCoachingLogLocal(
        builderForm.employeeName,
        builderForm.metricGap,
        builderForm.gapDetails,
        builderForm.strengths,
        builderForm.rawObservation,
        builderForm.discFocus
      );
      setBuilderForm(prev => ({
        ...prev,
        what: localData.what,
        how: localData.how,
        why: localData.why,
        strengths: localData.strengths,
        expectation: localData.expectation,
        validation: localData.validation
      }));
    } finally {
      setIsGeneratingLog(false);
    }
  };

  // Compile formatted Markdown output
  const compileCoachingLogText = () => {
    const focusSteps = Array.isArray(builderForm.discFocus) 
      ? builderForm.discFocus.join(', ') 
      : (builderForm.discFocus || 'Solve');

    return `## 📋 Coaching Plan: ${builderForm.employeeName || '[Employee Name]'} — DISC Focus: ${focusSteps}

* **What**: ${builderForm.what || 'Pending...'}
* **How**: ${builderForm.how || 'Pending...'}
* **Why**: ${builderForm.why || 'Pending...'}
* **Behavior**: ${builderForm.expectation || 'Pending...'}
* **Validation**: ${builderForm.validation || 'Pending...'}

---
### 🔍 Background & Performance Context
* **Observed Strengths**: ${builderForm.strengths || 'None logged.'}
* **Performance Gap / Metric Focus**: ${builderForm.gapDetails || 'None logged.'}
* **Coaching Date**: ${new Date().toLocaleDateString()}`;
  };

  const compileHuddleScriptText = () => {
    const name = builderForm.employeeName || '[Employee Name]';
    const focusSteps = Array.isArray(builderForm.discFocus) 
      ? builderForm.discFocus.join(', ') 
      : (builderForm.discFocus || 'Solve');

    return `## 💬 Leadership Huddle Script: 1-on-1 with ${name}
DISC Coaching Focus: ${focusSteps}

Hey ${name}, I wanted to pull you aside for a quick second to call out some awesome work. 

First off, I really appreciate your energy on the floor. Especially, I noticed you do an awesome job with:
👉 "${builderForm.strengths || '[Mention strengths]'}"

This week, I want us to focus on moving the needle on your ${builderForm.gapDetails || '[Mention gap]'}. 

Specifically, what I need you to do is:
🎯 "${builderForm.what || '[Specific action plan details]'}"

The best way to handle this during your customer conversations is:
💡 "${builderForm.how || '[Specific DISC sales script guidelines]'}"

This is super important because:
🚀 "${builderForm.why || '[Why it helps the customer and store results]'}"

Let's align to make this our standard behavior:
📈 "${builderForm.expectation || '[Expected behavior targets]'}"

I'm going to follow along and help support you on the floor this week:
🔍 "${builderForm.validation || '[Leader observation and validation details]'}"

Let's crush it! Let me know if you have any questions or need me to jump in and show you a demo on the floor.`;
  };

  const handleCopyToClipboard = () => {
    const text = outputViewMode === 'grow' ? compileCoachingLogText() : compileHuddleScriptText();
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
    if (isVoiceMode) {
      speakText(employee.initialGreeting);
    }
  };

  const finishCoaching = async () => {
    setIsEvaluating(true);
    const historyObj = {
      messages: messages,
      completedCoachSteps: completedCoachSteps,
      currentCoachStep: currentCoachStep
    };
    
    try {
      let evalResult;
      if (isGeminiAvailable(apiKey) && playbookSettings?.useGemini) {
        evalResult = await evaluateCoachingSessionGemini(apiKey, historyObj, selectedEmployee, playbookSettings);
      } else {
        evalResult = evaluateCoachingSession(historyObj);
      }
      
      setEvaluation(evalResult);
      
      if (onLogCoachingSession) {
        const isRoster = selectedEmployee.id && String(selectedEmployee.id).startsWith('roster-');
        const rosterEmpId = isRoster ? String(selectedEmployee.id).substring(7) : null;
        const cleanName = isRoster ? selectedEmployee.name.split(' (')[0] : selectedEmployee.name;
        onLogCoachingSession({
          employeeId: rosterEmpId,
          customerName: cleanName || 'Advisor',
          category: 'Coaching Practice',
          avatar: selectedEmployee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          score: evalResult.score,
          notes: evalResult.feedback || 'Completed GROW Coaching practice session.'
        });
      }
    } catch (err) {
      toast.error("Evaluation generation error.");
      console.error("Evaluation error:", err);
      const evalResult = evaluateCoachingSession(historyObj);
      setEvaluation(evalResult);
    } finally {
      setIsEvaluating(false);
    }
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

  const handleSend = async () => {
    if (!inputVal.trim() || isThinking) return;
    const currentMsg = inputVal;
    setInputVal('');
    
    // Add coach message immediately to UI
    setMessages(prev => [...prev, { sender: 'coach', text: currentMsg }]);
    setIsThinking(true);
    
    let nextState = null;
    try {
      const historyObj = {
        messages: messages,
        completedCoachSteps: completedCoachSteps,
        currentCoachStep: currentCoachStep
      };
      
      if (isGeminiAvailable(apiKey) && playbookSettings?.useGemini) {
        const cleanEmpName = selectedEmployee.name.split(' (')[0].trim();
        const pastLogs = (coachingLogs || [])
          .filter(log => log.employeeName && log.employeeName.split(' (')[0].trim() === cleanEmpName)
          .slice(0, 3)
          .map(log => `- Date: ${log.date}, Score: ${log.score}%, Notes: ${log.notes}`)
          .join('\n');
        
        nextState = await runGeminiEmployeeCoachingStep(apiKey, currentMsg, historyObj, selectedEmployee, playbookSettings, pastLogs);
      } else {
        // Fallback offline simulator with delay
        await new Promise(resolve => setTimeout(resolve, 800));
        nextState = runOfflineEmployeeCoachingStep(currentMsg, historyObj, selectedEmployee);
      }
    } catch (err) {
      toast.error("Coaching generation error.");
      console.error("Coaching step generation error:", err);
      // Fallback in case of error
      const historyObj = {
        messages: messages,
        completedCoachSteps: completedCoachSteps,
        currentCoachStep: currentCoachStep
      };
      nextState = runOfflineEmployeeCoachingStep(currentMsg, historyObj, selectedEmployee);
    } finally {
      setIsThinking(false);
      if (nextState) {
        setMessages(nextState.messages);
        setCompletedCoachSteps(nextState.completedCoachSteps);
        setCurrentCoachStep(nextState.currentCoachStep);
        
        if (isVoiceMode) {
          const lastMsg = nextState.messages[nextState.messages.length - 1];
          if (lastMsg && lastMsg.sender !== 'coach') {
            speakText(lastMsg.text);
          }
        }
      }
    }
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
              {allEmployees.map(employee => (
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

              <div className="form-group">
                <label className="form-label">DISC Focus Step(s):</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {['Discover', 'Inspire', 'Solve', 'Close'].map(step => {
                    const isSelected = Array.isArray(builderForm.discFocus) 
                      ? builderForm.discFocus.includes(step) 
                      : builderForm.discFocus === step;
                    return (
                      <button
                        key={step}
                        type="button"
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          padding: '0.5rem 1.25rem',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          background: isSelected ? 'var(--bby-blue)' : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected ? 'var(--bby-blue)' : 'var(--border-glass)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onClick={() => {
                          let currentList = Array.isArray(builderForm.discFocus) 
                            ? [...builderForm.discFocus] 
                            : [builderForm.discFocus];
                          if (currentList.includes(step)) {
                            if (currentList.length > 1) {
                              currentList = currentList.filter(s => s !== step);
                            }
                          } else {
                            currentList.push(step);
                          }
                          setBuilderForm({ ...builderForm, discFocus: currentList });
                        }}
                      >
                        {step}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raw Observation input block */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Raw Observation notes / Observed floor behaviors:</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Used by AI Generator)</span>
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={2} 
                    placeholder="Describe raw behaviors or specific observed metrics (e.g. Marcus pitched GSP at register but not during demo; client refused due to budget limit)."
                    value={builderForm.rawObservation}
                    onChange={(e) => setBuilderForm({ ...builderForm, rawObservation: e.target.value })}
                  />
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
                    <label className="form-label">HOW we need them to do it (incorporate DISC: Discover, Inspire, Solve, Close):</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="e.g. [Discover] Ask open questions about clumsy dorm habits. [Inspire] Describe stress-free care. [Solve] Attach Geek Squad Protection during demo. [Close] Secure options at register."
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

              {/* Section 4: Behavior & Validation */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(16,185,129,0.02)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--success)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                  SECTION 4: BEHAVIOR & VALIDATION
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Behavior (Observable change marking success):</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Associate consistently presents My Best Buy Plus/Total options to every customer, resulting in 10% attach rate."
                      value={builderForm.expectation}
                      onChange={(e) => setBuilderForm({ ...builderForm, expectation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Validation (Follow-up observation plan):</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="e.g. Will perform 3 side-by-side observations during the peak hour on Friday."
                      value={builderForm.validation}
                      onChange={(e) => setBuilderForm({ ...builderForm, validation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Auto-generate helper block */}
              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-accent" 
                  style={{ width: '100%' }} 
                  onClick={handleAIFillCoachingLog}
                  disabled={isGeneratingLog}
                >
                  {isGeneratingLog ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Generating Plan...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <Sparkles size={16} /> Auto-Generate 4-Section Coaching Plan
                    </div>
                  )}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {apiKey && apiKey.trim().length > 10 ? (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="indicator-dot active" style={{ width: '6px', height: '6px', background: 'var(--success)' }} /> Gemini Cloud AI Active
                    </span>
                  ) : (
                    <span style={{ color: 'var(--bby-yellow)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="indicator-dot active" style={{ width: '6px', height: '6px', background: 'var(--bby-yellow)' }} /> Local Offline Engine Active
                    </span>
                  )}
                  {(!apiKey || apiKey.trim().length < 10) && (
                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveView && setActiveView('playbook')}>
                      Activate Gemini AI key
                    </span>
                  )}
                </div>
              </div>

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

              {isGeneratingLog ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  padding: '1.5rem',
                  background: 'rgba(11,15,25,0.7)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  minHeight: '400px',
                  justifyContent: 'center'
                }}>
                  {/* Pulsing skeleton bars */}
                  <div className="skeleton-pulse" style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
                  <div className="skeleton-pulse" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }}></div>
                  <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                  <div className="skeleton-pulse" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                  
                  <div className="skeleton-pulse" style={{ height: '20px', width: '45%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginTop: '1.25rem' }}></div>
                  <div className="skeleton-pulse" style={{ height: '14px', width: '95%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }}></div>
                  <div className="skeleton-pulse" style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                  
                  <div className="skeleton-pulse" style={{ height: '20px', width: '50%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginTop: '1.25rem' }}></div>
                  <div className="skeleton-pulse" style={{ height: '14px', width: '88%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }}></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    <Sparkles className="typing-dots" size={24} style={{ color: 'var(--bby-yellow)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini is drafting your GROW coaching plan...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Output Tab Mode Toggles */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ 
                        flex: 1,
                        padding: '0.4rem 0.85rem', 
                        fontSize: '0.75rem', 
                        background: outputViewMode === 'grow' ? 'var(--bby-blue)' : 'transparent',
                        borderColor: 'transparent',
                        color: '#fff',
                        margin: 0
                      }}
                      onClick={() => setOutputViewMode('grow')}
                    >
                      📋 GROW Plan
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ 
                        flex: 1,
                        padding: '0.4rem 0.85rem', 
                        fontSize: '0.75rem', 
                        background: outputViewMode === 'huddle' ? 'var(--bby-blue)' : 'transparent',
                        borderColor: 'transparent',
                        color: '#fff',
                        margin: 0
                      }}
                      onClick={() => setOutputViewMode('huddle')}
                    >
                      💬 Huddle Script
                    </button>
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
                    value={outputViewMode === 'grow' ? compileCoachingLogText() : compileHuddleScriptText()}
                  />
                </>
              )}

              {copySuccess && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--success-glow)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', fontSize: '0.8rem', color: '#a7f3d0', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} /> Coaching Log copied to clipboard! Ready to paste.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-accent" 
                  style={{ width: '100%', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    handleCopyToClipboard();
                    if (onLogCoachingSession) {
                      onLogCoachingSession({
                        customerName: builderForm.employeeName || 'Advisor',
                        category: 'Floor Observation',
                        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                        score: 100,
                        notes: `Focus Area: ${builderForm.metricGap}. DISC: ${builderForm.discFocus}. WHAT: ${builderForm.what}`
                      });
                    }
                  }}
                >
                  <Sparkles size={16} /> Log & Copy Observation
                </button>

                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%' }}
                  onClick={handleCopyToClipboard}
                >
                  <Copy size={16} /> Copy Formatted Coaching Log
                </button>
                
                {/* Text-to-Speech Control Center */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  padding: '0.85rem 1rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '12px' 
                }}>
                  <h4 style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Volume2 size={15} color="var(--bby-yellow)" /> Coaching Plan Reader (Text-to-Speech)
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button 
                      className={`btn ${isPlayingSpeech && !isPausedSpeech ? 'btn-secondary' : 'btn-accent'}`} 
                      style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      onClick={handleSpeech}
                    >
                      <Volume2 size={13} /> {isPlayingSpeech ? (isPausedSpeech ? 'Resume' : 'Pause') : 'Read Plan Aloud'}
                    </button>
                    {isPlayingSpeech && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto' }}
                        onClick={handleStopSpeech}
                      >
                        Stop
                      </button>
                    )}
                  </div>
                  {isPlayingSpeech && (
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bby-yellow)', display: 'inline-block' }}></span>
                      <span>{isPausedSpeech ? 'Paused' : 'Currently speaking...'}</span>
                    </div>
                  )}
                </div>
              </div>
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

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className={`btn ${isVoiceMode ? 'btn-accent' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isVoiceMode ? '#000' : undefined }}
                onClick={toggleVoiceMode}
                disabled={isEvaluating || isThinking}
                title="Toggle Speech-to-Text / Text-to-Speech Voice Mode"
              >
                {isVoiceMode ? <Mic size={14} /> : <MicOff size={14} />}
                {isVoiceMode ? 'Voice Mode: Active' : 'Voice Mode: Disabled'}
              </button>
              <button className="btn btn-secondary" onClick={() => startCoaching(selectedEmployee)} disabled={isEvaluating || isThinking}>
                <RefreshCw size={14} /> Restart
              </button>
              <button className="btn btn-accent" onClick={finishCoaching} disabled={isEvaluating || isThinking}>
                {isEvaluating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Evaluating...
                  </div>
                ) : (
                  'Complete Coaching Session'
                )}
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
                {isThinking && (
                  <div className="chat-bubble bubble-employee-active typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>

              <div className="chat-input-bar">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder={isListening ? "Listening... Speak clearly..." : isThinking ? "Advisor is thinking..." : "Ask a coaching question, show empathy, or discuss action steps..."}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isThinking || isEvaluating}
                  style={{
                    borderColor: isListening ? 'var(--bby-yellow)' : undefined,
                    boxShadow: isListening ? '0 0 10px rgba(242, 169, 0, 0.25)' : undefined
                  }}
                />
                <button 
                  className={`btn btn-icon ${isListening ? 'mic-listening' : 'btn-secondary'}`}
                  style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={handleMicClick}
                  disabled={isThinking || isEvaluating}
                  title={isListening ? "Stop Recording (Speech-to-Text)" : "Start Recording (Speech-to-Text)"}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={isThinking || isEvaluating}>
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
