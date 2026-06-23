
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StoreRosterPage = lazy(() => import('./pages/StoreRosterPage'));
const RoleplayCenterPage = lazy(() => import('./pages/RoleplayCenterPage'));
const CoachSimulatorPage = lazy(() => import('./pages/CoachSimulatorPage'));
const PlaybookStudioPage = lazy(() => import('./pages/PlaybookStudioPage'));
const CoachingHistoryPage = lazy(() => import('./pages/CoachingHistoryPage'));
const LiveFloorShadowPage = lazy(() => import('./pages/LiveFloorShadowPage'));
import LoginGate from './components/LoginGate';
import AdvisorDashboardPage from './pages/AdvisorDashboardPage';
const FloorLeaderTrackerPage = lazy(() => import('./pages/FloorLeaderTrackerPage'));
const TrendReportingPage = lazy(() => import('./pages/TrendReportingPage'));
const BreakroomTVPage = lazy(() => import('./pages/BreakroomTVPage'));
const DailyLineupBuilderPage = lazy(() => import('./pages/DailyLineupBuilderPage'));
import { Compass, Users, BookOpen, LayoutDashboard, Sparkles, ShieldCheck, ClipboardList, Archive, Clock, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { subscribeToActivePeriod } from './services/firebase';

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
      <Toaster position="top-right" />
      <AppContent />
    </ErrorBoundary>
  );
}


function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const setActiveView = (view: string) => navigate(view === 'dashboard' ? '/' : `/${view}`);
  
  // Zustand Store Selectors
  const playbookSettings = useStore((state) => state.playbookSettings);
  const activeManager = useStore((state) => state.activeManager);
  const activeAdvisor = useStore((state) => state.activeAdvisor);

  // Zustand Store Actions
  const dbConnected = useStore((state) => state.dbConnected);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const storePin = useStore((state) => state.storePin);
  const login = useStore((state) => state.login);
  const loginAdvisor = useStore((state) => state.loginAdvisor);
  const logout = useStore((state) => state.logout);
  const apiKey = useStore((state) => state.apiKey);

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
      <>
        <SyncManager />
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
      />
      </>
    );
  }

  if (activeAdvisor && !activeManager) {
    return (
      <div className="layout-container dark-theme flex-column h-full" style={{ overflow: 'hidden' }}>
        <div className="flex-between p-md" style={{ background: 'var(--white-alpha-05)', borderBottom: '1px solid var(--border-glass)' }}>
          <div className="flex-center gap-sm">
            <div className="p-sm" style={{ background: 'var(--bby-blue)', borderRadius: '8px' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>FloorVision</span>
          </div>
          <div className="flex-center gap-md">
            {dbConnected ? (
              <div className="badge-sync">
                <span className="badge-sync-dot" />
                <span className="badge-sync-text">Cloud Sync</span>
              </div>
            ) : (
              <div className="badge-sandbox">
                <span className="badge-sandbox-dot" />
                <span className="badge-sandbox-text">Local Sandbox</span>
              </div>
            )}
            <button 
              onClick={() => useStore.getState().logout()} 
              className="btn btn-secondary"
            >
              Log Out
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/roleplay" element={<RoleplayCenterPage />} />
            <Route path="*" element={
              <AdvisorDashboardPage 
                employee={activeAdvisor}
                onNavigate={setActiveView}
              />
            } />
          </Routes>
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
          <div className="flex-center flex-column w-full h-full gap-md">
            <div style={{ width: '50px', height: '50px', border: '4px solid var(--white-alpha-10)', borderTopColor: 'var(--bby-yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', animation: 'fadeIn 0.5s ease' }}>Loading Module...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </div>
        }>
          <Routes>
            <Route path="/" element={
              <DashboardPage 
                onNavigate={setActiveView}
                onCoachEmployee={handleCoachEmployeeFromRoster}
                onShadowEmployee={handleShadowEmployeeFromRoster}
              />
            } />
            <Route path="/dashboard" element={
              <DashboardPage 
                onNavigate={setActiveView}
                onCoachEmployee={handleCoachEmployeeFromRoster}
                onShadowEmployee={handleShadowEmployeeFromRoster}
              />
            } />
            <Route path="/roster" element={
              <StoreRosterPage 
                onCoachEmployee={handleCoachEmployeeFromRoster}
                onCreateLog={handleCreateLogFromRoster}
              />
            } />
            <Route path="/shadow" element={
              <LiveFloorShadowPage 
                onNavigate={setActiveView}
                preselectedEmployee={prefillShadowEmployee}
                clearPreselectedEmployee={() => setPrefillShadowEmployee(null)}
              />
            } />
            <Route path="/dailyLineup" element={<DailyLineupBuilderPage />} />
            <Route path="/floorLeader" element={<FloorLeaderTrackerPage />} />
            <Route path="/trends" element={<TrendReportingPage />} />
            <Route path="/tv" element={
              <BreakroomTVPage onClose={() => setActiveView('dashboard')} />
            } />
            <Route path="/roleplay" element={<RoleplayCenterPage />} />
            <Route path="/coach" element={
              <CoachSimulatorPage 
                preselectedEmployee={selectedCoachingRosterEmployee}
                clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
                prefillBuilderData={prefillBuilderData}
                clearPrefillBuilderData={() => setPrefillBuilderData(null)}
                initialTab="sim"
              />
            } />
            <Route path="/builder" element={
              <CoachSimulatorPage 
                preselectedEmployee={selectedCoachingRosterEmployee}
                clearPreselectedEmployee={() => setSelectedCoachingRosterEmployee(null)}
                prefillBuilderData={prefillBuilderData}
                clearPrefillBuilderData={() => setPrefillBuilderData(null)}
                initialTab="builder"
              />
            } />
            <Route path="/history" element={<CoachingHistoryPage />} />
            <Route path="/playbook" element={<PlaybookStudioPage />} />
            <Route path="*" element={
              <DashboardPage 
                onNavigate={setActiveView}
                onCoachEmployee={handleCoachEmployeeFromRoster}
                onShadowEmployee={handleShadowEmployeeFromRoster}
              />
            } />
          </Routes>
        </Suspense>
      </main>

      <MobileNav 
        activeView={activeView as string}
        setActiveView={setActiveView}
      />
      {/* Service Worker Update Toast Banner */}
      {swUpdateAvailable && (
        <div className="glass-card" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '1.25rem',
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
          <div className="flex-center gap-sm">
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


