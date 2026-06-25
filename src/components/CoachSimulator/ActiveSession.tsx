import React from 'react';
import { ArrowLeft, Mic, MicOff, Send, HelpCircle, FileText, RefreshCw, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Employee } from '../../types';

export interface Message {
  sender: 'coach' | 'employee' | 'system';
  text: string;
}

export interface Evaluation {
  score: number;
  strengths?: string;
  opportunities?: string;
  feedback?: string;
}

export interface ActiveSessionProps {
  selectedEmployee: Employee | null;
  sessionActive: boolean;
  setSessionActive: (active: boolean) => void;
  messages: Message[];
  evaluation: Evaluation | null;
  isEvaluating: boolean;
  finishCoaching: () => void;
  handleSend: (text: string, voiceMode: boolean, audioBlob: Blob | null) => void;
  inputVal: string;
  setInputVal: (val: string) => void;
  isThinking: boolean;
  completedCoachSteps: {
    goal?: boolean;
    reality?: boolean;
    options?: boolean;
    will?: boolean;
  } | null;
  currentCoachStep: string;
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
  isListening: boolean;
  handleMicClick: () => void;
}

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
  handleMicClick
}: ActiveSessionProps) {
  const playbookSettings = useStore((state) => state.playbookSettings);

  if (!sessionActive || !selectedEmployee) return null;

  return (
    <div className="flex-column gap-xl" data-testid="active-session-container">
      {!evaluation ? (
        <>
          <div className="glass-card p-lg flex-row justify-between align-center flex-wrap gap-md">
            <div className="flex-row align-center gap-md">
              <button 
                className="btn btn-secondary btn-icon cursor-pointer" 
                onClick={() => setSessionActive(false)}
                data-testid="btn-leave-session"
              >
                <ArrowLeft size={16} />
              </button>
              <img src={selectedEmployee.avatar} alt="" className="profile-avatar" />
              <div>
                <h3 className="text-lg m-0">Coaching: {selectedEmployee.name}</h3>
                <p className="text-sm text-secondary m-0">Opportunity Gap: {selectedEmployee.metricGap}</p>
              </div>
            </div>

            <div className="flex-row align-center gap-md">
              <button 
                className={`btn ${isVoiceMode ? 'btn-accent' : 'btn-secondary'} flex-row align-center gap-sm text-sm py-sm px-md cursor-pointer`}
                onClick={toggleVoiceMode}
                data-testid="btn-toggle-voice"
              >
                {isVoiceMode ? <Mic size={16} /> : <MicOff size={16} />}
                Voice Mode {isVoiceMode ? 'ON' : 'OFF'}
              </button>
              <button 
                className="btn btn-primary text-sm py-sm px-lg cursor-pointer" 
                onClick={finishCoaching} 
                disabled={isEvaluating}
                data-testid="btn-finish-evaluate"
              >
                {isEvaluating ? 'Evaluating...' : 'Finish & Evaluate Session'}
              </button>
            </div>
          </div>

          <div className="grid gap-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="glass-card p-0 flex-column flex-2 h-65vh min-h-500px">
              <div className="p-lg border-b border-glass bg-white-alpha-05">
                <h4 className="text-md text-secondary m-0">Roleplay Chat</h4>
              </div>
              
              <div className="chat-container flex-1 p-xl overflow-y-auto flex-column gap-lg" data-testid="chat-history">
                {(messages || []).map((msg, i) => (
                  <div key={i} className={`p-lg rounded-2xl max-w-75 shadow-lg ${
                    msg.sender === 'coach' 
                      ? 'align-self-end bg-bby-blue rounded-br-sm' 
                      : 'align-self-start bg-white-alpha-10 rounded-bl-sm'
                  }`}>
                    <p className="m-0 text-base line-height-normal">{msg.text}</p>
                  </div>
                ))}
                {isThinking && (messages || [])[(messages || []).length - 1]?.sender === 'coach' && (
                  <div className="align-self-start bg-white-alpha-05 p-lg rounded-2xl rounded-bl-sm">
                    <div className="skeleton-pulse h-3 w-120px bg-white-alpha-20 rounded-full" />
                  </div>
                )}
              </div>

              <div className="p-lg border-t border-glass bg-black-alpha-20">
                <div className="flex-row gap-md">
                  {isVoiceMode ? (
                    <button 
                      className={`btn ${isListening ? 'btn-accent pulse-animation' : 'btn-secondary'} flex-1 flex-center gap-sm p-md text-base cursor-pointer`}
                      onClick={handleMicClick}
                      data-testid="btn-mic-toggle"
                    >
                      {isListening ? (
                        <>
                          <Mic size={20} />
                          Listening... Tap to stop
                        </>
                      ) : (
                        <>
                          <MicOff size={20} className="opacity-60" />
                          Tap Mic to Speak
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        className="form-control flex-1 bg-white-alpha-05 border-glass" 
                        placeholder="Type your response..."
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal, isVoiceMode, null)}
                        disabled={isThinking}
                        data-testid="chat-input-field"
                      />
                      <button 
                        className="btn btn-primary btn-icon w-48px h-48px rounded-xl cursor-pointer" 
                        onClick={() => handleSend(inputVal, isVoiceMode, null)}
                        disabled={isThinking || !inputVal.trim()}
                        data-testid="btn-send-message"
                      >
                        <Send size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex-column gap-xl">
              <div className="glass-card flex-1">
                <h4 className="text-base mb-md flex align-center gap-sm m-0">
                  <HelpCircle size={18} className="text-info" /> GROW Coaching Model
                </h4>
                
                <div className="flex-column gap-sm mt-md">
                  <div className={`grow-step-card ${currentCoachStep === 'goal' ? 'active' : ''} ${completedCoachSteps?.goal ? 'completed' : ''}`} data-testid="grow-step-goal">
                    <div className="grow-step-header">
                      <span>Goal</span>
                      {completedCoachSteps?.goal && <Check size={14} className="text-success" />}
                    </div>
                    <p>Establish what the advisor wants to achieve. What is the metric target?</p>
                  </div>
                  
                  <div className={`grow-step-card ${currentCoachStep === 'reality' ? 'active' : ''} ${completedCoachSteps?.reality ? 'completed' : ''}`} data-testid="grow-step-reality">
                    <div className="grow-step-header">
                      <span>Reality</span>
                      {completedCoachSteps?.reality && <Check size={14} className="text-success" />}
                    </div>
                    <p>Discuss the current situation. What barriers are they facing on the floor?</p>
                  </div>
                  
                  <div className={`grow-step-card ${currentCoachStep === 'options' ? 'active' : ''} ${completedCoachSteps?.options ? 'completed' : ''}`} data-testid="grow-step-options">
                    <div className="grow-step-header">
                      <span>Options</span>
                      {completedCoachSteps?.options && <Check size={14} className="text-success" />}
                    </div>
                    <p>Brainstorm behaviors. How can they use the DISC model to overcome barriers?</p>
                  </div>
                  
                  <div className={`grow-step-card ${currentCoachStep === 'will' ? 'active' : ''} ${completedCoachSteps?.will ? 'completed' : ''}`} data-testid="grow-step-will">
                    <div className="grow-step-header">
                      <span>Will</span>
                      {completedCoachSteps?.will && <Check size={14} className="text-success" />}
                    </div>
                    <p>Commit to action. What exactly will they do next time?</p>
                  </div>
                </div>
                
                {playbookSettings?.useGemini ? (
                  <div className="mt-xl p-md bg-success-alpha-10 rounded-lg border border-success-alpha-20" data-testid="ai-progress-status-active">
                    <h5 className="text-success m-0 text-sm flex align-center gap-sm">
                      <Check size={14} /> AI Progress Tracking Active
                    </h5>
                    <p className="text-xs mt-xs text-secondary m-0">Gemini is analyzing your conversation and advancing the GROW steps automatically.</p>
                  </div>
                ) : (
                  <div className="mt-xl p-md bg-white-alpha-05 rounded-lg border border-glass" data-testid="ai-progress-status-offline">
                    <h5 className="m-0 text-sm flex align-center gap-sm text-secondary">
                      Offline Mode Active
                    </h5>
                    <p className="text-xs mt-xs text-muted m-0">Progress tracking is simulated. Connect Gemini API for real-time NLP analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card max-w-800px mx-auto w-full" data-testid="evaluation-screen">
          <div className="text-center mb-xl">
            <h2 className={`text-3xl m-0 ${evaluation.score >= 80 ? 'text-success' : evaluation.score >= 60 ? 'text-warning' : 'text-error'}`}>
              Evaluation Score: {evaluation.score}%
            </h2>
            <p className="text-secondary mt-sm">Roleplay complete. Here is the feedback on your coaching.</p>
          </div>
          
          <div className="grid gap-md mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="p-md bg-success-alpha-10 border border-success-alpha-20 rounded-lg">
              <h4 className="text-success text-sm mb-sm uppercase">Strengths</h4>
              <p className="text-base line-height-normal m-0">{evaluation.strengths || "Good effort."}</p>
            </div>
            
            <div className="p-md bg-error-alpha-10 border border-error-alpha-20 rounded-lg">
              <h4 className="text-error text-sm mb-sm uppercase">Opportunities</h4>
              <p className="text-base line-height-normal m-0">{evaluation.opportunities || "Focus on the GROW model."}</p>
            </div>
          </div>
          
          <div className="p-xl bg-white-alpha-05 border border-glass rounded-lg mb-xl">
            <h4 className="text-base mb-sm text-bby-blue m-0">Summary Feedback</h4>
            <p className="text-base line-height-normal m-0 mt-sm">{evaluation.feedback}</p>
          </div>
          
          <div className="flex-row gap-md justify-center">
            <button 
              className="btn btn-secondary cursor-pointer" 
              onClick={() => {
                setSessionActive(false);
              }}
              data-testid="btn-return-roster"
            >
              Return to Roster
            </button>
            <button 
              className="btn btn-primary flex-row align-center gap-sm cursor-pointer" 
              onClick={() => {
                window.location.hash = '#store-roster';
              }}
              data-testid="btn-update-roster"
            >
              <FileText size={16} /> Update Roster Gap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
