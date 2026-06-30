import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { EMPLOYEE_SCENARIOS } from '../services/ai';
import { CoachingLog, Employee } from '../types';

// Custom Hooks
import { useAudioEngine } from '../components/CoachSimulator/useAudioEngine';
import { useAiCoaching } from '../components/CoachSimulator/useAiCoaching';

// Subcomponents
import LogBuilderTab from '../components/CoachSimulator/LogBuilderTab';
import GrowSimulatorTab from '../components/CoachSimulator/GrowSimulatorTab';
import ActiveSession from '../components/CoachSimulator/ActiveSession';



const EMPTY_ARR: any[] = []; // Used for multiple array types, keeping flexible for now but restricting internal usages

export interface CoachSimulatorProps {
  preselectedEmployee?: Employee;
  clearPreselectedEmployee?: () => void;
  prefillBuilderData?: Employee;
  clearPrefillBuilderData?: () => void;
  initialTab?: string;
}

export default function CoachSimulator({ 
  preselectedEmployee, 
  clearPreselectedEmployee, 
  prefillBuilderData, 
  clearPrefillBuilderData, 
  initialTab = 'sim'
}: CoachSimulatorProps) {
  const apiKey = useStore((state) => state.apiKey);
  
  const playbookSettings = useStore((state) => state.playbookSettings);
  const customScenarios = useStore((state) => state.customScenarios) || EMPTY_ARR;
  const importCustomScenario = useStore((state) => state.importCustomScenario);
  const logCoachingSession = useStore((state) => state.logCoachingSession);
  const coachingLogs = useStore((state) => state.coachingLogs) || (EMPTY_ARR as CoachingLog[]);
  
  const onImportScenario = importCustomScenario;
  const onLogCoachingSession = logCoachingSession;

  const allEmployees = useMemo(() => [
    ...(Array.isArray(EMPLOYEE_SCENARIOS) ? EMPLOYEE_SCENARIOS : []), 
    ...(Array.isArray(customScenarios) ? customScenarios : [])
  ], [customScenarios]);

  // Tab State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [outputViewMode, setOutputViewMode] = useState('grow');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // State
  const [inputVal, setInputVal] = useState('');
  
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

  // Initialize Hooks
  const aiCoaching = useAiCoaching(apiKey, playbookSettings, coachingLogs, onLogCoachingSession);
  const audioEngine = useAudioEngine(aiCoaching.messages, setInputVal);

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
      
      setActiveTab('sim');
      aiCoaching.startCoaching(dynamicScen, audioEngine.isVoiceMode, audioEngine.speakText);
      
      if (clearPreselectedEmployee) {
        clearPreselectedEmployee();
      }
    }
  }, [preselectedEmployee, clearPreselectedEmployee]);

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
      
      if (clearPrefillBuilderData) {
        clearPrefillBuilderData();
      }
    }
  }, [prefillBuilderData, clearPrefillBuilderData]);


  return (
    <div className="flex-column gap-2xl" data-testid="coach-simulator-page">
      {/* Platform Title */}
      <div className="flex-between flex-wrap gap-md">
        <div>
          <h1 className="text-3xl mb-xs">Leader Coaching Portal</h1>
          <p className="text-secondary">Practice roleplaying coaching conversations or document structured employee feedback logs.</p>
        </div>

        {/* Tab Switcher */}
        {!aiCoaching.sessionActive && (
          <div className="flex-row gap-xs bg-white-alpha-02 p-xs rounded-xl border-glass">
            <button 
              data-testid="tab-sim-btn"
              className={`btn btn-sm shadow-none cursor-pointer ${activeTab === 'sim' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('sim')}
            >
              GROW Practice Simulator
            </button>
            <button 
              data-testid="tab-builder-btn"
              className={`btn btn-sm shadow-none cursor-pointer ${activeTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('builder')}
            >
              4-Section Log Builder
            </button>
          </div>
        )}
      </div>

      {/* Simulator Tab Content */}
      {activeTab === 'sim' && !aiCoaching.sessionActive && (
        <GrowSimulatorTab 
          allEmployees={allEmployees}
          startCoaching={aiCoaching.startCoaching}
          isVoiceMode={audioEngine.isVoiceMode}
          speakText={audioEngine.speakText}
          onImportScenario={onImportScenario}
        />
      )}

      {/* Active Session Content */}
      {aiCoaching.sessionActive && (
        <ActiveSession 
          selectedEmployee={aiCoaching.selectedEmployee}
          sessionActive={aiCoaching.sessionActive}
          setSessionActive={aiCoaching.setSessionActive}
          messages={aiCoaching.messages}
          evaluation={aiCoaching.evaluation}
          isEvaluating={aiCoaching.isEvaluating}
          finishCoaching={aiCoaching.finishCoaching}
          handleSend={aiCoaching.handleSend}
          inputVal={inputVal}
          setInputVal={setInputVal}
          isThinking={aiCoaching.isThinking}
          completedCoachSteps={aiCoaching.completedCoachSteps}
          currentCoachStep={aiCoaching.currentCoachStep}
          isVoiceMode={audioEngine.isVoiceMode}
          toggleVoiceMode={audioEngine.toggleVoiceMode}
          isListening={audioEngine.isListening}
          handleMicClick={audioEngine.handleMicClick}
        />
      )}

      {/* Builder Tab Content */}
      {activeTab === 'builder' && !aiCoaching.sessionActive && (
        <LogBuilderTab 
          prefillBuilderData={prefillBuilderData}
          clearPrefillBuilderData={clearPrefillBuilderData}
          builderForm={builderForm}
          setBuilderForm={setBuilderForm}
          isGeneratingLog={isGeneratingLog}
          setIsGeneratingLog={setIsGeneratingLog}
          copySuccess={copySuccess}
          setCopySuccess={setCopySuccess}
          outputViewMode={outputViewMode}
          setOutputViewMode={setOutputViewMode}
          handleSpeech={audioEngine.handleSpeech}
          handleStopSpeech={audioEngine.handleStopSpeech}
          isPlayingSpeech={audioEngine.isPlayingSpeech}
          isPausedSpeech={audioEngine.isPausedSpeech}
        />
      )}
    </div>
  );
}
