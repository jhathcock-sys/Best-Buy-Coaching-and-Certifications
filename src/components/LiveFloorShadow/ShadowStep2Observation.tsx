import React, { useEffect } from 'react';
import { ShieldCheck, Clipboard, Mic, MicOff } from 'lucide-react';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [key: number]: {
      isFinal: boolean;
      [key: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  stop: () => void;
  start: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export interface ShadowStep2ObservationProps {
  checklist: Record<string, boolean>;
  toggleChecklistItem: (key: string) => void;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export default function ShadowStep2Observation({ 
  checklist,
  toggleChecklistItem,
  notes,
  setNotes
 }: ShadowStep2ObservationProps) {
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech Recognition API not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      const SpeechRecognition = (window as unknown as { SpeechRecognition: any }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setNotes(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const safeChecklist = checklist || {};

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
                <input type="checkbox" checked={!!safeChecklist.greeting} onChange={() => toggleChecklistItem('greeting')} data-testid="shadow-check-greeting" />
                Friendly welcome within 10s / 10ft
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.nameExchange} onChange={() => toggleChecklistItem('nameExchange')} data-testid="shadow-check-nameExchange" />
                Exchanged names / introduced self
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.setupProbe} onChange={() => toggleChecklistItem('setupProbe')} data-testid="shadow-check-setupProbe" />
                Probed customer environment setup
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.specQuestions} onChange={() => toggleChecklistItem('specQuestions')} data-testid="shadow-check-specQuestions" />
                Asked open-ended spec/usage questions
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.avoidedForbidden} onChange={() => toggleChecklistItem('avoidedForbidden')} data-testid="shadow-check-avoidedForbidden" />
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
                <input type="checkbox" checked={!!safeChecklist.builtRapport} onChange={() => toggleChecklistItem('builtRapport')} data-testid="shadow-check-builtRapport" />
                Connected personally / built human rapport
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.emotionalDriver} onChange={() => toggleChecklistItem('emotionalDriver')} data-testid="shadow-check-emotionalDriver" />
                Uncovered customer emotional driver
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.demoProduct} onChange={() => toggleChecklistItem('demoProduct')} data-testid="shadow-check-demoProduct" />
                Demonstrated product/service features
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.membershipBenefits} onChange={() => toggleChecklistItem('membershipBenefits')} data-testid="shadow-check-membershipBenefits" />
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
                <input type="checkbox" checked={!!safeChecklist.membershipPitched} onChange={() => toggleChecklistItem('membershipPitched')} data-testid="shadow-check-membershipPitched" />
                Pitched Plus/Total support solution
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.warrantyAttached} onChange={() => toggleChecklistItem('warrantyAttached')} data-testid="shadow-check-warrantyAttached" />
                Attached protection (GSP/AppleCare+)
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.solutionMatched} onChange={() => toggleChecklistItem('solutionMatched')} data-testid="shadow-check-solutionMatched" />
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
                <input type="checkbox" checked={!!safeChecklist.creditCardPitched} onChange={() => toggleChecklistItem('creditCardPitched')} data-testid="shadow-check-creditCardPitched" />
                Pitched Credit Card rewards/financing
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.handledObjections} onChange={() => toggleChecklistItem('handledObjections')} data-testid="shadow-check-handledObjections" />
                Acknowledged and handled objections
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.surveyRequested} onChange={() => toggleChecklistItem('surveyRequested')} data-testid="shadow-check-surveyRequested" />
                Requested feedback via 5-Star Survey
              </label>
              <label className="flex-center gap-sm cursor-pointer text-sm justify-start">
                <input type="checkbox" checked={!!safeChecklist.sleeveReceipt} onChange={() => toggleChecklistItem('sleeveReceipt')} data-testid="shadow-check-sleeveReceipt" />
                Receipt in sleeve with written advisor name
              </label>
            </div>
          </div>
        </div>

        {/* Notes & Dictation */}
        <div className={`glass-card p-1-25rem mt-md ${isListening ? 'border-error shadow-error-glow' : 'border-glass'}`}>
          <div className="flex-between align-center mb-sm">
            <h4 className="text-base text-white flex-center gap-sm m-0">
              <Clipboard size={18} color="var(--text-secondary)" /> Raw Observation Notes
            </h4>
            <button 
              type="button" 
              onClick={toggleMic}
              className={`flex-center gap-sm px-md py-sm rounded-20 cursor-pointer text-xs font-bold transition-all ${isListening ? 'bg-error-alpha-20 text-error border-error-alpha-20 animate-pulse' : 'bg-white-alpha-10 text-white border-transparent'}`}
              data-testid="shadow-dictation-btn"
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
            data-testid="shadow-notes-textarea"
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
