const fs = require('fs');

const code = \import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EMPLOYEE_SCENARIOS } from '../services/ai';

// Custom Hooks
import { useAudioEngine } from './CoachSimulator/useAudioEngine';
import { useAiCoaching } from './CoachSimulator/useAiCoaching';

// Subcomponents
import LogBuilderTab from './CoachSimulator/LogBuilderTab';
import GrowSimulatorTab from './CoachSimulator/GrowSimulatorTab';
import ActiveSession from './CoachSimulator/ActiveSession';

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
    discFocus: ['Solve'],
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
    discFocus: ['Solve'],
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
    expectation: 'Propose financing or rewards on all transactions exceeding  today.',
    validation: 'Validate through counter observation side-by-sides and check submitted apps weekly.',
    discFocus: ['Discover'],
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
    discFocus: ['Close'],
    rawObservation: ''
  }
};

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
  roster = [],
  initialTab = 'sim'
}) {
  const { apiKey } = useApp();
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
        id: \oster-\\,
        title: \Coaching Roster: \\,
        role: 'Employee',
        name: \\ (\)\,
        avatar: displayAvatar,
        description: \Roster coaching for last month's performance data. Metric Gap: \\,
        metricGap: preselectedEmployee.gap,
        initialGreeting: \Hi boss. I saw last month's performance data. I know my numbers are low on my gap for \, but I feel like I'm trying. Customers just say no. What should I do differently?\,
        personality: 'Defensive initially, but opens up to GROW coaching prompts.',
        coachingGoal: \Coaching plan for \ based on retail metrics.\
      };
      
      setActiveTab('sim');
      aiCoaching.startCoaching(dynamicScen, audioEngine.isVoiceMode, audioEngine.speakText);
      
      const timer = setTimeout(() => {
        if (clearPreselectedEmployee) clearPreselectedEmployee();
      }, 50);
      return () => clearTimeout(timer);
    }
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
      
      setBuilderForm({
        employeeName: prefillBuilderData.name || '',
        what: '',
        how: '',
        why: '',
        strengths: (prefillBuilderData.memberships || 0) >= 5.0 ? 'Incredible membership attach rate and strong floor presence!' : 'Friendly greetings, proactive attitude on the floor.',
        metricGap: getPrefillGapType(),
        gapDetails: \Active Gap Focus: \ | Advisor Metrics Profile: RPH: $\/hr, Memberships: \ Attach, BBY Cards: \ Submissions, GSP Attach: \%, CSAT Survey Score: \?\,
        expectation: \Raise metrics to meet store benchmarks over the next 14 days.\,
        validation: \Store leader will perform counter observations and check weekly reporting.\,
        discFocus: ['Solve'],
        rawObservation: ''
      });
      
      setActiveTab('builder');
      
      const timer = setTimeout(() => {
        if (clearPrefillBuilderData) clearPrefillBuilderData();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [prefillBuilderData]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Platform Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Leader Coaching Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Practice roleplaying coaching conversations or document structured employee feedback logs.</p>
        </div>

        {/* Tab Switcher */}
        {!aiCoaching.sessionActive && (
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <button 
              className={\tn \\} 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
              onClick={() => setActiveTab('sim')}
            >
              GROW Practice Simulator
            </button>
            <button 
              className={\tn \\} 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
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
          playbookSettings={playbookSettings}
        />
      )}

      {/* Builder Tab Content */}
      {activeTab === 'builder' && !aiCoaching.sessionActive && (
        <LogBuilderTab 
          playbookSettings={playbookSettings}
          apiKey={apiKey}
          roster={roster}
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
          TEMPLATES={TEMPLATES}
        />
      )}
    </div>
  );
}
\;

fs.writeFileSync('src/components/CoachSimulator.tsx', code);
console.log('Refactored CoachSimulator.tsx');
