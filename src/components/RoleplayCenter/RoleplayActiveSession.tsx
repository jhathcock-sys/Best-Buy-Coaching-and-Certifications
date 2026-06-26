import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, RefreshCw, BookOpen, Mic, MicOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { runOfflineSimulationStep, runGeminiSimulationStep, evaluateSessionOffline, evaluateSessionGemini } from '../../services/ai';

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
      
      onEvaluationComplete(result);
    } catch (err) {
      console.error(err);
      setIsEvaluating(false);
      setIsLoading(false);
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
          <div className="glass-card flex-column flex-center gap-xl p-[3rem] min-h-[500px] text-center" data-testid="evaluating-state">
            <div className="relative w-[120px] h-[120px]">
              <div className="skeleton-pulse absolute top-0 left-0 w-full h-full rounded-full border-[8px] border-[rgba(255,230,0,0.05)] border-t-[var(--bby-yellow)] animate-spin"></div>
              <div className="flex-center w-full h-full">
                <Sparkles size={36} className="text-bby-yellow typing-dots" />
              </div>
            </div>
            
            <div className="max-w-[450px] flex-column gap-sm">
              <h3 className="text-xl text-white font-bold">AI Performance Audit in progress</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Gemini is grading your consultative discovery questions, verifying your membership values pitch, checking GSP warranty attachments, and parsing final credit card close rewards.
              </p>
            </div>

            <div className="w-full max-w-[300px] flex-column gap-sm mt-md">
              <div className="skeleton-pulse h-[12px] w-full bg-white-alpha-05 rounded-md"></div>
              <div className="skeleton-pulse h-[12px] w-4/5 bg-white-alpha-05 rounded-md self-center"></div>
            </div>
          </div>
        ) : (
          <div className="flex-column gap-xl">
            
            {/* Top Control Bar */}
          <div className="glass-card p-[1rem_1.5rem] flex flex-wrap justify-between items-center gap-md">
            <div className="flex-center-y gap-xl">
              <button className="btn btn-secondary btn-icon" onClick={onExit} data-testid="back-btn">
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
              <button className="btn btn-secondary" onClick={restartRoleplay}>
                <RefreshCw size={14} /> Restart
              </button>
              <button className="btn btn-accent" onClick={endAndEvaluate} disabled={isLoading} data-testid="complete-session-btn">
                Complete Session & Evaluate
              </button>
            </div>
          </div>

          {/* Sales Flow Progress Bar */}
          <div className="glass-card p-xl">
            <div className="sales-flow-tracker">
              <div 
                className="sales-flow-progress-bar" 
                style={{ 
                  width: `${
                    completedSteps?.close ? 100 :
                    completedSteps?.protect ? 80 :
                    completedSteps?.recommend ? 60 :
                    completedSteps?.discover ? 40 :
                    completedSteps?.connect ? 20 : 0
                  }%` 
                }} 
              />
              <div className={`flow-step ${completedSteps?.connect ? 'completed' : currentActiveStep === 'connect' ? 'active' : 'pending'}`}>
                <div className="flow-node">1</div>
                <div className="flow-label">Connect</div>
              </div>
              <div className={`flow-step ${completedSteps?.discover ? 'completed' : currentActiveStep === 'discover' ? 'active' : 'pending'}`}>
                <div className="flow-node">2</div>
                <div className="flow-label">Discover</div>
              </div>
              <div className={`flow-step ${completedSteps?.recommend ? 'completed' : currentActiveStep === 'recommend' ? 'active' : 'pending'}`}>
                <div className="flow-node">3</div>
                <div className="flow-label">Recommend</div>
              </div>
              <div className={`flow-step ${completedSteps?.protect ? 'completed' : currentActiveStep === 'protect' ? 'active' : 'pending'}`}>
                <div className="flow-node">4</div>
                <div className="flow-label">Protect</div>
              </div>
              <div className={`flow-step ${completedSteps?.close ? 'completed' : currentActiveStep === 'close' ? 'active' : 'pending'}`}>
                <div className="flow-node">5</div>
                <div className="flow-label">Close</div>
              </div>
            </div>
          </div>

          {/* Main Chat Layout */}
          <div className="grid grid-cols-[3fr_1fr] gap-xl max-lg:grid-cols-1">
            
            {/* Dialogue Arena */}
            <div className="chat-container">
              <div className="chat-messages">
                {messages?.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-bubble ${m.sender === 'advisor' ? 'bubble-advisor' : 'bubble-customer'}`}
                  >
                    {m.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-bubble bubble-customer flex-center-y w-[80px] p-[0.75rem_1rem]">
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-bar">
                <input 
                  type="text" 
                  className={`chat-input ${isListening ? 'border-error bg-[rgba(239,68,68,0.05)]' : 'border-transparent bg-white-alpha-05'}`}
                  placeholder={isListening ? "Listening... Speak your response" : "Type your response to the customer..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  data-testid="chat-input"
                />
                <button 
                  className={`btn btn-icon ${isListening ? 'bg-[rgba(239,68,68,0.2)] text-error animate-pulse' : 'bg-white-alpha-10 text-white'}`}
                  onClick={toggleMic} 
                  disabled={isLoading}
                  title="Speak response"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={isLoading || isListening} data-testid="send-msg-btn">
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Sidebar Active Guidance Coach */}
            <div className="flex-column gap-md">
              <div className="glass-card border-[rgba(0,70,190,0.3)] bg-[rgba(0,70,190,0.05)]">
                <h4 className="text-base text-bby-yellow flex-center-y gap-sm mb-sm">
                  <Sparkles size={16} /> Live Coaching Guide
                </h4>
                <div className="border-b border-white-alpha-05 pb-sm mb-sm">
                  <h5 className="text-sm text-white mb-xs">{stepHint?.title}</h5>
                  <p className="text-xs text-secondary leading-relaxed">{stepHint?.hint}</p>
                </div>
                <div>
                  <h5 className="text-sm text-white mb-xs flex-center-y gap-xs">
                    <BookOpen size={12} /> Pro-Tip Checklist
                  </h5>
                  <ul className="text-xs text-muted pl-lg flex-column gap-xs leading-relaxed list-disc">
                    <li>Avoid saying "warranty"—use "protection package" or "peace of mind."</li>
                    <li>Always offer My Best Buy Total or Plus options on premium hardware.</li>
                    <li>Highlight 10% back in rewards or financing to overcome price hurdles.</li>
                  </ul>
                </div>
              </div>

              <div className="glass-card">
                <h4 className="text-sm mb-sm">Customer Profile</h4>
                <p className="text-xs text-secondary mb-xs"><strong>Needs:</strong> {selectedScenario?.needs}</p>
                <p className="text-xs text-secondary italic"><strong>Style:</strong> {selectedScenario?.difficulty === 'Easy' ? 'Quickly cooperative' : 'Will bring up multiple financial/risk objections.'}</p>
              </div>
          </div>
          </div>
          </div>
        )}
    </>
  );
}
