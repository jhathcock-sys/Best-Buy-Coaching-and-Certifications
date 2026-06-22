import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useApp } from '../context/AppContext';
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
  const { dbConnected, isAuthenticated } = useApp();
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
    if (!dbConnected || !isAuthenticated || !storeId) return;

    const unsubPeriod = subscribeToActivePeriod(storeId, (p) => {
      if (p) setActivePeriod(p);
    });

    const unsubRoster = subscribeToRosterHistory(storeId, (h) => {
      if (h) setRosterHistory(h);
    });

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
        const localShifts = useStore.getState().floorLeaderShifts || [];
        let deletedIds: string[] = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem('bby_deleted_shifts') || '[]');
        } catch (e) {
          console.error(e);
        }

        const shiftMap: Record<string, any> = {};
        
        localShifts.forEach(s => {
          if (s && s.id && !deletedIds.includes(s.id)) {
            shiftMap[s.id] = s as any;
          }
        });

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
        mergedShifts.sort((a, b) => ((b as any).timestamp || 0) - ((a as any).timestamp || 0));

        setFloorLeaderShifts(mergedShifts);
        localStorage.setItem('bby_floor_leader_shifts', JSON.stringify(mergedShifts));
      }
    });

    const unsubCoachingLogs = subscribeToCoachingLogs(storeId, (logs) => {
      if (logs) {
        setCoachingLogs(logs);
        localStorage.setItem('bby_coaching_logs', JSON.stringify(logs));
      }
    });

    const unsubManagers = subscribeToManagers(storeId, (m) => {
      if (m) setManagers(m);
    });

    const unsubDailySnapshots = subscribeToDailySnapshots(storeId, (s) => {
      if (s) setDailySnapshots(s);
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
  }, [dbConnected, isAuthenticated, storeId, setActivePeriod, setRosterHistory, setPlaybookSettings, setDeptGoals, setRecentSessions, setMetrics, setFollowUpTasks, setFloorLeaderShifts, setCoachingLogs, setManagers, setDailySnapshots]);

  return null;
}
