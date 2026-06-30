import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { runOfflineSimulationStep, runGeminiSimulationStep, evaluateSessionOffline, evaluateSessionGemini } from '../../services/ai';
import RoleplayEvaluationState from './RoleplayEvaluationState';
import RoleplayProgressBar from './RoleplayProgressBar';
import RoleplayChatWindow from './RoleplayChatWindow';
import RoleplaySidebarCoach from './RoleplaySidebarCoach';

export interface Message {
  sender: 'customer' | 'advisor';
  text: string;
}

export interface CompletedSteps {
  [key: string]: boolean;
  connect: boolean;
  discover: boolean;
  recommend: boolean;
  protect: boolean;
  close: boolean;
}

export interface RoleplayActiveSessionProps {
  selectedScenario: any;
  complexity: string;
  customerTone: string;
  onExit: () => void;
  onEvaluationComplete: (result: any) => void;
}

export default function RoleplayActiveSession({ 
  selectedScenario,
  complexity,
  customerTone,
  onExit,
  onEvaluationComplete
}: RoleplayActiveSessionProps) {
  const apiKey = useStore((state) => state.apiKey);
  const playbookSettings = useStore((state) => state.playbookSettings);
  
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'customer', text: selectedScenario?.initialGreeting || 'Hello.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [currentActiveStep, setCurrentActiveStep] = useState('connect');
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({
    connect: false, discover: false, recommend: false, protect: false, close: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech Recognition API not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const currentMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'advisor', text: currentMsg }]);
    setIsLoading(true);
    
    try {
      const history = { messages, completedSteps, currentActiveStep, metrics: {} };
      let nextState;
      if (apiKey && apiKey.trim().length > 10) {
        nextState = await runGeminiSimulationStep(apiKey, currentMsg, history, selectedScenario, playbookSettings);
      } else {
        nextState = runOfflineSimulationStep(currentMsg, history, selectedScenario);
      }
      if (isMounted.current) {
        setMessages(nextState.messages);
        setCompletedSteps(nextState.completedSteps);
        setCurrentActiveStep(nextState.currentActiveStep);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const endAndEvaluate = async () => {
    setIsLoading(true);
    setIsEvaluating(true);
    try {
      const history = { messages, completedSteps };
      let result;
      const isProMode = playbookSettings?.aiMode === 'pro';
      const hasApiKey = apiKey && apiKey.trim().length > 10;
      
      if (isProMode) {
        const response = await fetch('/api/audit-dialogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history, scenario: selectedScenario, playbookSettings })
        });
        if (!response.ok) throw new Error('Premium dialogue audit failed.');
        result = await response.json();
      } else if (hasApiKey) {
        result = await evaluateSessionGemini(apiKey, history, selectedScenario, playbookSettings);
      } else {
        result = evaluateSessionOffline(history);
      }
      
      if (isMounted.current) {
        onEvaluationComplete(result);
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) {
        setIsEvaluating(false);
        setIsLoading(false);
      }
    }
  };

  const restartRoleplay = () => {
    setMessages([{ sender: 'customer', text: selectedScenario?.initialGreeting || 'Hello.' }]);
    setCurrentActiveStep('connect');
    setCompletedSteps({ connect: false, discover: false, recommend: false, protect: false, close: false });
    setInputText('');
  };

  const getStepHint = () => {
    switch (currentActiveStep) {
      case 'connect':
        return { title: 'Step 1: Connect / Welcome', hint: 'Welcome the customer in a warm, empathetic way. Ask for their name and build rapport.' };
      case 'discover':
        return { title: 'Step 2: Discover / Understand', hint: 'Ask open-ended questions! Uncover their exact requirements.' };
      case 'recommend':
        return { title: 'Step 3: Sell / Recommend', hint: 'Propose a premium product and introduce My Best Buy Plus/Total membership.' };
      case 'protect':
        return { title: 'Step 4: GSP / Protect', hint: 'Recommend Geek Squad Protection or AppleCare+.' };
      case 'close':
        return { title: 'Step 5: BBY Card / Close', hint: 'Pitch the Best Buy Credit Card. Confidently ask for the sale!' };
      default:
        return { title: 'Simulation Complete', hint: 'Great job! Click Complete Session & Evaluate.' };
    }
  };

  const stepHint = getStepHint();

  return (
    <>
        {isEvaluating ? (
          <RoleplayEvaluationState />
        ) : (
          <div className="flex-column gap-xl">
            
            {/* Top Control Bar */}
          <div className="glass-card p-[1rem_1.5rem] flex flex-wrap justify-between items-center gap-md">
            <div className="flex-center-y gap-xl">
              <button className="btn btn-secondary btn-icon cursor-pointer" onClick={onExit} data-testid="back-btn">
                <ArrowLeft size={16} />
              </button>
              <div className="flex-center-y gap-sm">
                <img src={selectedScenario?.avatar} alt="" className="profile-avatar" />
                <div>
                  <h3 className="text-base font-bold m-0">{selectedScenario?.name}</h3>
                  <p className="text-xs text-secondary m-0">Practice: {selectedScenario?.title}</p>
                </div>
              </div>
            </div>

            <div className="flex-center-y gap-md">
              {apiKey && apiKey.trim().length > 10 ? (
                <span className="tag-pill bg-[var(--info-glow)] border-[rgba(6,182,212,0.3)] text-[#67e8f9]">
                  <Sparkles size={12} fill="#67e8f9" /> Gemini Generative Active
                </span>
              ) : (
                <span className="tag-pill bg-[var(--warning-glow)] border-[rgba(245,158,11,0.3)] text-[#fde047]">
                  Sandbox Simulator Active
                </span>
              )}
              <button className="btn btn-secondary cursor-pointer" onClick={restartRoleplay} data-testid="restart-session-btn">
                <RefreshCw size={14} /> Restart
              </button>
              <button className="btn btn-accent cursor-pointer" onClick={endAndEvaluate} disabled={isLoading} data-testid="complete-session-btn">
                Complete Session & Evaluate
              </button>
            </div>
          </div>

          <RoleplayProgressBar 
            completedSteps={completedSteps}
            currentActiveStep={currentActiveStep}
          />

          {/* Main Chat Layout */}
          <div className="grid grid-cols-[3fr_1fr] gap-xl max-lg:grid-cols-1">
            
            <RoleplayChatWindow 
              messages={messages}
              isLoading={isLoading}
              isListening={isListening}
              inputText={inputText}
              setInputText={setInputText}
              handleSend={handleSend}
              toggleMic={toggleMic}
              messagesEndRef={messagesEndRef}
            />

            <RoleplaySidebarCoach 
              stepHint={stepHint}
              selectedScenario={selectedScenario}
            />
          </div>
          </div>
        )}
    </>
  );
}
