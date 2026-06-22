
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
const BreakroomTV = lazy(() => import('./components/BreakroomTV'));
const DailyLineupBuilder = lazy(() => import('./components/DailyLineupBuilder'));
import { Compass, Users, BookOpen, LayoutDashboard, Sparkles, ShieldCheck, ClipboardList, Archive, Clock, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { subscribeToActivePeriod } from './services/firebase';
import { AppProvider, useApp } from './context/AppContext';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import SyncManager from './components/SyncManager';

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
  const activeManager = useStore((state) => state.activeManager);
  const activeAdvisor = useStore((state) => state.activeAdvisor);
  const managers = useStore((state) => state.managers);

  // Zustand Store Actions
  const logout = useStore((state) => state.logout);

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
    setTimeout(() => {
      if (activeView === 'dashboard') {
        setCollapsedCategories(prev => ({ ...prev, overview: false }));
      } else if (activeView === 'roster' || activeView === 'shadow' || activeView === 'floorLeader') {
        setCollapsedCategories(prev => ({ ...prev, floorOps: false }));
      } else if (activeView === 'roleplay' || activeView === 'coach') {
        setCollapsedCategories(prev => ({ ...prev, coachingPractice: false }));
      } else if (activeView === 'builder' || activeView === 'history' || activeView === 'playbook') {
        setCollapsedCategories(prev => ({ ...prev, recordsSetup: false }));
      }
    }, 0);
  }, [activeView]);



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
        correctPin={playbookSettings?.storePin || storePin}
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
              onNavigate={setActiveView}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <SyncManager />
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
          {activeView === 'dashboard' && (
            <Dashboard 
              onNavigate={setActiveView}
              onCoachEmployee={handleCoachEmployeeFromRoster}
              onShadowEmployee={handleShadowEmployeeFromRoster}
            />
          )}

          {activeView === 'roster' && (
            <StoreRoster 
              onCoachEmployee={handleCoachEmployeeFromRoster}
              onCreateLog={handleCreateLogFromRoster}
            />
          )}

          {activeView === 'shadow' && (
            <LiveFloorShadow 
              onNavigate={setActiveView}
              preselectedEmployee={prefillShadowEmployee}
              clearPreselectedEmployee={() => setPrefillShadowEmployee(null)}
            />
          )}

          {activeView === 'dailyLineup' && (
            <DailyLineupBuilder />
          )}

          {activeView === 'floorLeader' && (
            <FloorLeaderTracker />
          )}

          {activeView === 'trends' && <TrendReporting />}

          {activeView === 'tv' && (
            <BreakroomTV onClose={() => setActiveView('dashboard')} />
          )}

          {activeView === 'roleplay' && (
            <RoleplayCenter />
          )}

          {activeView === 'coach' && (
            <CoachSimulator 
              preselectedEmployee={selectedCoachingRosterEmployee}
              clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
              prefillBuilderData={prefillBuilderData}
              clearPrefillBuilderData={() => setPrefillBuilderData(null)}
              initialTab="sim"
            />
          )}

          {activeView === 'builder' && (
            <CoachSimulator 
              preselectedEmployee={selectedCoachingRosterEmployee}
              clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
              prefillBuilderData={prefillBuilderData}
              clearPrefillBuilderData={() => setPrefillBuilderData(null)}
              initialTab="builder"
            />
          )}

          {activeView === 'history' && (
            <CoachingHistory />
          )}

          {activeView === 'playbook' && (
            <PlaybookStudio />
          )}
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


