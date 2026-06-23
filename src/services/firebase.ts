import { toast } from 'react-hot-toast';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, getDoc, collection, addDoc, query, orderBy, limit, deleteDoc, getDocs } from 'firebase/firestore';

let app: any = null;
let db: any = null;

// Get config from localStorage or env variables
export const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('bby_firebase_config');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved firebase config', e);
  }

  // Fallback to Vite env variables if present
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
};

export const initFirebase = (customConfig = null) => {
  const config = customConfig || getSavedFirebaseConfig();
  
  if (!config || !config.apiKey || !config.projectId) {
    app = null;
    db = null;
    return null;
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    
    // Enable offline local database caching and synchronization with the modern API
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });

    return db;
  } catch (e) {
    console.error('Firebase initialization failed:', e);
    app = null;
    db = null;
    return null;
  }
};

// Initialize on load
initFirebase();

export const isFirebaseConnected = () => {
  return db !== null;
};

// Helper: Get document reference for store-1
const getStoreDocRef = (storeId: string, subpath: string): any => {
  if (!db) return null;
  // We use store-1 as the default corporate store ID.
  return doc(db, 'stores', storeId, 'data', subpath);
};

// Subscribe to Active Period
export const subscribeToActivePeriod = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'activePeriod');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().activePeriod);
    }
  });
};

// Subscribe to Roster History (Periods Collection Split)
export const subscribeToRosterHistory = (storeId: string, onUpdate: any) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', storeId, 'periods');
    return onSnapshot(colRef, (snap: any) => {
      const periods: any = {};
      snap.forEach((doc: any) => {
        const rawRoster = doc.data().roster;
        
        // Auto-migration from legacy Array to Dictionary
        if (Array.isArray(rawRoster)) {
          console.warn(`Migrating legacy array roster for period ${doc.id}`);
          const migratedRoster: Record<string, any> = {};
          rawRoster.forEach(emp => {
            if (!emp.id) {
               emp.id = 'emp_' + Math.random().toString(36).substring(2, 11);
            }
            migratedRoster[emp.id] = emp;
          });
          periods[doc.id] = migratedRoster;
          
          // Prevent local cache from overwriting live data; only migrate if online
          if (typeof window !== 'undefined' && navigator.onLine) {
            saveRosterHistoryToCloud(storeId, migratedRoster, doc.id);
          }
        } else {
          periods[doc.id] = rawRoster || {};
        }
      });
      onUpdate(periods);
    });
  } catch (e) {
    console.error('Failed to subscribe to periods collection:', e);
    return null;
  }
};

// Subscribe to Playbook Settings
export const subscribeToPlaybookSettings = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'playbookSettings');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().settings);
    }
  });
};

// Subscribe to Managers Settings
export const subscribeToManagers = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'managersSettings');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().managers || []);
    }
  });
};

// Subscribe to Department Goals
export const subscribeToDeptGoals = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'deptGoals');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().goals);
    }
  });
};

// Write Active Period
export const saveActivePeriodToCloud = async (storeId: string, activePeriod: string) => {
  const ref = getStoreDocRef(storeId, 'activePeriod');
  if (!ref) return false;
  try {
    await setDoc(ref, { activePeriod }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save activePeriod to cloud:', e);
    toast.error('Failed to save activePeriod to cloud:');
    return false;
  }
};

// Subscribe to Daily Snapshots (Trend Reporting)
export const subscribeToDailySnapshots = (storeId: string, onUpdate: any) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', storeId, 'dailySnapshots');
    return onSnapshot(colRef, (snap: any) => {
      const snapshots: any = {};
      snap.forEach((doc: any) => {
        snapshots[doc.id as keyof typeof snapshots] = doc.data().metrics || [];
      });
      onUpdate(snapshots);
    });
  } catch (e) {
    console.error('Failed to subscribe to dailySnapshots collection:', e);
    return null;
  }
};

// Write Daily Snapshot to Cloud
export const saveDailySnapshotToCloud = async (storeId: string, dateKey: string, metrics: any) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', storeId, 'dailySnapshots', dateKey);
    await setDoc(docRef, { metrics }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save daily snapshot to cloud:', e);
    toast.error('Failed to save daily snapshot to cloud:');
    return false;
  }
};

