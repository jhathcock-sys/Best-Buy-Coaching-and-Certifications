import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import StoreRoster from './components/StoreRoster';
import RoleplayCenter from './components/RoleplayCenter';
import CoachSimulator from './components/CoachSimulator';
import PlaybookStudio from './components/PlaybookStudio';
import CoachingHistory from './components/CoachingHistory';
import LiveFloorShadow from './components/LiveFloorShadow';
import Login from './components/Login';
import FloorLeaderTracker from './components/FloorLeaderTracker';
import { Compass, Award, Users, BookOpen, LayoutDashboard, Key, Sparkles, ShieldCheck, ClipboardList, Archive, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  subscribeToActivePeriod, 
  subscribeToRosterHistory, 
  subscribeToPlaybookSettings, 
  subscribeToDeptGoals, 
  subscribeToRecentSessions,
  subscribeToMetrics,
  subscribeToFollowUpTasks,
  subscribeToFloorLeaderShifts,
  seedOfflineDataToCloud,
  subscribeToCoachingLogs
} from './services/firebase';
import { AppProvider, useApp } from './context/AppContext';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';

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

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}


function AppContent() {
  const { 
    activeView, 
    setActiveView, 
    apiKey, 
    setApiKey, 
    dbConnected, 
    setDbConnected, 
    handleSaveFirebaseConfig,
    isAuthenticated,
    storePin,
    setStorePin,
    login
  } = useApp();
  
  // Zustand Store Selectors
  const rosterHistory = useStore((state) => state.rosterHistory);
  const activePeriod = useStore((state) => state.activePeriod);
  const playbookSettings = useStore((state) => state.playbookSettings);
  const recentSessions = useStore((state) => state.recentSessions);
  const metrics = useStore((state) => state.metrics);
  const customScenarios = useStore((state) => state.customScenarios);
  const followUpTasks = useStore((state) => state.followUpTasks);
  const floorLeaderShifts = useStore((state) => state.floorLeaderShifts);
  const coachingLogs = useStore((state) => state.coachingLogs);
  const deptGoals = useStore((state) => state.deptGoals);
  const activeManager = useStore((state) => state.activeManager);

  // Zustand Store Actions
  const setRosterHistory = useStore((state) => state.setRosterHistory);
  const setActivePeriod = useStore((state) => state.setActivePeriod);
  const setPlaybookSettings = useStore((state) => state.setPlaybookSettings);
  const setRecentSessions = useStore((state) => state.setRecentSessions);
  const setMetrics = useStore((state) => state.setMetrics);
  const setFollowUpTasks = useStore((state) => state.setFollowUpTasks);
  const setFloorLeaderShifts = useStore((state) => state.setFloorLeaderShifts);
  const setCoachingLogs = useStore((state) => state.setCoachingLogs);
  const setDeptGoals = useStore((state) => state.setDeptGoals);
  const logout = useStore((state) => state.logout);

  const addFollowUpTask = useStore((state) => state.addFollowUpTask);
  const completeFollowUpTask = useStore((state) => state.completeFollowUpTask);
  const saveSettings = useStore((state) => state.saveSettings);
  const importCustomScenario = useStore((state) => state.importCustomScenario);
  const deleteCustomScenario = useStore((state) => state.deleteCustomScenario);
  const saveFloorLeaderShift = useStore((state) => state.saveFloorLeaderShift);
  const deleteFloorLeaderShift = useStore((state) => state.deleteFloorLeaderShift);
  const logCoachingSession = useStore((state) => state.logCoachingSession);
  const deleteCoachingSession = useStore((state) => state.deleteCoachingSession);
  const deleteCoachingLog = useStore((state) => state.deleteCoachingLog);
  const completeRoleplay = useStore((state) => state.completeRoleplay);
  const saveDeptGoals = useStore((state) => state.saveDeptGoals);
  const changePeriod = useStore((state) => state.changePeriod);

  const addEmployee = useStore((state) => state.addEmployee);
  const editEmployee = useStore((state) => state.editEmployee);
  const updateEmployeeDept = useStore((state) => state.updateEmployeeDept);
  const bulkImportEmployees = useStore((state) => state.bulkImportEmployees);
  const createPeriodArchive = useStore((state) => state.createPeriodArchive);

  // Local UI-only state
  const [selectedCoachingRosterEmployee, setSelectedCoachingRosterEmployee] = useState(null);
  const [prefillBuilderData, setPrefillBuilderData] = useState(null);
  const [prefillShadowEmployee, setPrefillShadowEmployee] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({
    overview: false,
    floorOps: false,
    coachingPractice: false,
    recordsSetup: false
  });

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSwUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  // Auto-expand category of active view
  useEffect(() => {
    if (activeView === 'dashboard') {
      setCollapsedCategories(prev => ({ ...prev, overview: false }));
    } else if (activeView === 'roster' || activeView === 'shadow' || activeView === 'floorLeader') {
      setCollapsedCategories(prev => ({ ...prev, floorOps: false }));
    } else if (activeView === 'roleplay' || activeView === 'coach') {
      setCollapsedCategories(prev => ({ ...prev, coachingPractice: false }));
    } else if (activeView === 'builder' || activeView === 'history' || activeView === 'playbook') {
      setCollapsedCategories(prev => ({ ...prev, recordsSetup: false }));
    }
  }, [activeView]);

  // Subscribe to real-time Cloud Sync
  useEffect(() => {
    if (!dbConnected) return;

    // Seed existing offline data from localStorage to cloud if cloud database is empty!
    const seedCloud = async () => {
      const savedSettings = localStorage.getItem('bby_playbook_settings');
      const savedGoals = localStorage.getItem('bby_dept_goals');
      const savedHistory = localStorage.getItem('bby_roster_history');
      const savedPeriod = localStorage.getItem('bby_active_period');
      const savedSessions = localStorage.getItem('bby_recent_sessions');
      const savedMetrics = localStorage.getItem('bby_metrics');
      const savedFollowUp = localStorage.getItem('bby_follow_up_tasks');
      const savedFloorLeaderShifts = localStorage.getItem('bby_floor_leader_shifts');
      const savedCoachingLogs = localStorage.getItem('bby_coaching_logs');

      await seedOfflineDataToCloud({
        activePeriod: savedPeriod || 'May 2026',
        rosterHistory: safeJsonParse(savedHistory, null),
        playbookSettings: safeJsonParse(savedSettings, null),
        deptGoals: safeJsonParse(savedGoals, null),
        recentSessions: safeJsonParse(savedSessions, null),
        metrics: safeJsonParse(savedMetrics, null),
        followUpTasks: safeJsonParse(savedFollowUp, null),
        floorLeaderShifts: safeJsonParse(savedFloorLeaderShifts, null),
        coachingLogs: safeJsonParse(savedCoachingLogs, null)
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
        if (!s.storePin) {
          s.storePin = '1234';
        }
        setPlaybookSettings(s);
      }
    });

    // Subscribe to department goals
    const unsubGoals = subscribeToDeptGoals((g) => {
      if (g) setDeptGoals(g);
    });

    // Subscribe to recent sessions
    const unsubSessions = subscribeToRecentSessions((s) => {
      if (s) setRecentSessions(s);
    });

    // Subscribe to metrics
    const unsubMetrics = subscribeToMetrics((m) => {
      if (m) setMetrics(m);
    });

    // Subscribe to follow-up tasks
    const unsubFollowUp = subscribeToFollowUpTasks((tasks) => {
      if (tasks) setFollowUpTasks(tasks);
    });

    // Subscribe to Floor Leader shifts
    const unsubFloorLeader = subscribeToFloorLeaderShifts((shifts) => {
      if (shifts) setFloorLeaderShifts(shifts);
    });

    // Subscribe to coaching logs sub-collection
    const unsubCoachingLogs = subscribeToCoachingLogs((logs) => {
      if (logs) {
        setCoachingLogs(logs);
        localStorage.setItem('bby_coaching_logs', JSON.stringify(logs));
      }
    });

    return () => {
      if (unsubPeriod) unsubPeriod();
      if (unsubRoster) unsubRoster();
      if (unsubPlaybook) unsubPlaybook();
      if (unsubGoals) unsubGoals();
      if (unsubSessions) unsubSessions();
      if (unsubMetrics) unsubMetrics();
      if (unsubFollowUp) unsubFollowUp();
      if (unsubFloorLeader) unsubFloorLeader();
      if (unsubCoachingLogs) unsubCoachingLogs();
    };
  }, [dbConnected]);

  // Roster Interactions
  const handleCoachEmployeeFromRoster = (emp) => {
    setSelectedCoachingRosterEmployee(emp);
    setActiveView('coach');
  };

  const handleCreateLogFromRoster = (emp) => {
    setPrefillBuilderData(emp);
    setActiveView('builder');
  };

  const handleShadowEmployeeFromRoster = (emp) => {
    setPrefillShadowEmployee(emp);
    setActiveView('shadow');
  };





  if (!isAuthenticated) {
    return (
      <Login 
        correctPin={storePin}
        onLoginSuccess={() => login(storePin)}
        dbConnected={dbConnected}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">BBY</div>
          <div className="logo-text">BlueCoach<span>AI</span></div>
        </div>

        {activeManager && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--border-glass)', 
            borderRadius: '16px', 
            padding: '0.85rem 1rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem'
          }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--bby-yellow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{activeManager.name}</span>
              <button 
                onClick={logout} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--error)', 
                  fontSize: '0.65rem', 
                  cursor: 'pointer', 
                  padding: 0,
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                Log Out
              </button>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{activeManager.role}</span>
          </div>
        )}

        <ul className="sidebar-menu">
          <li className="menu-group-header" onClick={() => toggleCategory('overview')}>
            <span>Overview</span>
            {collapsedCategories.overview ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </li>
          {!collapsedCategories.overview && (
            <>
              <li 
                className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                <LayoutDashboard className="menu-item-icon" /> Dashboard
              </li>
            </>
          )}

          <li className="menu-group-header" onClick={() => toggleCategory('floorOps')}>
            <span>Floor Operations</span>
            {collapsedCategories.floorOps ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </li>
          {!collapsedCategories.floorOps && (
            <>
              <li 
                className={`menu-item ${activeView === 'roster' ? 'active' : ''}`}
                onClick={() => setActiveView('roster')}
              >
                <ClipboardList className="menu-item-icon" /> Store Roster
              </li>
              <li 
                className={`menu-item ${activeView === 'shadow' ? 'active' : ''}`}
                onClick={() => setActiveView('shadow')}
              >
                <ShieldCheck className="menu-item-icon" /> Floor Shadowing
              </li>
              <li 
                className={`menu-item ${activeView === 'floorLeader' ? 'active' : ''}`}
                onClick={() => setActiveView('floorLeader')}
              >
                <Clock className="menu-item-icon" /> Floor Leader
              </li>
            </>
          )}

          <li className="menu-group-header" onClick={() => toggleCategory('coachingPractice')}>
            <span>Coaching & Practice</span>
            {collapsedCategories.coachingPractice ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </li>
          {!collapsedCategories.coachingPractice && (
            <>
              <li 
                className={`menu-item ${activeView === 'roleplay' ? 'active' : ''}`}
                onClick={() => setActiveView('roleplay')}
              >
                <Compass className="menu-item-icon" /> Consult Arena
              </li>
              <li 
                className={`menu-item ${activeView === 'coach' ? 'active' : ''}`}
                onClick={() => setActiveView('coach')}
              >
                <Users className="menu-item-icon" /> Coach Simulator
              </li>
            </>
          )}

          <li className="menu-group-header" onClick={() => toggleCategory('recordsSetup')}>
            <span>Records & Setup</span>
            {collapsedCategories.recordsSetup ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </li>
          {!collapsedCategories.recordsSetup && (
            <>
              <li 
                className={`menu-item ${activeView === 'builder' ? 'active' : ''}`}
                onClick={() => setActiveView('builder')}
              >
                <Sparkles className="menu-item-icon" /> Coaching Generator
              </li>
              <li 
                className={`menu-item ${activeView === 'history' ? 'active' : ''}`}
                onClick={() => setActiveView('history')}
              >
                <Archive className="menu-item-icon" /> History Hub
              </li>
              <li 
                className={`menu-item ${activeView === 'playbook' ? 'active' : ''}`}
                onClick={() => setActiveView('playbook')}
              >
                <BookOpen className="menu-item-icon" /> Playbook Studio
              </li>
            </>
          )}
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
            recentSessions={recentSessions}
            onNavigate={setActiveView}
            roster={rosterHistory[activePeriod] || []}
            followUpTasks={followUpTasks}
            onCompleteFollowUpTask={completeFollowUpTask}
            deptGoals={deptGoals}
            onCoachEmployee={handleCoachEmployeeFromRoster}
            onCreateLog={handleCreateLogFromRoster}
            onShadowEmployee={handleShadowEmployeeFromRoster}
            floorLeaderShifts={floorLeaderShifts}
            coachingLogs={coachingLogs}
            activePeriod={activePeriod}
            rosterHistory={rosterHistory}
          />
        )}

        {activeView === 'shadow' && (
          <LiveFloorShadow 
            roster={rosterHistory[activePeriod] || []}
            onLogCoachingSession={logCoachingSession}
            onAddFollowUpTask={addFollowUpTask}
            onNavigate={setActiveView}
            preselectedEmployee={prefillShadowEmployee}
            clearPreselectedEmployee={() => setPrefillShadowEmployee(null)}
          />
        )}

        {activeView === 'roster' && (
          <StoreRoster 
            roster={rosterHistory[activePeriod] || []}
            activePeriod={activePeriod}
            rosterHistory={rosterHistory}
            onChangePeriod={changePeriod}
            onCoachEmployee={handleCoachEmployeeFromRoster}
            onCreateLog={handleCreateLogFromRoster}
            deptGoals={deptGoals}
            onUpdateEmployeeDept={updateEmployeeDept}
            onAddEmployee={addEmployee}
            onEditEmployee={editEmployee}
            onBulkImportEmployees={bulkImportEmployees}
            onCreatePeriod={createPeriodArchive}
            coachingLogs={coachingLogs}
            followUpTasks={followUpTasks}
          />
        )}
        
        {activeView === 'roleplay' && (
          <RoleplayCenter 
            playbookSettings={playbookSettings}
            onCompleteRoleplay={completeRoleplay}
            customScenarios={customScenarios}
          />
        )}



        {activeView === 'coach' && (
          <CoachSimulator 
            playbookSettings={playbookSettings}
            customScenarios={customScenarios}
            preselectedEmployee={selectedCoachingRosterEmployee}
            clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
            prefillBuilderData={prefillBuilderData}
            clearPrefillBuilderData={() => setPrefillBuilderData(null)}
            onImportScenario={importCustomScenario}
            onLogCoachingSession={logCoachingSession}
            initialTab="sim"
          />
        )}

        {activeView === 'builder' && (
          <CoachSimulator 
            playbookSettings={playbookSettings}
            customScenarios={customScenarios}
            preselectedEmployee={selectedCoachingRosterEmployee}
            clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
            prefillBuilderData={prefillBuilderData}
            clearPrefillBuilderData={() => setPrefillBuilderData(null)}
            onImportScenario={importCustomScenario}
            onLogCoachingSession={logCoachingSession}
            initialTab="builder"
          />
        )}

        {activeView === 'playbook' && (
          <PlaybookStudio 
            playbookSettings={playbookSettings}
            onSaveSettings={saveSettings}
            deptGoals={deptGoals}
            onSaveDeptGoals={saveDeptGoals}
            customScenarios={customScenarios}
            onAddCustomScenario={importCustomScenario}
            onDeleteCustomScenario={deleteCustomScenario}
            rosterHistory={rosterHistory}
            coachingLogs={coachingLogs}
            followUpTasks={followUpTasks}
            floorLeaderShifts={floorLeaderShifts}
          />
        )}

        {activeView === 'floorLeader' && (
          <FloorLeaderTracker 
            shifts={floorLeaderShifts}
            onSaveShift={saveFloorLeaderShift}
            onDeleteShift={deleteFloorLeaderShift}
            roster={rosterHistory[activePeriod] || []}
            activeManager={activeManager}
          />
        )}

        {activeView === 'history' && (
          <CoachingHistory 
            coachingLogs={coachingLogs}
            onDeleteLog={deleteCoachingLog}
          />
        )}
      </main>

      {/* Mobile-Only Bottom Navigation Bar */}
      <div className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dash</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeView === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveView('roster')}
        >
          <ClipboardList size={20} />
          <span>Roster</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeView === 'shadow' ? 'active' : ''}`}
          onClick={() => setActiveView('shadow')}
        >
          <ShieldCheck size={20} />
          <span>Shadow</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeView === 'floorLeader' ? 'active' : ''}`}
          onClick={() => setActiveView('floorLeader')}
        >
          <Clock size={20} />
          <span>Floor Lead</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeView === 'roleplay' ? 'active' : ''}`}
          onClick={() => setActiveView('roleplay')}
        >
          <Compass size={20} />
          <span>Arena</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeView === 'coach' || activeView === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveView('coach')}
        >
          <Users size={20} />
          <span>Coach</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          <Archive size={20} />
          <span>History</span>
        </button>
      </div>



      {/* Service Worker Update Toast Banner */}
      {swUpdateAvailable && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#111625',
          border: '1.5px solid var(--bby-blue)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 8px 32px rgba(0, 70, 190, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '320px',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>App Update Available</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              A new version of BlueCoach AI is available. Refresh to load new sales tools and metrics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem' }}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => setSwUpdateAvailable(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

