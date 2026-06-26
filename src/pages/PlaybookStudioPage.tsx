import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass, Users, UserPlus, Edit2, Eye, EyeOff, Cpu, RefreshCw } from 'lucide-react';

import { useStore } from '../store/useStore';

import AiEngineTab from '../components/PlaybookStudio/AiEngineTab';
import SystemPromptsTab from '../components/PlaybookStudio/SystemPromptsTab';
import SupervisorProfilesTab from '../components/PlaybookStudio/SupervisorProfilesTab';
import BbyVocabTab from '../components/PlaybookStudio/BbyVocabTab';
import DepartmentTargetsTab from '../components/PlaybookStudio/DepartmentTargetsTab';
import SyncDiagnosticsTab from '../components/PlaybookStudio/SyncDiagnosticsTab';
import CustomScenariosTab from '../components/Playbook/CustomScenariosTab';

const EMPTY_OBJ = {};
const EMPTY_ARR: any[] = [];

export default function PlaybookStudio() {
  const playbookSettings = useStore(state => state.playbookSettings);
  
  if (!playbookSettings) {
    return (
      <div className="flex-center h-50vh text-secondary">
        <RefreshCw size={24} className="animate-spin mr-sm" /> Loading platform configuration...
      </div>
    );
  }

  return <PlaybookStudioContent playbookSettings={playbookSettings} />;
}

function PlaybookStudioContent({ playbookSettings }: { playbookSettings: any }) {
  const storeId = useStore((state) => state.storeId);
  const apiKey = useStore((state) => state.apiKey);
  const dbConnected = useStore((state) => state.dbConnected);
  const handleSaveFirebaseConfig = useStore((state) => state.handleSaveFirebaseConfig);
  
  const onSaveSettings = useStore(state => state.saveSettings);
  const deptGoals = useStore(state => state.deptGoals) || EMPTY_OBJ;
  const onSaveDeptGoals = useStore(state => state.saveDeptGoals);
  const customScenarios = useStore(state => state.customScenarios) || EMPTY_ARR;
  const onAddCustomScenario = useStore(state => state.importCustomScenario);
  const onDeleteCustomScenario = useStore(state => state.deleteCustomScenario);
  const managers = useStore(state => state.managers) || EMPTY_ARR;
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
    <div className="flex-column gap-2xl">
      <div className="flex-between align-start flex-wrap gap-md">
        <div>
          <h1 className="text-2-5rem mb-xs flex-center justify-start gap-sm m-0">
            <Cpu size={32} color="var(--bby-blue)" /> Platform Configuration Center
          </h1>
          <p className="text-secondary m-0">
            Manage core AI simulation behavior, configure leader profiles, manage metric targets, and adjust store offline sync settings.
          </p>
        </div>
        
        <button 
          className="btn btn-primary flex-center gap-sm px-md-lg py-sm font-bold" 
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
        >
          <Check size={18} />
          Save Platform Config
        </button>
      </div>

      <div className="flex gap-xs overflow-x-auto pb-sm border-b-glass scrollbar-none">
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
              data-testid={`tab-${tab.id}`}
              className={`btn flex-center gap-sm px-md py-sm text-sm whitespace-nowrap shadow-none border-transparent ${isActive ? 'bg-bby-blue text-white' : 'bg-transparent text-secondary hover-opacity-80'}`}
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
        />
      )}

      {activeTab === 'prompts' && (
        <SystemPromptsTab />
      )}

      {activeTab === 'supervisors' && (
        <SupervisorProfilesTab />
      )}

      {activeTab === 'vocab' && (
        <BbyVocabTab />
      )}

      {activeTab === 'targets' && (
        <DepartmentTargetsTab />
      )}

      {activeTab === 'scenarios' && (
        <CustomScenariosTab />
      )}

      {activeTab === 'sync' && (
        <SyncDiagnosticsTab />
      )}

    </div>
  );
}
