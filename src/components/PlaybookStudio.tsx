import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass, Users, UserPlus, Edit2, Eye, EyeOff, Cpu, RefreshCw } from 'lucide-react';

import { useStore } from '../store/useStore';

import AiEngineTab from './PlaybookStudio/AiEngineTab';
import SystemPromptsTab from './PlaybookStudio/SystemPromptsTab';
import SupervisorProfilesTab from './PlaybookStudio/SupervisorProfilesTab';
import BbyVocabTab from './PlaybookStudio/BbyVocabTab';
import DepartmentTargetsTab from './PlaybookStudio/DepartmentTargetsTab';
import SyncDiagnosticsTab from './PlaybookStudio/SyncDiagnosticsTab';
import CustomScenariosTab from './Playbook/CustomScenariosTab';

export default function PlaybookStudio() {
  const storeId = useStore((state) => state.storeId);
  const apiKey = useStore((state) => state.apiKey);
  const dbConnected = useStore((state) => state.dbConnected);
  const handleSaveFirebaseConfig = useStore((state) => state.handleSaveFirebaseConfig);
  
  const playbookSettings = useStore(state => state.playbookSettings);
  const onSaveSettings = useStore(state => state.saveSettings);
  const deptGoals = useStore(state => state.deptGoals) || {};
  const onSaveDeptGoals = useStore(state => state.saveDeptGoals);
  const customScenarios = useStore(state => state.customScenarios) || [];
  const onAddCustomScenario = useStore(state => state.importCustomScenario);
  const onDeleteCustomScenario = useStore(state => state.deleteCustomScenario);
  const rosterHistory = useStore(state => state.rosterHistory) || {};
  const coachingLogs = useStore(state => state.coachingLogs) || [];
  const followUpTasks = useStore(state => state.followUpTasks) || [];
  const floorLeaderShifts = useStore(state => state.floorLeaderShifts) || [];
  const managers = useStore(state => state.managers) || [];
  const onSaveManagers = useStore(state => state.saveManagers);
  const [activeTab, setActiveTab] = useState('engine');
  
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  });
  
  const [aiMode, setAiMode] = useState(playbookSettings.aiMode || (playbookSettings.useGemini ? 'flash' : 'local'));
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(playbookSettings.customSystemPrompt || '');
  const [storePin, setStorePin] = useState(playbookSettings.storePin || '1234');

  const [prevStorePin, setPrevStorePin] = useState(playbookSettings.storePin);
  if (playbookSettings.storePin !== prevStorePin) {
    setPrevStorePin(playbookSettings.storePin);
    if (playbookSettings.storePin) {
      setStorePin(playbookSettings.storePin);
    }
  }
  
  const [selectedDept, setSelectedDept] = useState('Front End');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu size={32} color="var(--bby-blue)" /> Platform Configuration Center
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage core AI simulation behavior, configure leader profiles, manage metric targets, and adjust store offline sync settings.
          </p>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={() => {
            const nextMode = aiMode === 'local' ? 'local' : aiMode;
              onSaveSettings({
                apiKey: localApiKey,
                playbookSettings: {
                  ...playbookSettings,
                  aiMode: nextMode,
                  customSystemPrompt,
                  storePin
                }
              });
            alert('Settings saved globally! Changes will apply immediately.');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
        >
          <Check size={18} />
          Save Platform Config
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)', scrollbarWidth: 'none' }}>
        {[
          { id: 'engine', icon: <Key size={16} />, label: 'AI Strategy & Security' },
          { id: 'prompts', icon: <Sparkles size={16} />, label: 'System Prompts' },
          { id: 'supervisors', icon: <Users size={16} />, label: 'Leader Profiles & PINs' },
          { id: 'vocab', icon: <BookOpen size={16} />, label: 'BBY Dictionary' },
          { id: 'targets', icon: <Compass size={16} />, label: 'Metric Goals' },
          { id: 'scenarios', icon: <UserPlus size={16} />, label: 'Custom Coaching' },
          { id: 'sync', icon: <RefreshCw size={16} />, label: 'Database Sync' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem',
                fontSize: '0.85rem', boxShadow: 'none', whiteSpace: 'nowrap',
                background: isActive ? 'var(--bby-blue)' : 'transparent',
                borderColor: isActive ? 'transparent' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'engine' && (
        <AiEngineTab 
          aiMode={aiMode} setAiMode={setAiMode}
          localApiKey={localApiKey} setLocalApiKey={setLocalApiKey}
          playbookSettings={playbookSettings}
          storePin={storePin} setStorePin={setStorePin}
        />
      )}

      {activeTab === 'prompts' && (
        <SystemPromptsTab 
          customSystemPrompt={customSystemPrompt} 
          setCustomSystemPrompt={setCustomSystemPrompt} 
          playbookSettings={playbookSettings}
          onSaveSettings={onSaveSettings}
        />
      )}

      {activeTab === 'supervisors' && (
        <SupervisorProfilesTab 
          managers={managers}
          onSaveManagers={onSaveManagers}
          storePin={storePin}
          setStorePin={setStorePin}
        />
      )}

      {activeTab === 'vocab' && (
        <BbyVocabTab 
          playbookSettings={playbookSettings}
          setPlaybookSettings={onSaveSettings}
        />
      )}

      {activeTab === 'targets' && (
        <DepartmentTargetsTab 
          selectedDept={selectedDept} setSelectedDept={setSelectedDept}
          deptGoals={deptGoals} handleSaveDeptGoals={onSaveDeptGoals}
        />
      )}

      {activeTab === 'scenarios' && (
        <CustomScenariosTab 
          customScenarios={customScenarios}
          onAddCustomScenario={onAddCustomScenario}
          onDeleteCustomScenario={onDeleteCustomScenario}
        />
      )}

      {activeTab === 'sync' && (
        <SyncDiagnosticsTab 
          dbConnected={dbConnected}
          storeId={storeId}
          firebaseConfig={firebaseConfig}
          setFirebaseConfig={setFirebaseConfig}
          handleSaveFirebaseConfig={handleSaveFirebaseConfig}
          rosterHistory={rosterHistory}
          coachingLogs={coachingLogs}
          followUpTasks={followUpTasks}
          floorLeaderShifts={floorLeaderShifts}
        />
      )}

    </div>
  );
}
