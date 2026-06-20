// @ts-nocheck
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
const Dashboard = lazy(() => import('./components/Dashboard'));
const StoreRoster = lazy(() => import('./components/StoreRoster'));
const RoleplayCenter = lazy(() => import('./components/RoleplayCenter'));
const CoachSimulator = lazy(() => import('./components/CoachSimulator'));
const PlaybookStudio = lazy(() => import('./components/PlaybookStudio'));
const CoachingHistory = lazy(() => import('./components/CoachingHistory'));
const LiveFloorShadow = lazy(() => import('./components/LiveFloorShadow'));
import LoginGate from './components/LoginGate';
import AdvisorDashboard from './components/AdvisorDashboard';
const FloorLeaderTracker = lazy(() => import('./components/FloorLeaderTracker'));
const TrendReporting = lazy(() => import('./components/TrendReporting'));
import { Compass, Users, BookOpen, LayoutDashboard, Sparkles, ShieldCheck, ClipboardList, Archive, Clock, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { 
  subscribeToActivePeriod, 
  subscribeToRosterHistory, 
  subscribeToPlaybookSettings, 
  subscribeToDeptGoals, 
  subscribeToRecentSessions,
  subscribeToMetrics,
  subscribeToFollowUpTasks,
  subscribeToFloorLeaderShifts,
  subscribeToCoachingLogs,
  subscribeToManagers,
  subscribeToDailySnapshots
} from './services/firebase';
import { AppProvider, useApp } from './context/AppContext';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

// Safe JSON Parse helper to prevent localStorage corruption crashes
const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    toast.error('Local data parsing failed, restoring defaults.');
    console.error('JSON parsing failed:', e);
    return fallback;
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Toaster position="top-right" />
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
    dbConnected, 
    isAuthenticated,
    storePin,
    login,
    loginAdvisor
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
  const activeAdvisor = useStore((state) => state.activeAdvisor);
  const managers = useStore((state) => state.managers);
  const storeId = useStore((state) => state.storeId);

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
  const saveManagers = useStore((state) => state.saveManagers);

  const addFollowUpTask = useStore((state) => state.addFollowUpTask);
  const completeFollowUpTask = useStore((state) => state.completeFollowUpTask);
  const saveSettings = useStore((state) => state.saveSettings);
  const importCustomScenario = useStore((state) => state.importCustomScenario);
  const deleteCustomScenario = useStore((state) => state.deleteCustomScenario);
  const saveFloorLeaderShift = useStore((state) => state.saveFloorLeaderShift);
  const deleteFloorLeaderShift = useStore((state) => state.deleteFloorLeaderShift);
  const logCoachingSession = useStore((state) => state.logCoachingSession);
  const deleteCoachingLog = useStore((state) => state.deleteCoachingLog);
  const completeRoleplay = useStore((state) => state.completeRoleplay);
  const saveDeptGoals = useStore((state) => state.saveDeptGoals);
  const changePeriod = useStore((state) => state.changePeriod);

  const addEmployee = useStore((state) => state.addEmployee);
  const editEmployee = useStore((state) => state.editEmployee);
  const deleteEmployee = useStore((state) => state.deleteEmployee);
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!dbConnected || !isAuthenticated || !storeId) return;

    // Subscribe to active period
    const unsubPeriod = subscribeToActivePeriod(storeId, (p) => {
      if (p) setActivePeriod(p);
    });

    // Subscribe to roster history
    const unsubRoster = subscribeToRosterHistory(storeId, (h) => {
      if (h) {
        setRosterHistory(h);
      }
    });

    // Subscribe to playbook settings
    const unsubPlaybook = subscribeToPlaybookSettings(storeId, (s) => {
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
    const unsubGoals = subscribeToDeptGoals(storeId, (g) => {
      if (g) setDeptGoals(g);
    });

    // Subscribe to recent sessions
    const unsubSessions = subscribeToRecentSessions(storeId, (s) => {
      if (s) setRecentSessions(s);
    });

    // Subscribe to metrics
    const unsubMetrics = subscribeToMetrics(storeId, (m) => {
      if (m) setMetrics(m);
    });

    // Subscribe to follow-up tasks
    const unsubFollowUp = subscribeToFollowUpTasks(storeId, (tasks) => {
      if (tasks) setFollowUpTasks(tasks);
    });

    // Subscribe to Floor Leader shifts
    const unsubFloorLeader = subscribeToFloorLeaderShifts(storeId, (shifts) => {
      if (shifts) {
        const localShifts = useStore.getState().floorLeaderShifts || [];
        let deletedIds = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem('bby_deleted_shifts') || '[]');
        } catch (e) {
          console.error(e);
        }

        // Merge lists of shifts by ID and lastUpdated
        const shiftMap = {};
        
        // 1. Populate with local shifts (filtering out deleted ones)
        localShifts.forEach(s => {
          if (s && s.id && !deletedIds.includes(s.id)) {
            shiftMap[s.id] = s;
          }
        });

        // 2. Merge with cloud shifts (filtering out deleted ones)
        shifts.forEach(cloudShift => {
          if (!cloudShift || !cloudShift.id || deletedIds.includes(cloudShift.id)) return;
          const localShift = shiftMap[cloudShift.id];
          if (localShift) {
            const localTime = localShift.lastUpdated || 0;
            const cloudTime = cloudShift.lastUpdated || 0;
            if (cloudTime >= localTime) {
              shiftMap[cloudShift.id] = cloudShift;
            }
          } else {
            shiftMap[cloudShift.id] = cloudShift;
          }
        });

        const mergedShifts = Object.values(shiftMap);
        // Sort by timestamp desc to preserve newest shifts at the top
        mergedShifts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        setFloorLeaderShifts(mergedShifts);
        localStorage.setItem('bby_floor_leader_shifts', JSON.stringify(mergedShifts));
      }
    });

    // Subscribe to coaching logs sub-collection
    const unsubCoachingLogs = subscribeToCoachingLogs(storeId, (logs) => {
      if (logs) {
        setCoachingLogs(logs);
        localStorage.setItem('bby_coaching_logs', JSON.stringify(logs));
      }
    });
 
    // Subscribe to managers
    const unsubManagers = subscribeToManagers(storeId, (m) => {
      if (m) useStore.getState().setManagers(m);
    });

    // Subscribe to daily snapshots
    const unsubDailySnapshots = subscribeToDailySnapshots(storeId, (s) => {
      if (s) useStore.getState().setDailySnapshots(s);
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
      if (unsubManagers) unsubManagers();
      if (unsubDailySnapshots) unsubDailySnapshots();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbConnected, isAuthenticated, storeId]);

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
      <LoginGate 
        correctPin={storePin}
        onLoginSuccess={(enteredPin, storeId, type, advisorData) => {
          if (type === 'supervisor') {
            login(enteredPin, storeId);
          } else if (type === 'advisor') {
            loginAdvisor(advisorData);
          }
        }}
        dbConnected={dbConnected}
        managers={managers}
        roster={rosterHistory[activePeriod] || []}
      />
    );
  }

  if (activeAdvisor && !activeManager) {
    return (
      <div className="layout-container dark-theme" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--bby-blue)', padding: '0.4rem', borderRadius: '8px' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>FloorVision</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {dbConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 6px var(--success)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Cloud Sync</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: '12px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--bby-yellow)', borderRadius: '50%', boxShadow: '0 0 6px var(--bby-yellow)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--bby-yellow)', fontWeight: 600 }}>Local Sandbox</span>
              </div>
            )}
            <button 
              onClick={() => useStore.getState().logout()} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              Log Out
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'roleplay' ? (
            <RoleplayCenter />
          ) : (
            <AdvisorDashboard 
              employee={activeAdvisor}
              coachingLogs={coachingLogs}
              activePeriod={activePeriod}
              deptGoals={deptGoals}
              onNavigate={setActiveView}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeView={activeView as string}
        setActiveView={setActiveView}
        activeManager={activeManager}
        logout={logout}
        toggleCategory={toggleCategory}
        collapsedCategories={collapsedCategories}
        dbConnected={dbConnected}
        playbookSettings={playbookSettings}
        apiKey={apiKey}
      />
      {/* Main View Display Port */}
      <main className="main-content">
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--bby-yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading Module...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        }>
          <Routes>
            <Route path="/" element={
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
                activeManager={activeManager}
              />
            } />
            <Route path="/shadow" element={
              <LiveFloorShadow 
                roster={rosterHistory[activePeriod] || []}
                onLogCoachingSession={logCoachingSession}
                onAddFollowUpTask={addFollowUpTask}
                onNavigate={setActiveView}
                preselectedEmployee={prefillShadowEmployee}
                clearPreselectedEmployee={() => setPrefillShadowEmployee(null)}
                playbookSettings={playbookSettings}
                apiKey={apiKey}
              />
            } />
            <Route path="/roster" element={
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
                onDeleteEmployee={deleteEmployee}
                onBulkImportEmployees={bulkImportEmployees}
                onCreatePeriod={createPeriodArchive}
                coachingLogs={coachingLogs}
                followUpTasks={followUpTasks}
                apiKey={apiKey}
              />
            } />
            <Route path="/trends" element={<TrendReporting />} />
            <Route path="/roleplay" element={
              <RoleplayCenter 
                playbookSettings={playbookSettings}
                onCompleteRoleplay={completeRoleplay}
                customScenarios={customScenarios}
              />
            } />
            <Route path="/coach" element={
              <CoachSimulator 
                playbookSettings={playbookSettings}
                customScenarios={customScenarios}
                preselectedEmployee={selectedCoachingRosterEmployee}
                clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
                prefillBuilderData={prefillBuilderData}
                clearPrefillBuilderData={() => setPrefillBuilderData(null)}
                onImportScenario={importCustomScenario}
                onLogCoachingSession={logCoachingSession}
                coachingLogs={coachingLogs}
                roster={rosterHistory[activePeriod] || []}
                initialTab="sim"
              />
            } />
            <Route path="/builder" element={
              <CoachSimulator 
                playbookSettings={playbookSettings}
                customScenarios={customScenarios}
                preselectedEmployee={selectedCoachingRosterEmployee}
                clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
                prefillBuilderData={prefillBuilderData}
                clearPrefillBuilderData={() => setPrefillBuilderData(null)}
                onImportScenario={importCustomScenario}
                onLogCoachingSession={logCoachingSession}
                coachingLogs={coachingLogs}
                initialTab="builder"
              />
            } />
            <Route path="/playbook" element={
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
                managers={managers}
                onSaveManagers={saveManagers}
              />
            } />
            <Route path="/floorLeader" element={
              <FloorLeaderTracker 
                shifts={floorLeaderShifts}
                onSaveShift={saveFloorLeaderShift}
                onDeleteShift={deleteFloorLeaderShift}
                roster={rosterHistory[activePeriod] || []}
                activeManager={activeManager}
                onAddEmployee={addEmployee}
              />
            } />
            <Route path="/history" element={
              <CoachingHistory 
                coachingLogs={coachingLogs}
                onDeleteLog={deleteCoachingLog}
              />
            } />
            <Route path="*" element={<Dashboard metrics={metrics} recentSessions={recentSessions} onNavigate={setActiveView} roster={rosterHistory[activePeriod] || []} followUpTasks={followUpTasks} onCompleteFollowUpTask={completeFollowUpTask} deptGoals={deptGoals} onCoachEmployee={handleCoachEmployeeFromRoster} onCreateLog={handleCreateLogFromRoster} onShadowEmployee={handleShadowEmployeeFromRoster} floorLeaderShifts={floorLeaderShifts} coachingLogs={coachingLogs} activePeriod={activePeriod} rosterHistory={rosterHistory} activeManager={activeManager} />} />
          </Routes>
        </Suspense>
      </main>

      <MobileNav 
        activeView={activeView as string}
        setActiveView={setActiveView}
      />
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
              A new version of FloorVision is available. Refresh to load new sales tools and metrics.
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


