
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
import AssociateProfileHeader from './components/AssociateProfile/AssociateProfileHeader';
import { subscribeToActivePeriod } from './services/firebase';

import { useStore } from './store/useStore';
import { useShallow } from 'zustand/react/shallow';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import AdvisorLayout from './components/layout/AdvisorLayout';
import SyncManager from './components/SyncManager';
import ServiceWorkerBanner from './components/ServiceWorkerBanner';
import { useCategoryAutoExpand } from './hooks/useCategoryAutoExpand';
import CommandCenter from './pages/CommandCenter';


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

  const dbConnected = useStore((state) => state.dbConnected);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const storePin = useStore((state) => state.storePin);
  const activePeriod = useStore(state => state.activePeriod);

  if (location.pathname === '/test-profile-header') {
    return (
      <div className="p-xl bg-obsidian min-h-screen">
        <h1 className="text-white mb-md">Test Harness: AssociateProfileHeader</h1>
        <div className="mb-xl border border-glass p-md rounded-lg">
          <h2 className="text-white mb-sm">1. Null Employee</h2>
          <AssociateProfileHeader employee={null as any} rosterHistory={{}} activePeriod="June 2026" onClose={() => {}} />
        </div>
        <div className="mb-xl border border-glass p-md rounded-lg">
          <h2 className="text-white mb-sm">2. Focus 5 & Accelerating CVI</h2>
          <AssociateProfileHeader 
            employee={{ id: 'test1', name: 'Test Focus 5', dept: 'Computing', focus5: true, memberships: 2 } as any} 
            rosterHistory={{ 'May 2026': { 'test1': { id: 'test1', memberships: 1 } as any }, 'June 2026': {} }} 
            activePeriod="June 2026" 
            onClose={() => {}} 
          />
        </div>
        <div className="mb-xl border border-glass p-md rounded-lg">
          <h2 className="text-white mb-sm">3. Needs Review CVI</h2>
          <AssociateProfileHeader 
            employee={{ id: 'test2', name: 'Test Needs Review', dept: 'Computing', focus5: false, memberships: 1 } as any} 
            rosterHistory={{ 'May 2026': { 'test2': { id: 'test2', memberships: 2 } as any }, 'June 2026': {} }} 
            activePeriod="June 2026" 
            onClose={() => {}} 
          />
        </div>
        <div className="mb-xl border border-glass p-md rounded-lg">
          <h2 className="text-white mb-sm">4. Neutral CVI</h2>
          <AssociateProfileHeader 
            employee={{ id: 'test3', name: 'Test Neutral', dept: 'Computing', focus5: false, memberships: 1 } as any} 
            rosterHistory={{ 'May 2026': { 'test3': { id: 'test3', memberships: 1 } as any }, 'June 2026': {} }} 
            activePeriod="June 2026" 
            onClose={() => {}} 
          />
        </div>
      </div>
    );
  }

  // Zustand Store Actions
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
      <AdvisorLayout>
        <Routes>
          <Route path="/roster" element={<StoreRosterPage />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="*" element={
            <AdvisorDashboardPage 
              employee={activeAdvisor}
              onNavigate={setActiveView}
            />
          } />
        </Routes>
      </AdvisorLayout>
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
            <div className="w-50px h-50px border-4 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
            <span className="text-secondary text-sm font-semibold uppercase tracking-widest animate-fade-in">Loading Module...</span>
          </div>
        }>
          <Routes>
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/test-profile-header" element={
            <div className="p-xl bg-obsidian min-h-screen">
              <h1 className="text-white mb-md">Test Harness: AssociateProfileHeader</h1>
              <div className="mb-xl border border-glass p-md rounded-lg">
                <h2 className="text-white mb-sm">1. Null Employee</h2>
                <AssociateProfileHeader employee={null as any} rosterHistory={{}} activePeriod="June 2026" onClose={() => {}} />
              </div>
              <div className="mb-xl border border-glass p-md rounded-lg">
                <h2 className="text-white mb-sm">2. Focus 5 & Accelerating CVI</h2>
                <AssociateProfileHeader 
                  employee={{ id: 'test1', name: 'Test Focus 5', dept: 'Computing', focus5: true, memberships: 2 } as any} 
                  rosterHistory={{ 'May 2026': { 'test1': { id: 'test1', memberships: 1 } as any } }} 
                  activePeriod="June 2026" 
                  onClose={() => {}} 
                />
              </div>
              <div className="mb-xl border border-glass p-md rounded-lg">
                <h2 className="text-white mb-sm">3. Needs Review CVI</h2>
                <AssociateProfileHeader 
                  employee={{ id: 'test2', name: 'Test Needs Review', dept: 'Computing', focus5: false, memberships: 1 } as any} 
                  rosterHistory={{ 'May 2026': { 'test2': { id: 'test2', memberships: 2 } as any } }} 
                  activePeriod="June 2026" 
                  onClose={() => {}} 
                />
              </div>
              <div className="mb-xl border border-glass p-md rounded-lg">
                <h2 className="text-white mb-sm">4. Neutral CVI</h2>
                <AssociateProfileHeader 
                  employee={{ id: 'test3', name: 'Test Neutral', dept: 'Computing', focus5: false, memberships: 1 } as any} 
                  rosterHistory={{ 'May 2026': { 'test3': { id: 'test3', memberships: 1 } as any } }} 
                  activePeriod="June 2026" 
                  onClose={() => {}} 
                />
              </div>
            </div>
          } />

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

      <MobileNav />
      <ServiceWorkerBanner />
    </div>
  );
}


