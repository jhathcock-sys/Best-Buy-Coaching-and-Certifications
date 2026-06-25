
import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StoreRosterPage = lazy(() => import('./pages/StoreRosterPage'));
const RoleplayCenterPage = lazy(() => import('./pages/RoleplayCenterPage'));
const CoachSimulatorPage = lazy(() => import('./pages/CoachSimulatorPage'));
const PlaybookStudioPage = lazy(() => import('./pages/PlaybookStudioPage'));
const CoachingHistoryPage = lazy(() => import('./pages/CoachingHistoryPage'));
const LiveFloorShadowPage = lazy(() => import('./pages/LiveFloorShadowPage'));
const AuraHUDPage = lazy(() => import('./pages/AuraHUDPage'));
import LoginGate from './components/LoginGate';
import AuthGate from './components/AuthGate';
const AdvisorDashboardPage = lazy(() => import('./pages/AdvisorDashboardPage'));
const FloorLeaderTrackerPage = lazy(() => import('./pages/FloorLeaderTrackerPage'));
const TrendReportingPage = lazy(() => import('./pages/TrendReportingPage'));
const BreakroomTVPage = lazy(() => import('./pages/BreakroomTVPage'));
const DailyLineupBuilderPage = lazy(() => import('./pages/DailyLineupBuilderPage'));
import { Compass, Users, BookOpen, LayoutDashboard, Sparkles, ShieldCheck, ClipboardList, Archive, Clock, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { subscribeToActivePeriod } from './services/firebase';

import { useStore } from './store/useStore';
import { useShallow } from 'zustand/react/shallow';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import SyncManager from './components/SyncManager';
import ServiceWorkerBanner from './components/ServiceWorkerBanner';
import { useCategoryAutoExpand } from './hooks/useCategoryAutoExpand';


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
  const setActiveView = useCallback((view: string) => navigate(view === 'dashboard' ? '/' : `/${view}`), [navigate]);
  
  // Zustand Store Selectors
  const playbookSettings = useStore((state) => state.playbookSettings);
  const isPlaybookHydrated = useStore((state) => state.isPlaybookHydrated);
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

  // Zustand UI State
  const selectedCoachingRosterEmployee = useStore((state) => state.selectedCoachingRosterEmployee);
  const setSelectedCoachingRosterEmployee = useStore((state) => state.setSelectedCoachingRosterEmployee);
  
  const prefillBuilderData = useStore((state) => state.prefillBuilderData);
  const setPrefillBuilderData = useStore((state) => state.setPrefillBuilderData);
  
  const prefillShadowEmployee = useStore((state) => state.prefillShadowEmployee);
  const setPrefillShadowEmployee = useStore((state) => state.setPrefillShadowEmployee);
  
  const collapsedCategories = useStore((state) => state.collapsedCategories);
  const setCollapsedCategories = useStore((state) => state.setCollapsedCategories);
  const toggleCategory = useStore((state) => state.toggleCategory);

  useCategoryAutoExpand(activeView, setCollapsedCategories);



  // Roster Interactions
  const handleCoachEmployeeFromRoster = useCallback((emp) => {
    setSelectedCoachingRosterEmployee(emp);
    setActiveView('coach');
  }, [setSelectedCoachingRosterEmployee, setActiveView]);

  const handleCreateLogFromRoster = useCallback((emp) => {
    setPrefillBuilderData(emp);
    setActiveView('builder');
  }, [setPrefillBuilderData, setActiveView]);

  const handleShadowEmployeeFromRoster = useCallback((emp) => {
    setPrefillShadowEmployee(emp);
    setActiveView('shadow');
  }, [setPrefillShadowEmployee, setActiveView]);

  if (!isAuthenticated) {
    return (
      <>
        <SyncManager />
        <LoginGate 
        correctPin={playbookSettings?.storePin || storePin}
        isHydrating={dbConnected && !isPlaybookHydrated}
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
              data-testid="advisor-logout-btn"
            >
              Log Out
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Suspense fallback={
            <div className="flex-center flex-column w-full h-full gap-md">
              <div style={{ width: '50px', height: '50px', border: '4px solid var(--white-alpha-10)', borderTopColor: 'var(--bby-yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', animation: 'fadeIn 0.5s ease' }}>Loading Module...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            </div>
          }>
            <Routes>
              <Route path="/roleplay" element={<RoleplayCenterPage />} />
              <Route path="*" element={
                <AdvisorDashboardPage 
                  employee={activeAdvisor}
                  onNavigate={setActiveView}
                />
              } />
            </Routes>
          </Suspense>
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
            <Route path="/aura" element={
              <AuraHUDPage 
                onCoachEmployee={handleCoachEmployeeFromRoster}
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
            <Route path="/playbook" element={
              <AuthGate requireManager={true}>
                <PlaybookStudioPage />
              </AuthGate>
            } />
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
      <ServiceWorkerBanner />
    </div>
  );
}


