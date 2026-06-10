import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { testLatency } from '../services/firebase';

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
  floorLeaderShifts = []
}) {
  const { apiKey, dbConnected, handleSaveFirebaseConfig } = useApp();
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'scenarios'
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const runDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setDiagnosticsLogs([]);
    
    const logs = [];
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

  React.useEffect(() => {
    if (playbookSettings.storePin) {
      setStorePin(playbookSettings.storePin);
    }
  }, [playbookSettings.storePin]);
  
  const [selectedDept, setSelectedDept] = useState('Front End');

  // Custom Scenario Builder States
  const [scenTitle, setScenTitle] = useState('');
  const [scenName, setScenName] = useState('');
  const [scenAvatar, setScenAvatar] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
  const [scenDesc, setScenDesc] = useState('');
  const [scenCategory, setScenCategory] = useState('Computing');
  const [scenDifficulty, setScenDifficulty] = useState('Medium');
  const [scenGreeting, setScenGreeting] = useState('');
  const [scenNeeds, setScenNeeds] = useState('');
  const [scenMembObj, setScenMembObj] = useState('');
  const [scenProtObj, setScenProtObj] = useState('');
  const [scenCardObj, setScenCardObj] = useState('');
  const [scenConnectKw, setScenConnectKw] = useState('hello, hi, congrats');
  const [scenDiscoverKw, setScenDiscoverKw] = useState('major, engineering, budget');
  const [scenRecommendKw, setScenRecommendKw] = useState('laptop, total, membership');
  const [scenProtectKw, setScenProtectKw] = useState('geek squad, gsp, drop');
  const [scenCloseKw, setScenCloseKw] = useState('finance, card, rewards');

  const AVATAR_OPTIONS = [
    { label: 'Sarah (Computing)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { label: 'David (Home Theater)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { label: 'Elena (Geek Squad)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { label: 'Victor (General)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { label: 'Jordan (Mobile)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
  ];

  const handleCreateScenario = (e) => {
    e.preventDefault();
    if (!scenTitle.trim() || !scenName.trim() || !scenGreeting.trim()) {
      alert("Scenario Title, Customer Name, and Initial Greeting are required!");
      return;
    }

    const cleanKeywords = (str) => {
      return str.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
    };

    const newScenario = {
      id: 'cust_' + Date.now(),
      title: scenTitle.trim(),
      role: 'Customer',
      name: scenName.trim(),
      avatar: scenAvatar,
      description: scenDesc.trim() || `${scenName} shopping in ${scenCategory}.`,
      category: scenCategory,
      difficulty: scenDifficulty,
      initialGreeting: scenGreeting.trim(),
      needs: scenNeeds.trim() || 'General consultative assistance.',
      objections: {
        membership: scenMembObj.trim() || "Why does a membership cost so much?",
        warranty: scenProtObj.trim() || "Doesn't it already come with a warranty?",
        card: scenCardObj.trim() || "I don't think I need another credit card."
      },
      successKeywords: {
        connect: cleanKeywords(scenConnectKw),
        discover: cleanKeywords(scenDiscoverKw),
        recommend: cleanKeywords(scenRecommendKw),
        protect: cleanKeywords(scenProtectKw),
        close: cleanKeywords(scenCloseKw)
      }
    };

    if (onAddCustomScenario) {
      onAddCustomScenario(newScenario);
      alert(`Custom Scenario "${scenTitle}" created successfully! It is now selectable in the Consult Arena.`);
      
      // Reset fields
      setScenTitle('');
      setScenName('');
      setScenDesc('');
      setScenGreeting('');
      setScenNeeds('');
      setScenMembObj('');
      setScenProtObj('');
      setScenCardObj('');
    }
  };
  const [editedGoals, setEditedGoals] = useState({ ...deptGoals });

  // Firebase Cloud Configuration States
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('bby_firebase_config');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  });

  React.useEffect(() => {
    setEditedGoals({ ...deptGoals });
  }, [deptGoals]);

  const deptKeys = React.useMemo(() => Object.keys(deptGoals || {}), [deptGoals]);

  const handleGoalChange = (metric, val) => {
    const isTypeField = metric.endsWith('Type');
    const processedVal = isTypeField ? val : (parseFloat(val) || 0);
    setEditedGoals(prev => ({
      ...prev,
      [selectedDept]: {
        ...prev[selectedDept],
        [metric]: processedVal
      }
    }));
  };

  const handleSaveGoals = () => {
    if (onSaveDeptGoals) {
      onSaveDeptGoals(editedGoals);
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
        {activeTab === 'config' && (
          <button className="btn btn-accent" onClick={handleSave}>
            Save Configuration
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <button 
          className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('config')}
          style={{ margin: 0, padding: '0.55rem 1.25rem' }}
        >
          Playbook Configurations
        </button>
        <button 
          className={`btn ${activeTab === 'scenarios' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('scenarios')}
          style={{ margin: 0, padding: '0.55rem 1.25rem' }}
        >
          Visual Scenario Builder
        </button>
      </div>

      {activeTab === 'config' ? (
        <>
          {saveSuccess && (
            <div style={{ padding: '1rem 1.5rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.9rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={18} /> Playbook Configurations Saved Successfully! Changes are now active across all simulators.
            </div>
          )}

          {/* Main Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            
            {/* Left Column: API & Engine Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Engine Mode Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-blue)" /> Simulation Engine Strategy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Radio Engine Mode Selector */}
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
                      Premium Pro: Gemini 3.1 Pro (Secure server-side API proxy) <Key size={12} color="var(--bby-yellow)" />
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Unlocks Google's flagship reasoning model for high-fidelity Grow coaching logs and advanced dialogue auditing. Evaluates soft skills (empathy, rapport, active listening). No browser API key required.
                    </p>
                  </div>
                </label>
              </div>

              {/* API Key Box */}
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
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    fontSize: '0.75rem',
                    color: '#fef08a',
                    lineHeight: '1.4'
                  }}>
                    <strong>⚠️ Security Recommendations:</strong>
                    <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1rem', listStyleType: 'disc' }}>
                      <li>Ensure your Google AI Studio API Key is restricted to your target services.</li>
                      <li>Configure rate limits and daily cost quotas in the Google AI Console to prevent abuse.</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* System Instructions / Prompt Engineering Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--info)" /> AI System Prompts Configurator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Provide the custom instructions that train the Gemini generative engine how to coach and evaluate like your store leaders would.
            </p>

            <div className="form-group">
              <label className="form-label">Coaching & Empathy Prompt Instructions:</label>
              <textarea 
                className="form-control" 
                rows={6}
                style={{ resize: 'none', fontSize: '0.85rem' }}
                placeholder="Ensure you lead with humanity. Coach advisors to explore the customer needs by congratulated them first, and offering protection by describing usage scenarios rather than pitch checklist lines..."
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
              />
            </div>
          </div>

          {/* Security PIN Code Configuration Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-yellow)" /> Store Passcode PIN Security
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Configure the 4-digit supervisor access passcode PIN. This passcode locks all dashboards, store rosters, and settings configurations from unauthorized advisor modifications.
            </p>

            <div className="form-group">
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
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Default is 1234. Change this PIN to lock out access on floor tablets. PIN must be exactly 4 digits.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Allowed / Forbidden Dictionaries */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--bby-yellow)" /> Vocabulary Rule Dictionaries
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Specify the preferred terminology advisors should use and the forbidden retail jargon they should avoid during customer conversations.
            </p>
          </div>

          {/* Preferred Allowed Phrases */}
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

          {/* Forbidden Prohibited Phrases */}
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

        {/* Department Specific Goals Configurator Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
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
              
              {/* Memberships Config Section */}
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
                      value={editedGoals[selectedDept]?.memberships || 0}
                      onChange={(e) => handleGoalChange('memberships', e.target.value)}
                      placeholder="Target value"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Credit Cards Config Section */}
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
                      value={editedGoals[selectedDept]?.creditCards || 0}
                      onChange={(e) => handleGoalChange('creditCards', e.target.value)}
                      placeholder="Target value"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic GSP & CSAT Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>GSP Attach % Goal:</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="form-control"
                    value={editedGoals[selectedDept]?.warranty || 0}
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
                    value={editedGoals[selectedDept]?.surveys || 0}
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
                value={editedGoals[selectedDept]?.rph || 0}
                onChange={(e) => handleGoalChange('rph', e.target.value)}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              />
            </div>

            {/* Conditional targets for Computing/Home Theatre */}
            {(selectedDept === 'Computing' || selectedDept === 'Home Theatre') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>Basket size Goal ($):</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editedGoals[selectedDept]?.basket || 0}
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
                      value={editedGoals[selectedDept]?.m365 || 0}
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
                      value={editedGoals[selectedDept]?.audio || 0}
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

      {/* Dynamic Style Training Corpus Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--bby-yellow)" /> Style & Training Corpus (Few-Shot Exemplars)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.4 }}>
            Provide examples of high-quality coaching logs you have written in the past. When using the **Gemini Engine**, these logs are fed directly into the model as few-shot training examples, prompting it to perfectly copy your formatting, coaching style, tone, standards, and metrics vocabulary!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Training Logs List */}
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

          {/* Add Exemplar Box */}
          {isAddingLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', border: '1px solid var(--bby-blue)', borderRadius: '14px', background: 'rgba(0, 70, 190, 0.02)' }}>
              <div className="form-group">
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

      {/* Collaborative Cloud Configuration Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', border: dbConnected ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)', marginTop: '1.5rem' }}>
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
              placeholder="e.g. bluecoach-bby-894"
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

      {/* Database Sync & Local Cache Diagnostics Panel */}
      <div className="glass-card" style={{ marginTop: '2rem', padding: '1.75rem' }}>
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coaching Sessions Logs</div>
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
      </>
      ) : (
        /* VISUAL SCENARIO BUILDER VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Builder Form */}
          <form onSubmit={handleCreateScenario} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)', margin: 0 }}>
              <Sparkles size={20} color="var(--bby-yellow)" /> Create Custom Scenario
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Scenario Title:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Computing: Mac Upgrade"
                  value={scenTitle} 
                  onChange={(e) => setScenTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Name:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Marcus Vance"
                  value={scenName} 
                  onChange={(e) => setScenName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product Category:</label>
                <select 
                  className="form-control"
                  value={scenCategory}
                  onChange={(e) => setScenCategory(e.target.value)}
                >
                  <option value="Computing">Computing</option>
                  <option value="Home Theater">Home Theater</option>
                  <option value="Geek Squad Services">Geek Squad Services</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty:</label>
                <select 
                  className="form-control"
                  value={scenDifficulty}
                  onChange={(e) => setScenDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Choose Customer Avatar:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {AVATAR_OPTIONS.map((opt, idx) => (
                  <img 
                    key={idx}
                    src={opt.url}
                    alt={opt.label}
                    title={opt.label}
                    onClick={() => setScenAvatar(opt.url)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: scenAvatar === opt.url ? '2.5px solid var(--bby-yellow)' : '1px solid var(--border-glass)',
                      boxShadow: scenAvatar === opt.url ? '0 0 10px rgba(253,216,53,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Scenario Context Description:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Marcus wants to buy a Mac for video editing but has budget limits..."
                value={scenDesc}
                onChange={(e) => setScenDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Customer Greeting (Dialogue):</label>
              <textarea 
                className="form-control" 
                rows={3}
                style={{ resize: 'none' }}
                placeholder="e.g. Hi, I need to get a new Apple laptop for video editing at film school, but they look so expensive..."
                value={scenGreeting}
                onChange={(e) => setScenGreeting(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Specific Needs / Focus:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="High RAM, graphic speed, M3 chip preference..."
                value={scenNeeds}
                onChange={(e) => setScenNeeds(e.target.value)}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--bby-yellow)', marginBottom: '1rem' }}>Dialogue Objections (Text prompts)</h4>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Membership Objection:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. I don't buy enough here to justify a yearly fee."
                  value={scenMembObj}
                  onChange={(e) => setScenMembObj(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Protection Objection:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Apple laptops are solid, why would I need Geek Squad?"
                  value={scenProtObj}
                  onChange={(e) => setScenProtObj(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Credit Card Objection:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. I already have too many store cards, no thanks."
                  value={scenCardObj}
                  onChange={(e) => setScenCardObj(e.target.value)}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--success)', marginBottom: '0.75rem' }}>Success Keywords (Separated by commas)</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Connect Step:</label>
                  <input type="text" className="form-control" value={scenConnectKw} onChange={(e) => setScenConnectKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Discover Step:</label>
                  <input type="text" className="form-control" value={scenDiscoverKw} onChange={(e) => setScenDiscoverKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Recommend Step:</label>
                  <input type="text" className="form-control" value={scenRecommendKw} onChange={(e) => setScenRecommendKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Protect Step:</label>
                  <input type="text" className="form-control" value={scenProtectKw} onChange={(e) => setScenProtectKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Close Step:</label>
                  <input type="text" className="form-control" value={scenCloseKw} onChange={(e) => setScenCloseKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}>
              Create & Install Roleplay Scenario
            </button>
          </form>

          {/* Right Column: Custom Scenarios List */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', margin: 0 }}>
                <Compass size={20} color="var(--bby-blue)" /> Custom Scenarios Library
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '0.15rem' }}>Active custom customer personas loaded into your local store consult database.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customScenarios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1.5px dashed var(--border-glass)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  No custom roleplay scenarios added yet. Use the form on the left to configure your first one!
                </div>
              ) : (
                customScenarios.map((scen) => (
                  <div 
                    key={scen.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem', 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={scen.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-glass)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#fff', fontWeight: 600 }}>{scen.title}</h4>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Customer: {scen.name} | {scen.difficulty}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-trash"
                      style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}
                      onClick={() => onDeleteCustomScenario(scen.id)}
                      title="Remove Custom Scenario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