// Write Roster History (Period Document Split)
export const saveRosterHistoryToCloud = async (storeId: string, roster: any, periodId: string) => {
  if (!db || !periodId) return false;
  try {
    const ref = doc(db, 'stores', storeId, 'periods', periodId);
    await setDoc(ref, { roster }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save period roster to cloud:', e);
    toast.error('Failed to save period roster to cloud:');
    return false;
  }
};

// Write Playbook Settings
export const savePlaybookSettingsToCloud = async (storeId: string, settings: any) => {
  const ref = getStoreDocRef(storeId, 'playbookSettings');
  if (!ref) return false;
  try {
    await setDoc(ref, { settings }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save playbookSettings to cloud:', e);
    toast.error('Failed to save playbookSettings to cloud:');
    return false;
  }
};

// Write Managers Settings
export const saveManagersToCloud = async (storeId: string, managers: any) => {
  const ref = getStoreDocRef(storeId, 'managersSettings');
  if (!ref) return false;
  try {
    await setDoc(ref, { managers }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save managers to cloud:', e);
    toast.error('Failed to save managers to cloud:');
    return false;
  }
};

// Write Department Goals
export const saveDeptGoalsToCloud = async (storeId: string, goals: any) => {
  const ref = getStoreDocRef(storeId, 'deptGoals');
  if (!ref) return false;
  try {
    await setDoc(ref, { goals }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save deptGoals to cloud:', e);
    toast.error('Failed to save deptGoals to cloud:');
    return false;
  }
};

// Subscribe to Recent Sessions
export const subscribeToRecentSessions = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'recentSessions');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().sessions || []);
    }
  });
};

// Write Recent Sessions
export const saveRecentSessionsToCloud = async (storeId: string, sessions: any) => {
  const ref = getStoreDocRef(storeId, 'recentSessions');
  if (!ref) return false;
  try {
    await setDoc(ref, { sessions }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save recentSessions to cloud:', e);
    toast.error('Failed to save recentSessions to cloud:');
    return false;
  }
};

// Subscribe to Metrics
export const subscribeToMetrics = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'metrics');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().metrics);
    }
  });
};

// Write Metrics
export const saveMetricsToCloud = async (storeId: string, metrics: any) => {
  const ref = getStoreDocRef(storeId, 'metrics');
  if (!ref) return false;
  try {
    await setDoc(ref, { metrics }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save metrics to cloud:', e);
    toast.error('Failed to save metrics to cloud:');
    return false;
  }
};

// Subscribe to Follow-Up Tasks
export const subscribeToFollowUpTasks = (storeId: string, onUpdate: any) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', storeId, 'followUpTasks');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap: any) => {
      const tasks: any[] = [];
      snap.forEach((doc: any) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      onUpdate(tasks);
    });
  } catch (e) {
    console.error('Failed to subscribe to followUpTasks:', e);
    return null;
  }
};

// Write Single Follow-Up Task
export const saveFollowUpTaskToCloud = async (storeId: string, task: any) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', storeId, 'followUpTasks', task.id);
    await setDoc(docRef, {
      ...task,
      timestamp: task.timestamp || new Date().getTime()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save task to cloud:', e);
    toast.error('Failed to save task to cloud:');
    return false;
  }
};

// Delete Follow-Up Task
export const deleteFollowUpTaskFromCloud = async (storeId: string, taskId: string) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', storeId, 'followUpTasks', taskId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete task from cloud:', e);
    toast.error('Failed to delete task from cloud:');
    return false;
  }
};

// Subscribe to Floor Leader Shifts
export const subscribeToFloorLeaderShifts = (storeId: string, onUpdate: any) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', storeId, 'floorLeaderShifts');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap: any) => {
      const shifts: any[] = [];
      snap.forEach((doc: any) => {
        shifts.push({ id: doc.id, ...doc.data() });
      });
      onUpdate(shifts);
    });
  } catch (e) {
    console.error('Failed to subscribe to floorLeaderShifts:', e);
    return null;
  }
};

// Write Single Floor Leader Shift
export const saveFloorLeaderShiftToCloud = async (storeId: string, shift: any) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', storeId, 'floorLeaderShifts', shift.id);
    await setDoc(docRef, {
      ...shift,
      timestamp: shift.timestamp || new Date().getTime()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save floor leader shift to cloud:', e);
    toast.error('Failed to save floor leader shift to cloud:');
    return false;
  }
};

// Delete Floor Leader Shift
export const deleteFloorLeaderShiftFromCloud = async (storeId: string, shiftId: string) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', storeId, 'floorLeaderShifts', shiftId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete shift from cloud:', e);
    toast.error('Failed to delete shift from cloud:');
    return false;
  }
};

