import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShiftEvent } from '../types';
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
} from '../services/firebase';

export function useAppStoreSync(dbConnected, isAuthenticated, storeId) {
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

  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSwUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

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
        const shiftMap: Record<string, ShiftEvent> = {};
        
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
  }, [dbConnected, isAuthenticated, storeId, setActivePeriod, setRosterHistory, setPlaybookSettings, setDeptGoals, setRecentSessions, setMetrics, setFollowUpTasks, setFloorLeaderShifts, setCoachingLogs]);

  return {
    rosterHistory,
    activePeriod,
    playbookSettings,
    recentSessions,
    metrics,
    customScenarios,
    followUpTasks,
    floorLeaderShifts,
    coachingLogs,
    deptGoals,
    activeManager,
    activeAdvisor,
    managers,
    storeId,
    setRosterHistory,
    setActivePeriod,
    setPlaybookSettings,
    setRecentSessions,
    setMetrics,
    setFollowUpTasks,
    setFloorLeaderShifts,
    setCoachingLogs,
    setDeptGoals,
    logout,
    saveManagers,
    addFollowUpTask,
    completeFollowUpTask,
    saveSettings,
    importCustomScenario,
    deleteCustomScenario,
    saveFloorLeaderShift,
    deleteFloorLeaderShift,
    logCoachingSession,
    deleteCoachingLog,
    completeRoleplay,
    saveDeptGoals,
    changePeriod,
    addEmployee,
    editEmployee,
    deleteEmployee,
    updateEmployeeDept,
    bulkImportEmployees,
    createPeriodArchive,
    swUpdateAvailable,
    setSwUpdateAvailable
  };
}
