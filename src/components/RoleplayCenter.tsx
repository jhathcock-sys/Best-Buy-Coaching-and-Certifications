import { useState, useEffect, useRef, useMemo } from 'react';
import { STANDARD_SCENARIOS, runOfflineSimulationStep, runGeminiSimulationStep, evaluateSessionOffline, evaluateSessionGemini } from '../services/ai';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass, Users, UserPlus, Edit2, Eye, EyeOff, Cpu, RefreshCw, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import RoleplayConfiguration from './RoleplayCenter/RoleplayConfiguration';
import RoleplayActiveSession from './RoleplayCenter/RoleplayActiveSession';
import RoleplayResults from './RoleplayCenter/RoleplayResults';

export default function RoleplayCenter() {
  const navigate = useNavigate();
  const setActiveView = (view: string) => navigate(view === 'dashboard' ? '/' : `/${view}`);
const apiKey = useStore((state) => state.apiKey);
  const customScenarios = useStore((state) => state.customScenarios) || [];
  const playbookSettings = useStore((state) => state.playbookSettings);
  const completeRoleplay = useStore((state) => state.completeRoleplay);
  const onCompleteRoleplay = completeRoleplay; // Alias to match existing calls
  
  const scenarios = useMemo(() => [...STANDARD_SCENARIOS, ...customScenarios], [customScenarios]);
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
  const [complexity, setComplexity] = useState('Standard');
  const [customerTone, setCustomerTone] = useState('Neutral');
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
        nextState = runOfflineSimulationStep(currentMsg, history, selectedScenario);
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
        result = evaluateSessionOffline(history);
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

  const saveAndReturn = () => {
    if (evaluation && onCompleteRoleplay) {
      onCompleteRoleplay(evaluation);
    }
    setSessionActive(false);
    setSelectedScenario(null);
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
            <RoleplayConfiguration 
              allScenarios={allScenarios}
              selectedScenario={selectedScenario}
              setSelectedScenario={setSelectedScenario}
              complexity={complexity}
              setComplexity={setComplexity}
              customerTone={customerTone}
              setCustomerTone={setCustomerTone}
              startRoleplay={startRoleplay}
            />
          )}

          {sessionActive && !evaluation && (
            <RoleplayActiveSession 
              apiKey={apiKey}
              selectedScenario={selectedScenario}
              complexity={complexity}
              customerTone={customerTone}
              messages={messages}
              inputText={inputVal}
              setInputText={setInputVal}
              completedSteps={completedSteps}
              currentActiveStep={currentActiveStep}
              isEvaluating={isEvaluating}
              setSessionActive={setSessionActive}
              stepHint={stepHint}
              sendMessage={handleSend}
              isLoading={isLoading}
              messagesEndRef={chatBottomRef}
              endRoleplay={endAndEvaluate}
              startRoleplay={startRoleplay}
            />
          )}

          {evaluation && (
            <RoleplayResults 
              selectedScenario={selectedScenario}
              complexity={complexity}
              customerTone={customerTone}
              evaluation={evaluation}
              saveAndReturn={saveAndReturn}
              setActiveView={setActiveView}
              startRoleplay={startRoleplay}
            />
          )}
    </div>
  );
}
