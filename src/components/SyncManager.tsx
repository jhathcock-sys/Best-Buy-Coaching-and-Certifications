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

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

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

  useEffect(() => {
    if (!dbConnected || !storeId) return;

    const unsubPeriod = subscribeToActivePeriod(storeId, debounce((p) => {
      if (p) setActivePeriod(p);
    }, 100));

    const unsubRoster = subscribeToRosterHistory(storeId, debounce((h) => {
      if (h) setRosterHistory(h);
    }, 100));

    const unsubPlaybook = subscribeToPlaybookSettings(storeId, debounce((s) => {
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
    }, 100));

    const unsubGoals = subscribeToDeptGoals(storeId, debounce((g) => {
      if (g) setDeptGoals(g);
    }, 100));

    const unsubSessions = subscribeToRecentSessions(storeId, debounce((s) => {
      if (s) setRecentSessions(s);
    }, 100));

    const unsubMetrics = subscribeToMetrics(storeId, debounce((m) => {
      if (m) setMetrics(m);
    }, 100));

    const unsubFollowUp = subscribeToFollowUpTasks(storeId, debounce((tasks) => {
      if (tasks) setFollowUpTasks(tasks);
    }, 100));

    const unsubFloorLeader = subscribeToFloorLeaderShifts(storeId, debounce((shifts) => {
      if (shifts) {
        setFloorLeaderShifts(shifts);
      }
    }, 100));

    const unsubCoachingLogs = subscribeToCoachingLogs(storeId, debounce((logs) => {
      if (logs) {
        setCoachingLogs(logs);
      }
    }, 100));

    const unsubManagers = subscribeToManagers(storeId, debounce((m) => {
      if (m) setManagers(m);
    }, 100));

    const unsubDailySnapshots = subscribeToDailySnapshots(storeId, debounce((s) => {
      if (s) setDailySnapshots(s);
    }, 100));

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
  }, [dbConnected, isAuthenticated, storeId, setActivePeriod, setRosterHistory, setPlaybookSettings, setDeptGoals, setRecentSessions, setMetrics, setFollowUpTasks, setFloorLeaderShifts, setCoachingLogs, setManagers, setDailySnapshots]);

  return null;
}
