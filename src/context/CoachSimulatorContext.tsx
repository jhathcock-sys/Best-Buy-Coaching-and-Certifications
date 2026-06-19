import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface CoachSimulatorContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  outputViewMode: string;
  setOutputViewMode: (mode: string) => void;

  selectedEmployee: any;
  setSelectedEmployee: (emp: any) => void;
  sessionActive: boolean;
  setSessionActive: (active: boolean) => void;
  messages: any[];
  setMessages: (msgs: any[] | ((prev: any[]) => any[])) => void;
  inputVal: string;
  setInputVal: (val: string) => void;
  currentCoachStep: string;
  setCurrentCoachStep: (step: string) => void;
  completedCoachSteps: Record<string, boolean>;
  setCompletedCoachSteps: (steps: any) => void;
  evaluation: any;
  setEvaluation: (evalData: any) => void;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
  isEvaluating: boolean;
  setIsEvaluating: (evaluating: boolean) => void;
  isVoiceMode: boolean;
  setIsVoiceMode: (voice: boolean) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  
  builderForm: any;
  setBuilderForm: (form: any | ((prev: any) => any)) => void;
  isGeneratingLog: boolean;
  setIsGeneratingLog: (generating: boolean) => void;
  copySuccess: boolean;
  setCopySuccess: (success: boolean) => void;

  recognitionRef: React.MutableRefObject<any>;
}

const CoachSimulatorContext = createContext<CoachSimulatorContextType | undefined>(undefined);

export function CoachSimulatorProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('sim');
  const [outputViewMode, setOutputViewMode] = useState('grow');
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [currentCoachStep, setCurrentCoachStep] = useState('goal');
  const [completedCoachSteps, setCompletedCoachSteps] = useState({
    goal: false,
    reality: false,
    options: false,
    will: false
  });
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
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

  const recognitionRef = useRef<any>(null);

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

  return (
    <CoachSimulatorContext.Provider value={{
      activeTab, setActiveTab,
      outputViewMode, setOutputViewMode,
      selectedEmployee, setSelectedEmployee,
      sessionActive, setSessionActive,
      messages, setMessages,
      inputVal, setInputVal,
      currentCoachStep, setCurrentCoachStep,
      completedCoachSteps, setCompletedCoachSteps,
      evaluation, setEvaluation,
      isThinking, setIsThinking,
      isEvaluating, setIsEvaluating,
      isVoiceMode, setIsVoiceMode,
      isListening, setIsListening,
      builderForm, setBuilderForm,
      isGeneratingLog, setIsGeneratingLog,
      copySuccess, setCopySuccess,
      recognitionRef
    }}>
      {children}
    </CoachSimulatorContext.Provider>
  );
}

export function useCoachSimulator() {
  const context = useContext(CoachSimulatorContext);
  if (!context) {
    throw new Error('useCoachSimulator must be used within a CoachSimulatorProvider');
  }
  return context;
}
