import React, { createContext, useContext, useState } from 'react';

interface PlaybookContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  diagnosticsLogs: any[];
  setDiagnosticsLogs: (logs: any[]) => void;
  isRunningDiagnostics: boolean;
  setIsRunningDiagnostics: (running: boolean) => void;
  aiMode: string;
  setAiMode: (mode: string) => void;
  localApiKey: string;
  setLocalApiKey: (key: string) => void;
  customSystemPrompt: string;
  setCustomSystemPrompt: (prompt: string) => void;
  storePin: string;
  setStorePin: (pin: string) => void;
  prevStorePin: string;
  setPrevStorePin: (pin: string) => void;
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  
  newManagerName: string;
  setNewManagerName: (name: string) => void;
  newManagerRole: string;
  setNewManagerRole: (role: string) => void;
  newManagerPin: string;
  setNewManagerPin: (pin: string) => void;
  
  editingManagerIndex: number | null;
  setEditingManagerIndex: (index: number | null) => void;
  editingManagerName: string;
  setEditingManagerName: (name: string) => void;
  editingManagerRole: string;
  setEditingManagerRole: (role: string) => void;
  editingManagerPin: string;
  setEditingManagerPin: (pin: string) => void;
  visiblePins: Record<string, boolean>;
  setVisiblePins: (pins: Record<string, boolean>) => void;
}

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined);

export function PlaybookProvider({ children, initialSettings, initialApiKey }: { children: React.ReactNode, initialSettings?: any, initialApiKey?: string }) {
  const settings = initialSettings || {};
  const [activeTab, setActiveTab] = useState('engine');
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<any[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [aiMode, setAiMode] = useState(settings.aiMode || (settings.useGemini ? 'flash' : 'local'));
  const [localApiKey, setLocalApiKey] = useState(initialApiKey || '');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(settings.customSystemPrompt || '');
  const [storePin, setStorePin] = useState(settings.storePin || '1234');
  const [prevStorePin, setPrevStorePin] = useState(settings.storePin);
  const [selectedDept, setSelectedDept] = useState('Front End');
  
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerRole, setNewManagerRole] = useState('Experience Supervisor Sales');
  const [newManagerPin, setNewManagerPin] = useState('');
  
  const [editingManagerIndex, setEditingManagerIndex] = useState<number | null>(null);
  const [editingManagerName, setEditingManagerName] = useState('');
  const [editingManagerRole, setEditingManagerRole] = useState('');
  const [editingManagerPin, setEditingManagerPin] = useState('');
  const [visiblePins, setVisiblePins] = useState({});

  return (
    <PlaybookContext.Provider value={{
      activeTab, setActiveTab,
      diagnosticsLogs, setDiagnosticsLogs,
      isRunningDiagnostics, setIsRunningDiagnostics,
      aiMode, setAiMode,
      localApiKey, setLocalApiKey,
      customSystemPrompt, setCustomSystemPrompt,
      storePin, setStorePin,
      prevStorePin, setPrevStorePin,
      selectedDept, setSelectedDept,
      newManagerName, setNewManagerName,
      newManagerRole, setNewManagerRole,
      newManagerPin, setNewManagerPin,
      editingManagerIndex, setEditingManagerIndex,
      editingManagerName, setEditingManagerName,
      editingManagerRole, setEditingManagerRole,
      editingManagerPin, setEditingManagerPin,
      visiblePins, setVisiblePins
    }}>
      {children}
    </PlaybookContext.Provider>
  );
}

export function usePlaybook() {
  const context = useContext(PlaybookContext);
  if (!context) {
    throw new Error('usePlaybook must be used within a PlaybookProvider');
  }
  return context;
}
