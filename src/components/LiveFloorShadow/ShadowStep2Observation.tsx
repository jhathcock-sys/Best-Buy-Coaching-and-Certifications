import React from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle, Mic, MicOff } from 'lucide-react';

export default function ShadowStep2Observation({ 
  roster,
  selectedEmpId,
  setSelectedEmpId,
  department,
  setDepartment,
  setCurrentStep,
  checklist,
  setChecklist,
  customerPersona,
  setCustomerPersona,
  customPersona,
  setCustomPersona,
  notes,
  setNotes,
  isGenerating,
  setIsGenerating,
  handleGenerateCoaching,
  coachingInsight,
  setCoachingInsight,
  toggleChecklistItem
 }) {
  const [isListening, setIsListening] = React.useState(false);

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech Recognition API not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNotes(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  return (
    <>
      <div className="flex-column gap-2xl animate-fade-in">
        <h3 className="text-xl flex-center gap-sm justify-start m-0">
          <ShieldCheck size={20} color="var(--bby-blue)" /> Behavior Checklist (DISC Model)
        </h3>

        <div className="grid-cols-2 gap-lg">
          
          {/* Discover Section */}
          <div className="bg-white-alpha-01 border-glass rounded-xl p-1-25rem">
            <h4 className="text-base text-bby-blue border-b-bby-blue-alpha-15 pb-sm mb-md m-0">
              Discover
            </h4>
            <div className="flex-column gap-sm">
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.greeting} onChange={() => toggleChecklistItem('greeting')} />
                        Friendly welcome within 10s / 10ft
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.nameExchange} onChange={() => toggleChecklistItem('nameExchange')} />
                        Exchanged names / introduced self
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.setupProbe} onChange={() => toggleChecklistItem('setupProbe')} />
                        Probed customer environment setup
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.specQuestions} onChange={() => toggleChecklistItem('specQuestions')} />
                        Asked open-ended spec/usage questions
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.avoidedForbidden} onChange={() => toggleChecklistItem('avoidedForbidden')} />
                        Avoided forbidden retail vocabulary
                      </label>
            </div>
          </div>

          {/* Inspire Section */}
          <div className="bg-white-alpha-01 border-glass rounded-xl p-1-25rem">
            <h4 className="text-base text-info border-b-cyan-alpha-15 pb-sm mb-md m-0">
              Inspire
            </h4>
            <div className="flex-column gap-sm">
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.builtRapport} onChange={() => toggleChecklistItem('builtRapport')} />
                        Connected personally / built human rapport
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.emotionalDriver} onChange={() => toggleChecklistItem('emotionalDriver')} />
                        Uncovered customer emotional driver
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.demoProduct} onChange={() => toggleChecklistItem('demoProduct')} />
                        Demonstrated product/service features
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.membershipBenefits} onChange={() => toggleChecklistItem('membershipBenefits')} />
                        Shared membership benefits during demo
                      </label>
            </div>
          </div>

          {/* Solve Section */}
          <div className="bg-white-alpha-01 border-glass rounded-xl p-1-25rem">
            <h4 className="text-base text-success border-b-success-alpha-15 pb-sm mb-md m-0">
              Solve
            </h4>
            <div className="flex-column gap-sm">
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.membershipPitched} onChange={() => toggleChecklistItem('membershipPitched')} />
                        Pitched Plus/Total support solution
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.warrantyAttached} onChange={() => toggleChecklistItem('warrantyAttached')} />
                        Attached protection (GSP/AppleCare+)
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.solutionMatched} onChange={() => toggleChecklistItem('solutionMatched')} />
                        Matched the complete solution
                      </label>
            </div>
          </div>

          {/* Close Section */}
          <div className="bg-white-alpha-01 border-glass rounded-xl p-1-25rem">
            <h4 className="text-base text-warning border-b-warning-alpha-15 pb-sm mb-md m-0">
              Close
            </h4>
            <div className="flex-column gap-sm">
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.creditCardPitched} onChange={() => toggleChecklistItem('creditCardPitched')} />
                        Pitched Credit Card rewards/financing
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.handledObjections} onChange={() => toggleChecklistItem('handledObjections')} />
                        Acknowledged and handled objections
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.surveyRequested} onChange={() => toggleChecklistItem('surveyRequested')} />
                        Requested feedback via 5-Star Survey
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                        <input type="checkbox" checked={checklist.sleeveReceipt} onChange={() => toggleChecklistItem('sleeveReceipt')} />
                        Receipt in sleeve with written advisor name
                      </label>
            </div>
          </div>
        </div>

        {/* Notes & Dictation */}
        <div className="glass-card p-1-25rem mt-md" style={{ border: isListening ? '1px solid var(--error)' : '1px solid var(--border-glass)' }}>
          <div className="flex-between align-center mb-sm">
            <h4 className="text-base text-white flex-center gap-sm m-0">
              <Clipboard size={18} color="var(--text-secondary)" /> Raw Observation Notes
            </h4>
            <button 
              type="button" 
              onClick={toggleMic}
              className="flex-center gap-sm px-md py-sm rounded-20 cursor-bold text-xs font-bold"
              style={{ 
                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                border: isListening ? '1px solid var(--error)' : 'none',
                color: isListening ? 'var(--error)' : '#fff',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Stop Recording' : 'Start Dictation'}
            </button>
          </div>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Capture raw dialogue, behavioral notes, and specific coaching feedback here. AI will summarize this later..."
            className="form-control bg-black-alpha-30 border-transparent text-white w-full h-100px resize-none p-sm text-sm"
          />
          {isListening && (
            <div className="text-xs text-error mt-sm flex-center gap-xs justify-start">
              <span className="inline-block w-2 h-2 bg-error rounded-full animate-pulse"></span>
              Microphone is active and transcribing...
            </div>
          )}
        </div>
      </div>
    </>
  );
}
