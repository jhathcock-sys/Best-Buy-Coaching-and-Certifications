
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
import { Employee } from './types';

import { useStore } from './store/useStore';
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
      <SyncManager />
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
  const handleCoachEmployeeFromRoster = useCallback((emp: Employee) => {
    setSelectedCoachingRosterEmployee(emp);
    setActiveView('coach');
  }, [setSelectedCoachingRosterEmployee, setActiveView]);

  const handleCreateLogFromRoster = useCallback((emp: Employee) => {
    setPrefillBuilderData(emp);
    setActiveView('builder');
  }, [setPrefillBuilderData, setActiveView]);

  const handleShadowEmployeeFromRoster = useCallback((emp: Employee) => {
    setPrefillShadowEmployee(emp);
    setActiveView('shadow');
  }, [setPrefillShadowEmployee, setActiveView]);

  if (!isAuthenticated) {
    return (
      <>
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
    <div className="app-container" data-testid="app-container">
      <Sidebar />
      {/* Main View Display Port */}
      <main className="main-content" data-testid="main-content">
        <Suspense fallback={
          <div className="flex-center flex-column w-full h-full gap-md" data-testid="suspense-fallback">
            <div className="w-50px h-50px border-4 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
            <span className="text-secondary text-sm font-semibold uppercase tracking-widest animate-fade-in">Loading Module...</span>
          </div>
        }>
          <Routes>
          <Route path="/command-center" element={<CommandCenter />} />

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


