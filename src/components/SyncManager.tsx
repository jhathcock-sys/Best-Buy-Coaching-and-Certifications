import { useEffect } from 'react';
import { useStore } from '../store/useStore';
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
import {
  PlaybookSettings,
  Manager,
  DeptGoal,
  CoachingLog,
  FollowUpTask,
  ShiftEvent,
  MetricAverages
} from '../types';

export default function SyncManager() {
  const dbConnected = useStore((state) => state.dbConnected);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const storeId = useStore((state) => state.storeId);

  const setActivePeriod = useStore((state) => state.setActivePeriod);
  const setRosterHistory = useStore((state) => state.setRosterHistory);
  const setPlaybookSettings = useStore((state) => state.setPlaybookSettings);
  const setDeptGoals = useStore((state) => state.setDeptGoals);
  const setRecentSessions = useStore((state) => state.setRecentSessions);
  const setMetrics = useStore((state) => state.setMetrics);
  const setFollowUpTasks = useStore((state) => state.setFollowUpTasks);
  const setFloorLeaderShifts = useStore((state) => state.setFloorLeaderShifts);
  const setCoachingLogs = useStore((state) => state.setCoachingLogs);
  const setManagers = useStore((state) => state.setManagers);
  const setDailySnapshots = useStore((state) => state.setDailySnapshots);

  // Pre-Auth Listeners (Required for Login / Hydration)
  useEffect(() => {
    if (!dbConnected || !storeId) return;

    const unsubPlaybook = subscribeToPlaybookSettings(storeId, (s: PlaybookSettings | null) => {
      if (s) {
        const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim().length > 10);
        
        // Clone object before mutating
        const updatedSettings: PlaybookSettings = { ...s };
        
        if (hasEnvKey) {
          updatedSettings.useGemini = true;
        }
        if (!updatedSettings.storePin) {
          updatedSettings.storePin = '1234';
        }
        setPlaybookSettings(updatedSettings);
      }
    });

    const unsubManagers = subscribeToManagers(storeId, (m: Manager[] | null) => {
      if (m) setManagers(m);
    });

    return () => {
      if (unsubPlaybook) unsubPlaybook();
      if (unsubManagers) unsubManagers();
    };
  }, [dbConnected, storeId, setPlaybookSettings, setManagers]);

  // Post-Auth Listeners (Tenant Data)
  useEffect(() => {
    if (!dbConnected || !storeId || !isAuthenticated) return;

    const unsubPeriod = subscribeToActivePeriod(storeId, (p: string | null) => {
      if (p) setActivePeriod(p);
    });

    const unsubRoster = subscribeToRosterHistory(storeId, (h: Record<string, any> | null) => {
      if (h) setRosterHistory(h);
    });

    const unsubGoals = subscribeToDeptGoals(storeId, (g: Record<string, DeptGoal> | null) => {
      if (g) setDeptGoals(g);
    });

    const unsubSessions = subscribeToRecentSessions(storeId, (s: any[] | null) => {
      if (s) setRecentSessions(s);
    });

    const unsubMetrics = subscribeToMetrics(storeId, (m: MetricAverages | null) => {
      if (m) setMetrics(m);
    });

    const unsubFollowUp = subscribeToFollowUpTasks(storeId, (tasks: FollowUpTask[] | null) => {
      if (tasks) setFollowUpTasks(tasks);
    });

    const unsubFloorLeader = subscribeToFloorLeaderShifts(storeId, (shifts: ShiftEvent[] | null) => {
      if (shifts) {
        setFloorLeaderShifts(shifts);
      }
    });

    const unsubCoachingLogs = subscribeToCoachingLogs(storeId, (logs: CoachingLog[] | null) => {
      if (logs) {
        setCoachingLogs(logs);
      }
    });

    const unsubDailySnapshots = subscribeToDailySnapshots(storeId, (s: Record<string, any> | null) => {
      if (s) setDailySnapshots(s);
    });

    return () => {
      if (unsubPeriod) unsubPeriod();
      if (unsubRoster) unsubRoster();
      if (unsubGoals) unsubGoals();
      if (unsubSessions) unsubSessions();
      if (unsubMetrics) unsubMetrics();
      if (unsubFollowUp) unsubFollowUp();
      if (unsubFloorLeader) unsubFloorLeader();
      if (unsubCoachingLogs) unsubCoachingLogs();
      if (unsubDailySnapshots) unsubDailySnapshots();
    };
  }, [
    dbConnected, 
    isAuthenticated, 
    storeId, 
    setActivePeriod, 
    setRosterHistory, 
    setDeptGoals, 
    setRecentSessions, 
    setMetrics, 
    setFollowUpTasks, 
    setFloorLeaderShifts, 
    setCoachingLogs, 
    setDailySnapshots
  ]);

  return null;
}
