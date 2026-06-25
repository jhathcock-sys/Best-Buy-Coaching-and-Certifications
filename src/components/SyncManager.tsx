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

    const unsubPlaybook = subscribeToPlaybookSettings(storeId, (s) => {
      if (s) {
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

    const unsubManagers = subscribeToManagers(storeId, (m) => {
      if (m) setManagers(m);
    });

    const unsubPeriod = subscribeToActivePeriod(storeId, (p) => {
      if (p) setActivePeriod(p);
    });

    const unsubRoster = subscribeToRosterHistory(storeId, (h) => {
      if (h) setRosterHistory(h);
    });

    return () => {
      if (unsubPlaybook) unsubPlaybook();
      if (unsubManagers) unsubManagers();
      if (unsubPeriod) unsubPeriod();
      if (unsubRoster) unsubRoster();
    };
  }, [dbConnected, storeId, setPlaybookSettings, setManagers, setActivePeriod, setRosterHistory]);

  // Post-Auth Listeners (Tenant Data)
  useEffect(() => {
    if (!dbConnected || !storeId || !isAuthenticated) return;

    const unsubGoals = subscribeToDeptGoals(storeId, (g) => {
      if (g) setDeptGoals(g);
    });

    const unsubSessions = subscribeToRecentSessions(storeId, (s) => {
      if (s) setRecentSessions(s);
    });

    const unsubMetrics = subscribeToMetrics(storeId, (m) => {
      if (m) setMetrics(m);
    });

    const unsubFollowUp = subscribeToFollowUpTasks(storeId, (tasks) => {
      if (tasks) setFollowUpTasks(tasks);
    });

    const unsubFloorLeader = subscribeToFloorLeaderShifts(storeId, (shifts) => {
      if (shifts) {
        setFloorLeaderShifts(shifts);
      }
    });

    const unsubCoachingLogs = subscribeToCoachingLogs(storeId, (logs) => {
      if (logs) {
        setCoachingLogs(logs);
      }
    });

    const unsubDailySnapshots = subscribeToDailySnapshots(storeId, (s) => {
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
  }, [dbConnected, isAuthenticated, storeId, setActivePeriod, setRosterHistory, setDeptGoals, setRecentSessions, setMetrics, setFollowUpTasks, setFloorLeaderShifts, setCoachingLogs, setDailySnapshots]);

  return null;
}
