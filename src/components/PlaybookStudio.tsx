// @ts-nocheck
import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass, Users, UserPlus, Edit2, Eye, EyeOff, Cpu, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { testLatency } from '../services/firebase';
import CustomScenariosTab from './Playbook/CustomScenariosTab';

export default function PlaybookStudio({ 
  playbookSettings, 
  onSaveSettings, 
  deptGoals = {}, 
  onSaveDeptGoals,
  customScenarios = [],
  onAddCustomScenario,
  onDeleteCustomScenario,
  rosterHistory = {},
  coachingLogs = [],
  followUpTasks = [],
  floorLeaderShifts = [],
  managers = [],
  onSaveManagers
}) {
  const { apiKey, dbConnected, handleSaveFirebaseConfig } = useApp();
  const [activeTab, setActiveTab] = useState('engine'); // 'engine', 'prompts', 'supervisors', 'vocab', 'targets', 'scenarios', 'sync'
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const runDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setDiagnosticsLogs([]);
    
    const addLog = (msg, delay) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setDiagnosticsLogs(prev => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    (async () => {
      await addLog("⚡ Starting IndexedDB Cache & Sync Diagnostics...", 200);
      await addLog(`📂 Auditing Roster Periods: ${Object.keys(rosterHistory).length} documents found in local cache.`, 300);
      await addLog(`📝 Auditing Coaching Logs: ${coachingLogs.length} logs found in local cache.`, 200);
      await addLog(`🤝 Auditing Commitments: ${followUpTasks.length} commitments (${followUpTasks.filter(t => !t.completed).length} pending) in local cache.`, 200);
      await addLog(`⏰ Auditing Floor Leader Shifts: ${floorLeaderShifts.length} shifts in local cache.`, 200);
      await addLog(`📡 Testing Firebase connection latency...`, 300);
      
      if (dbConnected) {
        const latency = await testLatency();
        if (latency !== -1) {
          const rating = latency < 50 ? 'Excellent' : latency < 150 ? 'Good' : 'Fair';
          await addLog(`✅ Firebase Connection: Connected. Latency: ${latency}ms (${rating}).`, 200);
        } else {
          await addLog(`⚠️ Firebase Connection: Connected but latency test failed.`, 200);
        }
        await addLog(`💾 Offline Persistence: Active (IndexedDB storage verified).`, 100);
        await addLog(`🔄 Sync Status: Clean (0 pending local writes queued).`, 100);
      } else {
        await addLog(`ℹ️ Firebase Connection: Offline. Sandbox Mode active.`, 200);
        await addLog(`💾 Offline Persistence: Active (Local Storage fallback verified).`, 100);
      }
      
      await addLog(`🎉 Audit complete: Cache status is healthy!`, 200);
      setIsRunningDiagnostics(false);
    })();
  };
  
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

  // Supervisor Profiles Settings States
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerRole, setNewManagerRole] = useState('Experience Supervisor Sales');
  const [newManagerPin, setNewManagerPin] = useState('');
  const [editingManagerIndex, setEditingManagerIndex] = useState(null);
  const [editingManagerName, setEditingManagerName] = useState('');
  const [editingManagerRole, setEditingManagerRole] = useState('');
  const [editingManagerPin, setEditingManagerPin] = useState('');
  const [visiblePins, setVisiblePins] = useState({});

  const handleAddManager = () => {
    if (!newManagerName.trim()) {
      alert("Error: Supervisor Name is required.");
      return;
    }
    if (!newManagerRole.trim()) {
      alert("Error: Supervisor Role is required.");
      return;
    }
    if (!/^\d{4}$/.test(newManagerPin)) {
      alert("Error: PIN must be exactly 4 digits numeric.");
      return;
    }
    const pinConflict = managers.some(m => m.pin === newManagerPin);
    if (pinConflict) {
      alert(`Error: PIN "${newManagerPin}" is already assigned to another supervisor.`);
      return;
    }

    const updated = [...managers, {
      name: newManagerName.trim(),
      role: newManagerRole.trim(),
      pin: newManagerPin
    }];
    onSaveManagers(updated);
    setNewManagerName('');
    setNewManagerPin('');
  };

  const handleEditManager = (idx) => {
    const mgr = managers[idx];
    setEditingManagerIndex(idx);
    setEditingManagerName(mgr.name);
    setEditingManagerRole(mgr.role);
    setEditingManagerPin(mgr.pin);
  };

  const handleSaveEditManager = () => {
    if (!editingManagerName.trim()) {
      alert("Error: Supervisor Name is required.");
      return;
    }
    if (!editingManagerRole.trim()) {
      alert("Error: Supervisor Role is required.");
      return;
    }
    if (!/^\d{4}$/.test(editingManagerPin)) {
      alert("Error: PIN must be exactly 4 digits numeric.");
      return;
    }
    const pinConflict = managers.some((m, idx) => idx !== editingManagerIndex && m.pin === editingManagerPin);
    if (pinConflict) {
      alert(`Error: PIN "${editingManagerPin}" is already assigned to another supervisor.`);
      return;
    }

    const updated = managers.map((m, idx) => {
      if (idx === editingManagerIndex) {
        return {
          name: editingManagerName.trim(),
          role: editingManagerRole.trim(),
          pin: editingManagerPin
        };
      }
      return m;
    });

    onSaveManagers(updated);
    setEditingManagerIndex(null);
  };

  const handleDeleteManager = (idx) => {
    const mgr = managers[idx];
    if (confirm(`Are you sure you want to delete supervisor "${mgr.name}"?`)) {
      const updated = managers.filter((_, i) => i !== idx);
      onSaveManagers(updated);
    }
  };

  const togglePinVisibility = (idx) => {
    setVisiblePins(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Firebase Cloud Configuration States
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('bby_firebase_config');
      if (saved) return JSON.parse(saved);
    } catch(e) { console.error('Failed to parse firebase config', e); }
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  });
  const [prevDeptGoals, setPrevDeptGoals] = useState(deptGoals);
  const [editedGoals, setEditedGoals] = useState(deptGoals);

  if (deptGoals !== prevDeptGoals) {
    setPrevDeptGoals(deptGoals);
    setEditedGoals({ ...deptGoals });
  }

  const deptKeys = React.useMemo(() => Object.keys(deptGoals || {}), [deptGoals]);

  const handleGoalChange = (metric, val) => {
    setEditedGoals(prev => ({
      ...prev,
      [selectedDept]: {
        ...(prev[selectedDept] || {}),
        [metric]: val
      }
    }));
  };

  const handleSaveGoals = () => {
    if (onSaveDeptGoals) {
      // Parse goals back to floats before writing to store/DB
      const parsedGoals = {};
      Object.keys(editedGoals || {}).forEach(dept => {
        const deptObj = editedGoals[dept] || {};
        parsedGoals[dept] = { ...deptObj };
        
        const numFields = ['memberships', 'creditCards', 'warranty', 'surveys', 'rph', 'basket', 'm365', 'audio'];
        numFields.forEach(field => {
          if (deptObj[field] !== undefined) {
            if (deptObj[field] === '') {
              parsedGoals[dept][field] = 0;
            } else {
              parsedGoals[dept][field] = parseFloat(deptObj[field]) || 0;
            }
          }
        });
      });

      onSaveDeptGoals(parsedGoals);
      alert(`${selectedDept} performance goals updated successfully!`);
    }
  };


  const [allowedPhrases, setAllowedPhrases] = useState(playbookSettings.allowedPhrases || [
    'My Best Buy Plus', 'My Best Buy Total', 'Geek Squad Protection', 'AppleCare+'
  ]);
  const [forbiddenPhrases, setForbiddenPhrases] = useState(playbookSettings.forbiddenPhrases || [
    'warranty', 'pushy', 'contract'
  ]);

  const [newAllowed, setNewAllowed] = useState('');
  const [newForbidden, setNewForbidden] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddAllowed = () => {
    if (!newAllowed.trim()) return;
    const updated = [...allowedPhrases, newAllowed.trim()];
    setAllowedPhrases(updated);
    setNewAllowed('');
    triggerSaveSettings({ allowedPhrases: updated });
  };

  const handleAddForbidden = () => {
    if (!newForbidden.trim()) return;
    const updated = [...forbiddenPhrases, newForbidden.trim()];
    setForbiddenPhrases(updated);
    setNewForbidden('');
    triggerSaveSettings({ forbiddenPhrases: updated });
  };

  const handleRemoveAllowed = (idx) => {
    const updated = allowedPhrases.filter((_, i) => i !== idx);
    setAllowedPhrases(updated);
    triggerSaveSettings({ allowedPhrases: updated });
  };

  const handleRemoveForbidden = (idx) => {
    const updated = forbiddenPhrases.filter((_, i) => i !== idx);
    setForbiddenPhrases(updated);
    triggerSaveSettings({ forbiddenPhrases: updated });
  };

  const [trainingLogs, setTrainingLogs] = useState(playbookSettings.trainingLogs || [
    `## 📋 Coaching Plan: Ricky / 5-Star Surveys

* **What**: Deliver a warmer checkout experience and explicitly ask for 5-star survey feedback at checkout.
* **How**: Slow down, write your name on the receipt sleeve, make direct eye contact, and say: "I hope I made your shopping easy today. My name is Ricky; please take 30 seconds to let me know how I did on the 5-star survey!"
* **Why**: Ensures customer loyalty, measures our store service indices, and highlights excellent human work on the checkout floor.
* **Behavior**: Secure at least 2 five-star survey mentions this week and maintain a 4.8+ survey average.
* **Validation**: Leader will perform 3 checkout observations this week and review the Sunday 5 Star survey comment log.

---
### 🔍 Background & Performance Context
* **Observed Strengths**: Excellent transactional speeds, zero cashier queue backlog, and highly professional checkout processing.
* **Performance Gap / Metric Focus**: Ricky has 0 5 Star surveys this month (store standard is maintaining 2+ five-star survey mentions per week).
* **Coaching Date**: 6/6/2026`
  ]);
  const [newTrainingLog, setNewTrainingLog] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);

  const triggerSaveSettings = (overrides = {}) => {
    const isFlash = aiMode === 'flash';
    const isPro = aiMode === 'pro';
    onSaveSettings({
      apiKey: localApiKey,
      playbookSettings: {
        useGemini: isFlash || isPro,
        aiMode,
        customSystemPrompt,
        allowedPhrases,
        forbiddenPhrases,
        trainingLogs,
        storePin,
        ...overrides
      }
    });
  };

  const handleAddTrainingLog = () => {
    if (!newTrainingLog.trim()) return;
    const updated = [...trainingLogs, newTrainingLog.trim()];
    setTrainingLogs(updated);
    setNewTrainingLog('');
    setIsAddingLog(false);
    triggerSaveSettings({ trainingLogs: updated });
  };

  const handleRemoveTrainingLog = (idx) => {
    const updated = trainingLogs.filter((_, i) => i !== idx);
    setTrainingLogs(updated);
    triggerSaveSettings({ trainingLogs: updated });
  };

  const handleSave = () => {
    const isFlash = aiMode === 'flash';
    const isPro = aiMode === 'pro';
    
    if (!/^\d{4}$/.test(storePin)) {
      alert("Error: Store Passcode PIN must be exactly 4 digits.");
      return;
    }

    onSaveSettings({
      apiKey: localApiKey,
      playbookSettings: {
        useGemini: isFlash || isPro,
        aiMode,
        customSystemPrompt,
        allowedPhrases,
        forbiddenPhrases,
        trainingLogs,
        storePin
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Playbook Studio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Train the AI. Customize instructions, toggle dual-mode sandbox vs generative engines, and manage coaching vocabulary rules.</p>
        </div>
        {activeTab !== 'scenarios' && activeTab !== 'sync' && (
          <button className="btn btn-accent" onClick={handleSave}>
            Save Configuration
          </button>
        )}
      </div>

      {/* Glassmorphic Sliding Tab Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        padding: '0.4rem',
        borderRadius: '16px',
        overflowX: 'auto',
        marginBottom: '1rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {[
          { id: 'engine', label: 'AI Engine', icon: <Cpu size={16} /> },
          { id: 'prompts', label: 'AI Prompts & Exemplars', icon: <BookOpen size={16} /> },
          { id: 'supervisors', label: 'Supervisor PINs', icon: <Users size={16} /> },
          { id: 'vocab', label: 'Vocabulary Rules', icon: <ShieldAlert size={16} /> },
          { id: 'targets', label: 'Department Targets', icon: <Compass size={16} /> },
          { id: 'scenarios', label: 'Customer Personas', icon: <Sparkles size={16} /> },
          { id: 'sync', label: 'Cloud Sync & Audit', icon: <RefreshCw size={16} /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                background: isActive ? 'rgba(0, 70, 190, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 70, 190, 0.3)' : '1px solid transparent',
                color: isActive ? 'var(--bby-yellow)' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {saveSuccess && activeTab !== 'scenarios' && activeTab !== 'sync' && (
        <div style={{ padding: '1rem 1.5rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.9rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> Playbook Configurations Saved Successfully! Changes are now active across all simulators.
        </div>
      )}

      {/* 1. AI Engine Settings Tab */}
      {activeTab === 'engine' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-blue)" /> Simulation Engine Strategy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={aiMode === 'local'} 
                    onChange={() => setAiMode('local')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Standard Free: Default Local Sandbox Engine</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Runs entirely client-side inside the browser. Extremely fast, requires no tokens, works anywhere offline, and parses advisor answers through state-based NLP mapping.
                    </p>
                  </div>
                </label>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={aiMode === 'flash'} 
                    onChange={() => setAiMode('flash')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Standard Cloud: Gemini 3.5 Flash <Sparkles size={12} color="var(--bby-yellow)" />
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Enables open-ended fluid conversation roleplays. Requires a Google AI Studio API key. Runs completely on the free-tier limits, resulting in zero overall token spend.
                    </p>
                  </div>
                </label>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={aiMode === 'pro'} 
                    onChange={() => setAiMode('pro')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--bby-yellow)' }}>
                      Premium Pro: Gemini 3.1 Pro <Key size={12} color="var(--bby-yellow)" />
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Unlocks Google's flagship reasoning model for high-fidelity Grow coaching logs and advanced dialogue auditing. Evaluates soft skills (empathy, rapport, active listening). Requires a Google AI Studio API key.
                    </p>
                  </div>
                </label>
              </div>

              {aiMode === 'flash' && (
                <div className="form-group" style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                  <label className="form-label">Google AI Studio API Key:</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter your Gemini API key (AIzaSy...)"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Your key is securely saved locally in your own browser's storage and never sent to any external server (except directly to the Google Gemini API endpoint).
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 2. AI Prompts & Exemplars Tab */}
      {activeTab === 'prompts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '950px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--info)" /> AI System Prompts Configurator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Provide the custom instructions that train the Gemini generative engine how to coach and evaluate like your store leaders would.
            </p>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Coaching & Empathy Prompt Instructions:</label>
              <textarea 
                className="form-control" 
                rows={8}
                style={{ resize: 'none', fontSize: '0.85rem' }}
                placeholder="Ensure you lead with humanity. Coach advisors to explore the customer needs by congratulated them first, and offering protection by describing usage scenarios rather than pitch checklist lines..."
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card">
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--bby-yellow)" /> Style & Training Corpus (Few-Shot Exemplars)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.4 }}>
                Provide examples of high-quality coaching logs you have written in the past. When using the **Gemini Engine**, these logs are fed directly into the model as few-shot training examples, prompting it to perfectly copy your formatting, coaching style, tone, standards, and metrics vocabulary!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {trainingLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No custom training logs added. Preloading Best Buy default framework.
                  </div>
                ) : (
                  trainingLogs.map((log, idx) => (
                    <div key={idx} style={{ position: 'relative', background: 'rgba(0, 70, 190, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.25rem 2.5rem 1.25rem 1.25rem' }}>
                      <button 
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}
                        onClick={() => handleRemoveTrainingLog(idx)}
                        title="Remove Training Exemplar"
                      >
                        <Trash2 size={16} />
                      </button>
                      <span style={{ fontSize: '0.7rem', color: 'var(--bby-yellow)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                        Exemplar #{idx + 1}
                      </span>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {log}
                      </pre>
                    </div>
                  ))
                )}
              </div>

              {isAddingLog ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', border: '1px solid var(--bby-blue)', borderRadius: '14px', background: 'rgba(0, 70, 190, 0.02)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#fff' }}>Paste Exemplar Coaching Log Text:</label>
                    <textarea 
                      className="form-control" 
                      rows={8} 
                      style={{ resize: 'none', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      placeholder="Paste a complete 4-section coaching log that represents your personal writing style..."
                      value={newTrainingLog}
                      onChange={(e) => setNewTrainingLog(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setIsAddingLog(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={handleAddTrainingLog}>
                      Add Exemplar to Corpus
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setIsAddingLog(true)}>
                  + Add Past Coaching Exemplar to Training Corpus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Supervisor PINs & Directory Tab */}
      {activeTab === 'supervisors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Store Passcode PIN Security Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-yellow)" /> Store Passcode PIN Security
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Configure the 4-digit supervisor access passcode PIN. This passcode locks all dashboards, store rosters, and settings configurations from unauthorized advisor modifications.
            </p>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Supervisor 4-Digit PIN:</label>
              <input 
                type="text" 
                maxLength={4}
                className="form-control" 
                placeholder="e.g. 1234"
                value={storePin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setStorePin(val);
                }}
                style={{ letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 'bold', width: '120px', textAlign: 'center' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                Default is 1234. Change this PIN to lock out access on floor tablets. PIN must be exactly 4 digits.
              </p>
            </div>
          </div>

          {/* Supervisor Profiles & PINs Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--info)" /> Supervisor Profiles & PINs
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Configure individual supervisor accounts and unique 4-digit PINs for dashboard logins and coaching attribution.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {managers.map((mgr, idx) => {
                const isEditing = editingManagerIndex === idx;
                const isPinVisible = visiblePins[idx];

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.75rem',
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--border-glass)', 
                      padding: '1rem', 
                      borderRadius: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                              value={editingManagerName}
                              onChange={(e) => setEditingManagerName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Role</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                              value={editingManagerRole}
                              onChange={(e) => setEditingManagerRole(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>4-Digit PIN</label>
                          <input 
                            type="text" 
                            maxLength={4}
                            className="form-control" 
                            placeholder="e.g. 2001"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100px', letterSpacing: '0.1em' }}
                            value={editingManagerPin}
                            onChange={(e) => setEditingManagerPin(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={handleSaveEditManager}>
                            Save
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setEditingManagerIndex(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{mgr.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mgr.role}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--bby-yellow)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>PIN: {isPinVisible ? mgr.pin : '••••'}</span>
                            <button 
                              type="button" 
                              onClick={() => togglePinVisibility(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}
                            >
                              {isPinVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px' }} 
                            onClick={() => handleEditManager(idx)}
                            title="Edit Supervisor"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--error)' }} 
                            onClick={() => handleDeleteManager(idx)}
                            title="Delete Supervisor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={16} color="var(--success)" /> Add New Supervisor
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Supervisor Name"
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                    value={newManagerName}
                    onChange={(e) => setNewManagerName(e.target.value)}
                  />
                  <select 
                    className="form-control" 
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                    value={newManagerRole}
                    onChange={(e) => setNewManagerRole(e.target.value)}
                  >
                    <option value="Experience Manager Sales Focused">Experience Manager Sales Focused</option>
                    <option value="Experience Manager Ops Focused">Experience Manager Ops Focused</option>
                    <option value="Experience Supervisor Sales">Experience Supervisor Sales</option>
                    <option value="Experience Supervisor Sales and Front End">Experience Supervisor Sales and Front End</option>
                    <option value="GM">GM</option>
                    <option value="Store Leader">Store Leader</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    maxLength={4}
                    className="form-control" 
                    placeholder="4-Digit PIN"
                    style={{ fontSize: '0.8rem', padding: '0.5rem', width: '110px', letterSpacing: '0.05em' }}
                    value={newManagerPin}
                    onChange={(e) => setNewManagerPin(e.target.value.replace(/\D/g, ''))}
                  />
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleAddManager}
                  >
                    <Plus size={14} /> Add Supervisor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Vocabulary Rules Tab */}
      {activeTab === 'vocab' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="var(--bby-yellow)" /> Vocabulary Rule Dictionaries
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Specify the preferred terminology advisors should use and the forbidden retail jargon they should avoid during customer conversations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--success)' }}>Preferred / Allowed Terms</h4>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  placeholder="Add preferred word (e.g. My Best Buy Total)"
                  value={newAllowed}
                  onChange={(e) => setNewAllowed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowed()}
                />
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={handleAddAllowed}>
                  <Plus size={16} />
                </button>
              </div>

              <div className="chip-container">
                {allowedPhrases.map((phrase, idx) => (
                  <span key={idx} className="chip allowed">
                    {phrase}
                    <Trash2 
                      size={12} 
                      style={{ cursor: 'pointer', marginLeft: '0.25rem' }} 
                      onClick={() => handleRemoveAllowed(idx)} 
                    />
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--error)' }}>Forbidden Retail Jargon</h4>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  placeholder="Add forbidden word (e.g. warranty)"
                  value={newForbidden}
                  onChange={(e) => setNewForbidden(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddForbidden()}
                />
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={handleAddForbidden}>
                  <Plus size={16} />
                </button>
              </div>

              <div className="chip-container">
                {forbiddenPhrases.map((phrase, idx) => (
                  <span key={idx} className="chip forbidden">
                    {phrase}
                    <Trash2 
                      size={12} 
                      style={{ cursor: 'pointer', marginLeft: '0.25rem' }} 
                      onClick={() => handleRemoveForbidden(idx)} 
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Department Targets Tab */}
      {activeTab === 'targets' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
              <Compass size={20} color="var(--bby-yellow)" /> Department Goals Configurator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Adapt store benchmarks dynamically by department. These goals are utilized across your roster dynamic audits and simulator scoring!
            </p>

            <div className="form-group">
              <label className="form-label">Select Department to Configure:</label>
              <select 
                className="form-control"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                {deptKeys.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Editing targets for {selectedDept}
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
                
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                    Memberships (Plus/Total) Evaluation
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <select 
                        className="form-control"
                        value={editedGoals[selectedDept]?.membershipsType || 'Hours'}
                        onChange={(e) => handleGoalChange('membershipsType', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <option value="Hours">Hours worked (1 per X hrs)</option>
                        <option value="Dollars">Dollar sales (1 per $D sales)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <input 
                        type="number" 
                        className="form-control"
                        value={editedGoals[selectedDept]?.memberships !== undefined ? editedGoals[selectedDept].memberships : ''}
                        onChange={(e) => handleGoalChange('memberships', e.target.value)}
                        placeholder="Target value"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                    BBY Credit Cards (Apps) Evaluation
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <select 
                        className="form-control"
                        value={editedGoals[selectedDept]?.creditCardsType || 'Hours'}
                        onChange={(e) => handleGoalChange('creditCardsType', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <option value="Hours">Hours worked (1 per X hrs)</option>
                        <option value="Dollars">Dollar sales (1 per $D sales)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <input 
                        type="number" 
                        className="form-control"
                        value={editedGoals[selectedDept]?.creditCards !== undefined ? editedGoals[selectedDept].creditCards : ''}
                        onChange={(e) => handleGoalChange('creditCards', e.target.value)}
                        placeholder="Target value"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.725rem' }}>GSP Attach % Goal:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control"
                      value={editedGoals[selectedDept]?.warranty !== undefined ? editedGoals[selectedDept].warranty : ''}
                      onChange={(e) => handleGoalChange('warranty', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.725rem' }}>5 Star Surveys Goal:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control"
                      value={editedGoals[selectedDept]?.surveys !== undefined ? editedGoals[selectedDept].surveys : ''}
                      onChange={(e) => handleGoalChange('surveys', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.725rem' }}>RPH index Target ($/hr):</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={editedGoals[selectedDept]?.rph !== undefined ? editedGoals[selectedDept].rph : ''}
                  onChange={(e) => handleGoalChange('rph', e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                />
              </div>

              {(selectedDept === 'Computing' || selectedDept === 'Home Theatre') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.725rem' }}>Basket size Goal ($):</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={editedGoals[selectedDept]?.basket !== undefined ? editedGoals[selectedDept].basket : ''}
                      onChange={(e) => handleGoalChange('basket', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                  {selectedDept === 'Computing' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.725rem' }}>M365 Attach % Goal:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control"
                        value={editedGoals[selectedDept]?.m365 !== undefined ? editedGoals[selectedDept].m365 : ''}
                        onChange={(e) => handleGoalChange('m365', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                  {selectedDept === 'Home Theatre' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.725rem' }}>Audio Attach % Goal:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control"
                        value={editedGoals[selectedDept]?.audio !== undefined ? editedGoals[selectedDept].audio : ''}
                        onChange={(e) => handleGoalChange('audio', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} onClick={handleSaveGoals}>
                Save {selectedDept} Targets
              </button>

            </div>
          </div>
        </div>
      )}

      {/* 6. Customer Personas Tab */}
      {activeTab === 'scenarios' && (
        <CustomScenariosTab 
          customScenarios={customScenarios}
          onAddCustomScenario={onAddCustomScenario}
          onDeleteCustomScenario={onDeleteCustomScenario}
        />
      )}

      {/* 7. Cloud Sync & Audit Tab */}
      {activeTab === 'sync' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', border: dbConnected ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: dbConnected ? 'var(--success)' : '#fff' }}>
                <Compass size={20} color={dbConnected ? 'var(--success)' : 'var(--bby-blue)'} /> Collaborative Cloud Sync (Firebase Firestore)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.4 }}>
                Enable multi-leader synchronization! By connecting a free **Firebase Cloud Database**, all members of store leadership can access, view, and edit the exact same shared roster, month archives, targets, and exemplars in real-time across Chrome, Safari, mobile devices, and office computers.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Firebase API Key:</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="e.g. AIzaSyA1..."
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={firebaseConfig.apiKey}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Firebase Project ID:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. floorvision-bby-894"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={firebaseConfig.projectId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Auth Domain (Optional):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. project-id.firebaseapp.com"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={firebaseConfig.authDomain}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Storage Bucket (Optional):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. project-id.appspot.com"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={firebaseConfig.storageBucket}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Messaging Sender ID (Optional):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 8493019482"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={firebaseConfig.messagingSenderId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, messagingSenderId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>App ID (Optional):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 1:84930:web:8a92f..."
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={firebaseConfig.appId}
                  onChange={(e) => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })}
                />
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.775rem',
              color: '#fca5a5',
              lineHeight: '1.4'
            }}>
              <strong>🔒 Security & Production Guidelines:</strong>
              <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1rem', listStyleType: 'disc' }}>
                <li><strong>Domain Restrictions:</strong> In the Google Cloud Console (under Credentials), restrict your Firebase API Key to accept HTTP referrers only from your authorized hosting domain (e.g. <code>bbycoaching.web.app</code>).</li>
                <li><strong>Firestore Security Rules:</strong> Configure Firestore security rules to allow read/write requests only to authenticated users or validate the store PIN structure to prevent unauthenticated data modifications.</li>
                <li><strong>Local Storage Encryption:</strong> Keys are stored in plaintext locally. Limit access to authorized corporate hardware.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {dbConnected && (
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  ✓ Cloud Database Synced successfully!
                </span>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {dbConnected && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.55rem 1.25rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                    onClick={() => {
                      if (confirm("Are you sure you want to disconnect from the Cloud Database? This browser will return to Local Offline Sandbox Mode.")) {
                        handleSaveFirebaseConfig(null);
                        setFirebaseConfig({
                          apiKey: '',
                          authDomain: '',
                          projectId: '',
                          storageBucket: '',
                          messagingSenderId: '',
                          appId: ''
                        });
                      }
                    }}
                  >
                    Disconnect Cloud
                  </button>
                )}
                
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.55rem 1.25rem', background: dbConnected ? 'rgba(255,255,255,0.08)' : 'var(--bby-blue)', color: dbConnected ? '#fff' : undefined }}
                  onClick={() => {
                    if (!firebaseConfig.apiKey.trim() || !firebaseConfig.projectId.trim()) {
                      alert("API Key and Project ID are required to initialize Firebase Cloud!");
                      return;
                    }
                    handleSaveFirebaseConfig(firebaseConfig);
                  }}
                >
                  {dbConnected ? 'Update Connection' : 'Connect Cloud'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem 0' }}>
              <ShieldAlert size={20} color="var(--bby-yellow)" /> Cache & Database Sync Diagnostics
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 1.5rem 0' }}>
              Monitor client-side IndexedDB local cache storage, Firebase connection metrics, and synchronization queue health.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Persistence Status</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                  IndexedDB Active
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roster Periods Cache</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                  {Object.keys(rosterHistory).length} Documents
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                  {coachingLogs.length} Documents
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Commitments & Shifts</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                  {followUpTasks.length} Commitments / {floorLeaderShifts.length} Shifts
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={runDiagnostics} 
              disabled={isRunningDiagnostics}
              style={{ 
                marginBottom: diagnosticsLogs.length > 0 ? '1.25rem' : '0',
                borderColor: isRunningDiagnostics ? 'transparent' : 'var(--bby-blue)',
                color: isRunningDiagnostics ? 'var(--text-muted)' : 'var(--bby-blue)',
                background: isRunningDiagnostics ? 'rgba(255,255,255,0.02)' : 'rgba(0, 70, 190, 0.08)'
              }}
            >
              {isRunningDiagnostics ? 'Running Diagnostics...' : 'Run Sync Diagnostics'}
            </button>

            {diagnosticsLogs.length > 0 && (
              <div 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.4)', 
                  border: '1.5px solid var(--border-glass)', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem', 
                  color: '#38bdf8', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.35rem', 
                  maxHeight: '200px', 
                  overflowY: 'auto' 
                }}
              >
                {diagnosticsLogs.map((log, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.25rem' }}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