// Seed initial offline data to cloud when connecting first time!
export const pushOfflineDataToCloud = async (storeId: string, offlineData: any) => {
  if (!db) return false;
  try {
    const { activePeriod, rosterHistory, playbookSettings, deptGoals, recentSessions, metrics, followUpTasks, floorLeaderShifts, managers } = offlineData;
    
    // Check if cloud data exists first to avoid blindly overwriting existing cloud data!
    const activePeriodSnap = await getDoc(getStoreDocRef(storeId, 'activePeriod'));
    if (!activePeriodSnap.exists() && activePeriod) {
      await saveActivePeriodToCloud(storeId, activePeriod);
    }
    
    // Seed periods collection if empty
    const periodsColRef = collection(db, 'stores', storeId, 'periods');
    const periodsQuerySnap = await getDocs(query(periodsColRef, limit(1)));
    if (periodsQuerySnap.empty && rosterHistory) {
      for (const periodId of Object.keys(rosterHistory)) {
        await saveRosterHistoryToCloud(storeId, rosterHistory[periodId], periodId);
      }
    }

    const playbookSnap = await getDoc(getStoreDocRef(storeId, 'playbookSettings'));
    if (!playbookSnap.exists() && playbookSettings) {
      await savePlaybookSettingsToCloud(storeId, playbookSettings);
    }

    const managersSnap = await getDoc(getStoreDocRef(storeId, 'managersSettings'));
    if (!managersSnap.exists() && managers) {
      await saveManagersToCloud(storeId, managers);
    }

    const goalsSnap = await getDoc(getStoreDocRef(storeId, 'deptGoals'));
    if (!goalsSnap.exists() && deptGoals) {
      await saveDeptGoalsToCloud(storeId, deptGoals);
    }

    const sessionsSnap = await getDoc(getStoreDocRef(storeId, 'recentSessions'));
    if (!sessionsSnap.exists() && recentSessions) {
      await saveRecentSessionsToCloud(storeId, recentSessions);
    }

    const metricsSnap = await getDoc(getStoreDocRef(storeId, 'metrics'));
    if (!metricsSnap.exists() && metrics) {
      await saveMetricsToCloud(storeId, metrics);
    }

    // Seed followUpTasks sub-collection
    const tasksColRef = collection(db, 'stores', storeId, 'followUpTasks');
    const tasksQuerySnap = await getDocs(query(tasksColRef, limit(1)));
    if (tasksQuerySnap.empty && followUpTasks && Array.isArray(followUpTasks)) {
      for (const t of followUpTasks) {
        await saveFollowUpTaskToCloud(storeId, t);
      }
    }

    // Seed floorLeaderShifts sub-collection
    const shiftsColRef = collection(db, 'stores', storeId, 'floorLeaderShifts');
    const shiftsQuerySnap = await getDocs(query(shiftsColRef, limit(1)));
    if (shiftsQuerySnap.empty && floorLeaderShifts && Array.isArray(floorLeaderShifts)) {
      for (const s of floorLeaderShifts) {
        await saveFloorLeaderShiftToCloud(storeId, s);
      }
    }

    // Seed coachingLogs sub-collection
    const colRef = collection(db, 'stores', storeId, 'coachingLogs');
    const q = query(colRef, limit(1));
    const logsSnap = await getDocs(q);
    if (logsSnap.empty && offlineData.coachingLogs && Array.isArray(offlineData.coachingLogs)) {
      for (const log of offlineData.coachingLogs) {
        await saveCoachingLogToCloud(storeId, log);
      }
    }

    return true;
  } catch (e) {
    console.error('Failed to seed offline data:', e);
    toast.error('Failed to seed offline data:');
    return false;
  }
};

// Add coaching log to Firestore sub-collection
export const saveCoachingLogToCloud = async (storeId: string, log: any) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', storeId, 'coachingLogs');
    const docRef = await addDoc(colRef, {
      ...log,
      timestamp: log.timestamp || new Date().getTime()
    });
    return docRef.id;
  } catch (e) {
    console.error('Failed to add coaching log to cloud:', e);
    return null;
  }
};

// Subscribe to coaching logs
export const subscribeToCoachingLogs = (storeId: string, onUpdate: any) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', storeId, 'coachingLogs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap: any) => {
      const logs: any[] = [];
      snap.forEach((doc: any) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      onUpdate(logs);
    });
  } catch (e) {
    console.error('Failed to subscribe to coaching logs:', e);
    return null;
  }
};

// Delete coaching log from cloud
export const deleteCoachingLogFromCloud = async (storeId: string, logId: string) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', storeId, 'coachingLogs', logId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete coaching log:', e);
    toast.error('Failed to delete coaching log:');
    return false;
  }
};

// Test real Firebase connection latency
export const testLatency = async (storeId: string) => {
  if (!db) return -1;
  const startTime = Date.now();
  try {
    const ref = getStoreDocRef(storeId, 'activePeriod');
    if (ref) {
      await getDoc(ref);
      return Date.now() - startTime;
    }
  } catch (e) {
    console.error('Latency test failed:', e);
  }
  return -1;
};

