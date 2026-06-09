import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import StoreRoster from './components/StoreRoster';
import RoleplayCenter from './components/RoleplayCenter';
import CertificationCenter from './components/CertificationCenter';
import CoachSimulator from './components/CoachSimulator';
import PlaybookStudio from './components/PlaybookStudio';
import { Compass, Award, Users, BookOpen, LayoutDashboard, Key, Sparkles, ShieldCheck, ClipboardList } from 'lucide-react';
import { 
  isFirebaseConnected, 
  subscribeToActivePeriod, 
  subscribeToRosterHistory, 
  subscribeToPlaybookSettings, 
  subscribeToDeptGoals, 
  saveActivePeriodToCloud, 
  saveRosterHistoryToCloud, 
  savePlaybookSettingsToCloud, 
  saveDeptGoalsToCloud,
  seedOfflineDataToCloud,
  initFirebase
} from './services/firebase';

// Safe JSON Parse helper to prevent localStorage corruption crashes
const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON parsing failed:', e);
    return fallback;
  }
};

const INITIAL_ROSTER = [
  { id: 'yinel', name: 'Yinel', dept: 'Front End', hours: 34.5, memberships: 10, creditCards: 1, warranty: 22.2, surveys: 2, rph: 744, gap: 'BBY Credit Cards (1 App)' },
  { id: 'julianna', name: 'Julianna', dept: 'Computing', hours: 78.0, memberships: 6, creditCards: 2, warranty: 11.2, surveys: 1, rph: 1049, gap: 'None' },
  { id: 'muntarin', name: 'Muntarin', dept: 'Home Theatre', hours: 51.4, memberships: 4, creditCards: 0, warranty: 17.1, surveys: 1, rph: 868, gap: 'BBY Credit Cards (0 Apps)' },
  { id: 'ricky', name: 'Ricky', dept: 'General Sales', hours: 59.9, memberships: 3, creditCards: 7, warranty: 11.5, surveys: 0, rph: 649, gap: '5 Star Surveys' },
  { id: 'paulie', name: 'Paul / Paulie', dept: 'Appliances', hours: 25.0, memberships: 3, creditCards: 2, warranty: 11.6, surveys: 0, rph: 1436, gap: '5 Star Surveys' },
  { id: 'daniel', name: 'Daniel', dept: 'Mobile', hours: 30.8, memberships: 3, creditCards: 2, warranty: 7.5, surveys: 1, rph: 1386, gap: 'GSP Attach (7.5% vs 12.0%)' },
  { id: 'kevin', name: 'Kevin', dept: 'Geek Squad', hours: 43.6, memberships: 2, creditCards: 5, warranty: 4.0, surveys: 0, rph: 1460, gap: 'GSP Attach (4.0% vs 12.0%)' },
  { id: 'victor', name: 'Victor', dept: 'Home Theatre', hours: 129.1, memberships: 11, creditCards: 13, warranty: 8.0, surveys: 0.2, rph: 629, gap: '5 Star Surveys' },
  { id: 'ivan', name: 'Ivan', dept: 'Computing', hours: 69.3, memberships: 2, creditCards: 1, warranty: 6.8, surveys: 1, rph: 792, gap: 'GSP Attach & Memberships' },
  { id: 'avneet', name: 'Avneet', dept: 'Mobile', hours: 26.7, memberships: 2, creditCards: 1, warranty: 3.7, surveys: 1, rph: 404, gap: 'Multiple Gaps (1 Category)' }
];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [apiKey, setApiKey] = useState('');
  
  const [playbookSettings, setPlaybookSettings] = useState({
    useGemini: false,
    customSystemPrompt: '',
    allowedPhrases: ['My Best Buy Plus', 'My Best Buy Total', 'Geek Squad Protection', 'AppleCare+'],
    forbiddenPhrases: ['warranty', 'pushy', 'contract'],
    trainingLogs: [
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
    ]
  });

  const [metrics, setMetrics] = useState({
    memberships: 52,
    creditCards: 4,
    warranty: 12,
    surveys: 4.7,
    rph: 1050
  });

  const [certifications, setCertifications] = useState([
    {
      id: 'computing',
      title: 'Computing Certified Advisor',
      category: 'Computing',
      description: 'Mastery in computer specs, college discovery, Total memberships, and GSP attach.',
      requirement: 'Score 80%+ on Sarah Miller College Prep Roleplay',
      scenarioId: 'computing-college',
      earned: false
    },
    {
      id: 'home-theater',
      title: 'Home Theater Specialist',
      category: 'Home Theater',
      description: 'Mastery in high-end OLED panels, custom wall mountings, audio packages, and premium protection.',
      requirement: 'Score 80%+ on David Chen OLED Gaming Roleplay',
      scenarioId: 'ht-gaming',
      earned: false
    },
    {
      id: 'geek-squad',
      title: 'Geek Squad Services Liaison',
      category: 'Geek Squad Services',
      description: 'Mastery in empathetic service intake, secure virus cleanup recommendations, and 24/7 tech support memberships.',
      requirement: 'Score 80%+ on Elena Rostova Virus Recovery Roleplay',
      scenarioId: 'geek-repair',
      earned: false
    }
  ]);

  const [recentSessions, setRecentSessions] = useState([]);
  const [customScenarios, setCustomScenarios] = useState([]);
  
  // Store Roster Performance State
  const [rosterHistory, setRosterHistory] = useState({ 'May 2026': INITIAL_ROSTER });
  const [activePeriod, setActivePeriod] = useState('May 2026');
  const [selectedCoachingRosterEmployee, setSelectedCoachingRosterEmployee] = useState(null);
  const [prefillBuilderData, setPrefillBuilderData] = useState(null);

  // Cloud Synchronization state
  const [dbConnected, setDbConnected] = useState(isFirebaseConnected());

  const handleSaveFirebaseConfig = (config) => {
    if (config) {
      localStorage.setItem('bby_firebase_config', JSON.stringify(config));
      const database = initFirebase(config);
      setDbConnected(!!database);
      if (database) {
        alert("Connected to Firebase Cloud Database! Roster data, department targets, and exemplar templates are now synchronized in real-time.");
      }
    } else {
      localStorage.removeItem('bby_firebase_config');
      initFirebase(null);
      setDbConnected(false);
      alert("Switched back to Local Offline Sandbox Mode successfully.");
    }
  };
  
  // Department-specific Goals Matrix (dynamic store benchmarks)
  const [deptGoals, setDeptGoals] = useState({
    'Front End': { 
      memberships: 8.0, membershipsType: 'Hours', 
      creditCards: 12.5, creditCardsType: 'Hours', 
      warranty: 11.0, surveys: 1.0, rph: 640 
    },
    'General Sales': { 
      memberships: 5000, membershipsType: 'Dollars', 
      creditCards: 8000, creditCardsType: 'Dollars', 
      warranty: 11.0, surveys: 1.0, rph: 640 
    },
    'Appliances': { 
      memberships: 15000, membershipsType: 'Dollars', 
      creditCards: 10000, creditCardsType: 'Dollars', 
      warranty: 12.0, surveys: 1.0, rph: 1200 
    },
    'Computing': { 
      memberships: 8000, membershipsType: 'Dollars', 
      creditCards: 10000, creditCardsType: 'Dollars', 
      warranty: 11.0, surveys: 1.0, rph: 900 
    },
    'Mobile': { 
      memberships: 6000, membershipsType: 'Dollars', 
      creditCards: 8000, creditCardsType: 'Dollars', 
      warranty: 8.0, surveys: 1.0, rph: 700 
    },
    'Home Theatre': { 
      memberships: 10000, membershipsType: 'Dollars', 
      creditCards: 12000, creditCardsType: 'Dollars', 
      warranty: 11.0, surveys: 1.0, rph: 800 
    },
    'Geek Squad': { 
      memberships: 5000, membershipsType: 'Dollars', 
      creditCards: 15000, creditCardsType: 'Dollars', 
      warranty: 12.0, surveys: 1.0, rph: 500 
    }
  });
  
  const [showCertModal, setShowCertModal] = useState(null);

  // Initialize and load state from localStorage on startup
  useEffect(() => {
    const savedKey = localStorage.getItem('bby_api_key');
    const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim().length > 10);

    if (savedKey && savedKey.trim().length > 10) {
      setApiKey(savedKey);
    } else if (hasEnvKey) {
      setApiKey(import.meta.env.VITE_GEMINI_API_KEY);
    }

    const savedSettings = localStorage.getItem('bby_playbook_settings');
    let parsedSettings = safeJsonParse(savedSettings, null);
    if (parsedSettings) {
      // Force useGemini to true if an environment key is loaded and no custom override is in localStorage
      if (hasEnvKey && (!savedKey || savedKey.trim().length < 10)) {
        parsedSettings.useGemini = true;
      }
      
      // Safeguard trainingLogs: if they upgraded from an older version of saved settings that didn't have trainingLogs, populate it!
      if (!parsedSettings.trainingLogs || !Array.isArray(parsedSettings.trainingLogs)) {
        parsedSettings.trainingLogs = [
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
        ];
        localStorage.setItem('bby_playbook_settings', JSON.stringify(parsedSettings));
      }
      setPlaybookSettings(parsedSettings);
    } else if (hasEnvKey) {
      setPlaybookSettings(prev => ({ ...prev, useGemini: true }));
    }

    const savedMetrics = localStorage.getItem('bby_metrics');
    if (savedMetrics) {
      const metricsData = safeJsonParse(savedMetrics, null);
      if (metricsData) setMetrics(metricsData);
    }

    const savedCerts = localStorage.getItem('bby_certifications');
    if (savedCerts) {
      const certsData = safeJsonParse(savedCerts, null);
      if (certsData) setCertifications(certsData);
    }

    const savedSessions = localStorage.getItem('bby_recent_sessions');
    if (savedSessions) {
      const sessionsData = safeJsonParse(savedSessions, null);
      if (sessionsData) setRecentSessions(sessionsData);
    }

    const savedCustomScenarios = localStorage.getItem('bby_custom_scenarios');
    if (savedCustomScenarios) {
      const customData = safeJsonParse(savedCustomScenarios, null);
      if (customData) setCustomScenarios(customData);
    }

    const savedGoals = localStorage.getItem('bby_dept_goals');
    if (savedGoals) {
      const parsedGoals = safeJsonParse(savedGoals, null);
      if (parsedGoals) {
        // Safely introduce Front End goals without wiping out General Sales!
        let changed = false;
        if (!parsedGoals['Front End']) {
          parsedGoals['Front End'] = { 
            memberships: 8.0, membershipsType: 'Hours', 
            creditCards: 12.5, creditCardsType: 'Hours', 
            warranty: 11.0, surveys: 1.0, rph: 640 
          };
          changed = true;
        }
        if (!parsedGoals['General Sales']) {
          parsedGoals['General Sales'] = { 
            memberships: 5000, membershipsType: 'Dollars', 
            creditCards: 8000, creditCardsType: 'Dollars', 
            warranty: 11.0, surveys: 1.0, rph: 640 
          };
          changed = true;
        }
        setDeptGoals(parsedGoals);
        if (changed) {
          localStorage.setItem('bby_dept_goals', JSON.stringify(parsedGoals));
        }
      }
    }

    const savedHistory = localStorage.getItem('bby_roster_history');
    if (savedHistory) {
      const historyData = safeJsonParse(savedHistory, null);
      if (historyData) setRosterHistory(historyData);
    } else {
      const savedRoster = localStorage.getItem('bby_roster');
      if (savedRoster) {
        const parsedRoster = safeJsonParse(savedRoster, null);
        if (parsedRoster && Array.isArray(parsedRoster)) {
          let rosterToMigrate = parsedRoster;
          if (parsedRoster.some(e => e.id === 'jordan') || parsedRoster.some(e => e.id === 'yinel' && e.dept === 'General Sales') || !parsedRoster.some(e => e.id === 'yinel') || !parsedRoster.some(e => e.id === 'yinel' && 'hours' in e)) {
            rosterToMigrate = INITIAL_ROSTER;
          }
          const migrated = { 'May 2026': rosterToMigrate };
          setRosterHistory(migrated);
          localStorage.setItem('bby_roster_history', JSON.stringify(migrated));
        } else {
          setRosterHistory({ 'May 2026': INITIAL_ROSTER });
        }
      } else {
        setRosterHistory({ 'May 2026': INITIAL_ROSTER });
      }
    }

    const savedPeriod = localStorage.getItem('bby_active_period');
    if (savedPeriod) {
      setActivePeriod(savedPeriod);
    }
  }, []);

  // Subscribe to real-time Cloud Sync
  useEffect(() => {
    if (!dbConnected) return;

    // Seed existing offline data from localStorage to cloud if cloud database is empty!
    const seedCloud = async () => {
      const savedSettings = localStorage.getItem('bby_playbook_settings');
      const savedGoals = localStorage.getItem('bby_dept_goals');
      const savedHistory = localStorage.getItem('bby_roster_history');
      const savedPeriod = localStorage.getItem('bby_active_period');

      await seedOfflineDataToCloud({
        activePeriod: savedPeriod || 'May 2026',
        rosterHistory: safeJsonParse(savedHistory, null),
        playbookSettings: safeJsonParse(savedSettings, null),
        deptGoals: safeJsonParse(savedGoals, null)
      });
    };
    seedCloud();

    // Subscribe to active period
    const unsubPeriod = subscribeToActivePeriod((p) => {
      if (p) setActivePeriod(p);
    });

    // Subscribe to roster history
    const unsubRoster = subscribeToRosterHistory((h) => {
      if (h) setRosterHistory(h);
    });

    // Subscribe to playbook settings
    const unsubPlaybook = subscribeToPlaybookSettings((s) => {
      if (s) {
        // Force useGemini to true if an environment key is loaded and no custom override is in localStorage
        const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim().length > 10);
        const savedKey = localStorage.getItem('bby_api_key');
        if (hasEnvKey && (!savedKey || savedKey.trim().length < 10)) {
          s.useGemini = true;
        }
        setPlaybookSettings(s);
      }
    });

    // Subscribe to department goals
    const unsubGoals = subscribeToDeptGoals((g) => {
      if (g) setDeptGoals(g);
    });

    return () => {
      if (unsubPeriod) unsubPeriod();
      if (unsubRoster) unsubRoster();
      if (unsubPlaybook) unsubPlaybook();
      if (unsubGoals) unsubGoals();
    };
  }, [dbConnected]);

  // Save Settings
  const handleSaveSettings = ({ apiKey: newKey, playbookSettings: newSettings }) => {
    setApiKey(newKey);
    setPlaybookSettings(newSettings);
    localStorage.setItem('bby_api_key', newKey);
    localStorage.setItem('bby_playbook_settings', JSON.stringify(newSettings));
    if (dbConnected) {
      savePlaybookSettingsToCloud(newSettings);
    }
  };

  // Import custom scenario generated from past coachings
  const handleImportScenario = (newScenario) => {
    const updated = [...customScenarios, newScenario];
    setCustomScenarios(updated);
    localStorage.setItem('bby_custom_scenarios', JSON.stringify(updated));
  };

  // Complete Roleplay
  const handleCompleteRoleplay = ({ scenarioId, category, customerName, avatar, score, passed, growReport, metrics: newMetrics }) => {
    // 1. Add session log
    const newSession = {
      customerName,
      category,
      avatar,
      score,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: growReport.reality
    };
    const updatedSessions = [newSession, ...recentSessions].slice(0, 15);
    setRecentSessions(updatedSessions);
    localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));

    // 2. Average in metrics if passed
    if (passed && newMetrics) {
      const averagedMetrics = {
        memberships: Math.round((metrics.memberships * 2 + newMetrics.memberships) / 3),
        creditCards: metrics.creditCards + newMetrics.creditCards,
        warranty: Math.round((metrics.warranty * 2 + newMetrics.warranty) / 3),
        surveys: Math.round(((metrics.surveys * 2 + newMetrics.surveys) / 3) * 10) / 10,
        rph: Math.round((metrics.rph * 2 + newMetrics.rph) / 3)
      };
      setMetrics(averagedMetrics);
      localStorage.setItem('bby_metrics', JSON.stringify(averagedMetrics));
    }

    // 3. Award certification if requirement is met
    if (score >= 80) {
      const updatedCerts = certifications.map(cert => {
        if (cert.scenarioId === scenarioId && !cert.earned) {
          cert.earned = true;
          setShowCertModal(cert); 
          return cert;
        }
        return cert;
      });
      setCertifications(updatedCerts);
      localStorage.setItem('bby_certifications', JSON.stringify(updatedCerts));
    }
  };

  const handleStartRoleplayFromCert = (scenarioId) => {
    setActiveView('roleplay');
  };

  // Roster Interactions
  const handleCoachEmployeeFromRoster = (emp) => {
    setSelectedCoachingRosterEmployee(emp);
    setActiveView('coach');
  };

  const handleCreateLogFromRoster = (emp) => {
    setPrefillBuilderData(emp);
    setActiveView('builder');
  };

  const handleUpdateRosterHistory = (updatedRoster) => {
    const newHistory = { ...rosterHistory, [activePeriod]: updatedRoster };
    setRosterHistory(newHistory);
    localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
    if (dbConnected) {
      saveRosterHistoryToCloud(newHistory);
    }
  };

  const handleUpdateEmployeeDept = (empId, newDept) => {
    const updated = (rosterHistory[activePeriod] || []).map(emp => {
      if (emp.id === empId) {
        return { ...emp, dept: newDept };
      }
      return emp;
    });
    handleUpdateRosterHistory(updated);
  };

  const handleAddEmployee = (newEmp) => {
    const updated = [...(rosterHistory[activePeriod] || []), newEmp];
    handleUpdateRosterHistory(updated);
  };

  const handleEditEmployee = (empId, updatedFields) => {
    const updated = (rosterHistory[activePeriod] || []).map(emp => {
      if (emp.id === empId) {
        return { ...emp, ...updatedFields };
      }
      return emp;
    });
    handleUpdateRosterHistory(updated);
  };

  const handleCreatePeriodArchive = (newPeriodName, copyOption) => {
    const currentRoster = rosterHistory[activePeriod] || [];
    let newRoster = [];
    if (copyOption === 'roster-only') {
      newRoster = currentRoster.map(emp => ({
        ...emp,
        hours: 0,
        memberships: 0,
        creditCards: 0,
        warranty: 0,
        surveys: 5.0,
        rph: 0,
        gap: 'None'
      }));
    } else if (copyOption === 'roster-and-metrics') {
      newRoster = currentRoster.map(emp => ({ ...emp }));
    } else {
      newRoster = [];
    }
    const newHistory = { ...rosterHistory, [newPeriodName]: newRoster };
    setRosterHistory(newHistory);
    setActivePeriod(newPeriodName);
    localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
    localStorage.setItem('bby_active_period', newPeriodName);
    if (dbConnected) {
      saveRosterHistoryToCloud(newHistory);
      saveActivePeriodToCloud(newPeriodName);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">BBY</div>
          <div className="logo-text">BlueCoach<span>AI</span></div>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard className="menu-item-icon" /> Dashboard
          </li>
          <li 
            className={`menu-item ${activeView === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveView('roster')}
          >
            <ClipboardList className="menu-item-icon" /> Store Roster
          </li>
          <li 
            className={`menu-item ${activeView === 'roleplay' ? 'active' : ''}`}
            onClick={() => setActiveView('roleplay')}
          >
            <Compass className="menu-item-icon" /> Consult Arena
          </li>
          <li 
            className={`menu-item ${activeView === 'certification' ? 'active' : ''}`}
            onClick={() => setActiveView('certification')}
          >
            <Award className="menu-item-icon" /> Certifications
          </li>
          <li 
            className={`menu-item ${activeView === 'coach' ? 'active' : ''}`}
            onClick={() => setActiveView('coach')}
          >
            <Users className="menu-item-icon" /> Coach Simulator
          </li>
          <li 
            className={`menu-item ${activeView === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveView('builder')}
          >
            <Sparkles className="menu-item-icon" /> Coaching Generator
          </li>
          <li 
            className={`menu-item ${activeView === 'playbook' ? 'active' : ''}`}
            onClick={() => setActiveView('playbook')}
          >
            <BookOpen className="menu-item-icon" /> Playbook Studio
          </li>
        </ul>

        {/* Sidebar Footer Status Indicator */}
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {dbConnected ? (
            <div className="api-key-indicator" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="indicator-dot active" style={{ background: 'var(--success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
              <span style={{ color: '#a7f3d0' }}>Cloud Database Synced</span>
            </div>
          ) : (
            <div className="api-key-indicator" style={{ background: 'var(--warning-glow)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="indicator-dot inactive" style={{ background: 'var(--bby-yellow)', boxShadow: '0 0 8px rgba(255, 230, 0, 0.4)' }} />
              <span style={{ color: '#fde047' }}>Local Sandbox Active</span>
            </div>
          )}

          {playbookSettings.useGemini && apiKey.trim().length > 10 && (
            <div className="api-key-indicator" style={{ background: 'var(--info-glow)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <div className="indicator-dot active" />
              <span style={{ color: '#a5f3fc' }}>Gemini Free Mode Active</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main View Display Port */}
      <main className="main-content">
        {activeView === 'dashboard' && (
          <Dashboard 
            metrics={metrics}
            certifications={certifications}
            recentSessions={recentSessions}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'roster' && (
          <StoreRoster 
            roster={rosterHistory[activePeriod] || []}
            activePeriod={activePeriod}
            rosterHistory={rosterHistory}
            onChangePeriod={(p) => { 
              setActivePeriod(p); 
              localStorage.setItem('bby_active_period', p); 
              if (dbConnected) saveActivePeriodToCloud(p);
            }}
            onCoachEmployee={handleCoachEmployeeFromRoster}
            onCreateLog={handleCreateLogFromRoster}
            deptGoals={deptGoals}
            onUpdateEmployeeDept={handleUpdateEmployeeDept}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onCreatePeriod={handleCreatePeriodArchive}
          />
        )}
        
        {activeView === 'roleplay' && (
          <RoleplayCenter 
            apiKey={apiKey}
            playbookSettings={playbookSettings}
            onCompleteRoleplay={handleCompleteRoleplay}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'certification' && (
          <CertificationCenter 
            certifications={certifications}
            onNavigate={setActiveView}
            onStartRoleplay={handleStartRoleplayFromCert}
          />
        )}

        {activeView === 'coach' && (
          <CoachSimulator 
            apiKey={apiKey}
            playbookSettings={playbookSettings}
            customScenarios={customScenarios}
            preselectedEmployee={selectedCoachingRosterEmployee}
            clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
            prefillBuilderData={prefillBuilderData}
            clearPrefillBuilderData={() => setPrefillBuilderData(null)}
            onImportScenario={handleImportScenario}
            initialTab="sim"
          />
        )}

        {activeView === 'builder' && (
          <CoachSimulator 
            apiKey={apiKey}
            playbookSettings={playbookSettings}
            customScenarios={customScenarios}
            preselectedEmployee={selectedCoachingRosterEmployee}
            clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
            prefillBuilderData={prefillBuilderData}
            clearPrefillBuilderData={() => setPrefillBuilderData(null)}
            onImportScenario={handleImportScenario}
            initialTab="builder"
          />
        )}

        {activeView === 'playbook' && (
          <PlaybookStudio 
            apiKey={apiKey}
            playbookSettings={playbookSettings}
            onSaveSettings={handleSaveSettings}
            deptGoals={deptGoals}
            onSaveDeptGoals={(newGoals) => {
              setDeptGoals(newGoals);
              localStorage.setItem('bby_dept_goals', JSON.stringify(newGoals));
              if (dbConnected) saveDeptGoalsToCloud(newGoals);
            }}
            dbConnected={dbConnected}
            onSaveFirebaseConfig={handleSaveFirebaseConfig}
          />
        )}
      </main>

      {/* DYNAMIC CONGRATULATORY AWARD CERTIFICATE MODAL */}
      {showCertModal && (
        <div className="modal-overlay" onClick={() => setShowCertModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '2.5px solid var(--bby-yellow)' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255, 230, 0, 0.08)', borderRadius: '50%', border: '2px solid rgba(255,230,0,0.3)', animation: 'fadeIn 0.6s ease' }}>
                <Award size={48} color="var(--bby-yellow)" fill="var(--bby-yellow)" />
              </div>
              
              <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '-0.02em' }}>
                CONGRATULATIONS!
              </h2>
              
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '400px' }}>
                You have passed the consultative sales validation exam and earned the official **{showCertModal.title}**!
              </p>

              <div style={{ background: 'rgba(0, 70, 190, 0.15)', border: '1px solid rgba(0, 70, 190, 0.25)', padding: '1.25rem 2rem', borderRadius: '16px', width: '100%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Unlocked Badge</span>
                <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-heading)', marginTop: '0.25rem', display: 'block' }}>
                  {showCertModal.category} Expert
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => {
                    setShowCertModal(null);
                    setActiveView('certification');
                  }}
                >
                  View in Hub
                </button>
                <button 
                  className="btn btn-accent" 
                  style={{ flex: 1 }}
                  onClick={() => setShowCertModal(null)}
                >
                  Keep Practicing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
