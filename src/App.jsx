import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import StoreRoster from './components/StoreRoster';
import RoleplayCenter from './components/RoleplayCenter';
import CertificationCenter from './components/CertificationCenter';
import CoachSimulator from './components/CoachSimulator';
import PlaybookStudio from './components/PlaybookStudio';
import { Compass, Award, Users, BookOpen, LayoutDashboard, Key, Sparkles, ShieldCheck, ClipboardList } from 'lucide-react';

const INITIAL_ROSTER = [
  { id: 'yinel', name: 'Yinel', dept: 'Front End', hours: 34.5, memberships: 10, creditCards: 1, warranty: 22.2, surveys: 2, rph: 744, gap: 'BBY Credit Cards (1 App)' },
  { id: 'julianna', name: 'Julianna', dept: 'Computing', hours: 78.0, memberships: 6, creditCards: 2, warranty: 11.2, surveys: 1, rph: 1049, gap: 'None' },
  { id: 'muntarin', name: 'Muntarin', dept: 'Home Theatre', hours: 51.4, memberships: 4, creditCards: 0, warranty: 17.1, surveys: 1, rph: 868, gap: 'BBY Credit Cards (0 Apps)' },
  { id: 'ricky', name: 'Ricky', dept: 'General Sales', hours: 59.9, memberships: 3, creditCards: 7, warranty: 11.5, surveys: 0, rph: 649, gap: '5-Star Surveys (0 CSAT)' },
  { id: 'paulie', name: 'Paul / Paulie', dept: 'Appliances', hours: 25.0, memberships: 3, creditCards: 2, warranty: 11.6, surveys: 0, rph: 1436, gap: '5-Star Surveys (0 CSAT)' },
  { id: 'daniel', name: 'Daniel', dept: 'Mobile', hours: 30.8, memberships: 3, creditCards: 2, warranty: 7.5, surveys: 1, rph: 1386, gap: 'GSP Attach (7.5% vs 12.0%)' },
  { id: 'kevin', name: 'Kevin', dept: 'Geek Squad', hours: 43.6, memberships: 2, creditCards: 5, warranty: 4.0, surveys: 0, rph: 1460, gap: 'GSP Attach (4.0% vs 12.0%)' },
  { id: 'victor', name: 'Victor', dept: 'Home Theatre', hours: 129.1, memberships: 11, creditCards: 13, warranty: 8.0, surveys: 0.2, rph: 629, gap: '5-Star Surveys (Failing CSAT)' },
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
    forbiddenPhrases: ['warranty', 'pushy', 'contract']
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
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [selectedCoachingRosterEmployee, setSelectedCoachingRosterEmployee] = useState(null);
  const [prefillBuilderData, setPrefillBuilderData] = useState(null);
  
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
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Force useGemini to true if an environment key is loaded and no custom override is in localStorage
        if (hasEnvKey && (!savedKey || savedKey.trim().length < 10)) {
          parsed.useGemini = true;
        }
        setPlaybookSettings(parsed);
      } catch (e) {
        console.error(e);
      }
    } else if (hasEnvKey) {
      setPlaybookSettings(prev => ({ ...prev, useGemini: true }));
    }

    const savedMetrics = localStorage.getItem('bby_metrics');
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCerts = localStorage.getItem('bby_certifications');
    if (savedCerts) {
      try {
        setCertifications(JSON.parse(savedCerts));
      } catch (e) {
        console.error(e);
      }
    }

    const savedSessions = localStorage.getItem('bby_recent_sessions');
    if (savedSessions) {
      try {
        setRecentSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCustomScenarios = localStorage.getItem('bby_custom_scenarios');
    if (savedCustomScenarios) {
      try {
        setCustomScenarios(JSON.parse(savedCustomScenarios));
      } catch (e) {
        console.error(e);
      }
    }

    const savedGoals = localStorage.getItem('bby_dept_goals');
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        // Safely introduce Front End goals without wiping out General Sales!
        let changed = false;
        if (!parsed['Front End']) {
          parsed['Front End'] = { 
            memberships: 8.0, membershipsType: 'Hours', 
            creditCards: 12.5, creditCardsType: 'Hours', 
            warranty: 11.0, surveys: 1.0, rph: 640 
          };
          changed = true;
        }
        if (!parsed['General Sales']) {
          parsed['General Sales'] = { 
            memberships: 5000, membershipsType: 'Dollars', 
            creditCards: 8000, creditCardsType: 'Dollars', 
            warranty: 11.0, surveys: 1.0, rph: 640 
          };
          changed = true;
        }
        setDeptGoals(parsed);
        if (changed) {
          localStorage.setItem('bby_dept_goals', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedRoster = localStorage.getItem('bby_roster');
    if (savedRoster) {
      try {
        const parsed = JSON.parse(savedRoster);
        // Reset roster if Jordan is found, or if Yinel is still assigned to General Sales (so she migrates to Front End, while Ricky remains General Sales)
        if (parsed.some(e => e.id === 'jordan') || parsed.some(e => e.id === 'yinel' && e.dept === 'General Sales') || !parsed.some(e => e.id === 'yinel') || !parsed.some(e => e.id === 'yinel' && 'hours' in e)) {
          setRoster(INITIAL_ROSTER);
          localStorage.setItem('bby_roster', JSON.stringify(INITIAL_ROSTER));
        } else {
          setRoster(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('bby_roster', JSON.stringify(INITIAL_ROSTER));
    }
  }, []);

  // Save Settings
  const handleSaveSettings = ({ apiKey: newKey, playbookSettings: newSettings }) => {
    setApiKey(newKey);
    setPlaybookSettings(newSettings);
    localStorage.setItem('bby_api_key', newKey);
    localStorage.setItem('bby_playbook_settings', JSON.stringify(newSettings));
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
        <div className="sidebar-footer">
          {playbookSettings.useGemini && apiKey.trim().length > 10 ? (
            <div className="api-key-indicator" style={{ background: 'var(--info-glow)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <div className="indicator-dot active" />
              <span style={{ color: '#a5f3fc' }}>Gemini Free Mode Active</span>
            </div>
          ) : (
            <div className="api-key-indicator" style={{ background: 'var(--warning-glow)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="indicator-dot inactive" style={{ background: 'var(--bby-yellow)', boxShadow: '0 0 8px rgba(255, 230, 0, 0.4)' }} />
              <span style={{ color: '#fde047' }}>Local Sandbox Active</span>
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
            roster={roster}
            onCoachEmployee={handleCoachEmployeeFromRoster}
            onCreateLog={handleCreateLogFromRoster}
            deptGoals={deptGoals}
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
            }}
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
