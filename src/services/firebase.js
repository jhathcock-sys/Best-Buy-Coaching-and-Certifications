import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, getDoc, collection, addDoc, query, orderBy, limit, deleteDoc, getDocs } from 'firebase/firestore';

let app = null;
let db = null;

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
const getStoreDocRef = (subpath) => {
  if (!db) return null;
  // We use store-1 as the default corporate store ID.
  return doc(db, 'stores', 'store-1', 'data', subpath);
};

// Subscribe to Active Period
export const subscribeToActivePeriod = (onUpdate) => {
  const ref = getStoreDocRef('activePeriod');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().activePeriod);
    }
  });
};

// Subscribe to Roster History (Periods Collection Split)
export const subscribeToRosterHistory = (onUpdate) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', 'store-1', 'periods');
    return onSnapshot(colRef, (snap) => {
      const periods = {};
      snap.forEach((doc) => {
        periods[doc.id] = doc.data().roster || [];
      });
      onUpdate(periods);
    });
  } catch (e) {
    console.error('Failed to subscribe to periods collection:', e);
    return null;
  }
};

// Subscribe to Playbook Settings
export const subscribeToPlaybookSettings = (onUpdate) => {
  const ref = getStoreDocRef('playbookSettings');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().settings);
    }
  });
};

// Subscribe to Managers Settings
export const subscribeToManagers = (onUpdate) => {
  const ref = getStoreDocRef('managersSettings');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().managers || []);
    }
  });
};

// Subscribe to Department Goals
export const subscribeToDeptGoals = (onUpdate) => {
  const ref = getStoreDocRef('deptGoals');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().goals);
    }
  });
};

// Write Active Period
export const saveActivePeriodToCloud = async (activePeriod) => {
  const ref = getStoreDocRef('activePeriod');
  if (!ref) return false;
  try {
    await setDoc(ref, { activePeriod }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save activePeriod to cloud:', e);
    return false;
  }
};

// Subscribe to Daily Snapshots (Trend Reporting)
export const subscribeToDailySnapshots = (onUpdate) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', 'store-1', 'dailySnapshots');
    return onSnapshot(colRef, (snap) => {
      const snapshots = {};
      snap.forEach((doc) => {
        snapshots[doc.id] = doc.data().metrics || [];
      });
      onUpdate(snapshots);
    });
  } catch (e) {
    console.error('Failed to subscribe to dailySnapshots collection:', e);
    return null;
  }
};

// Write Daily Snapshot to Cloud
export const saveDailySnapshotToCloud = async (dateKey, metrics) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', 'store-1', 'dailySnapshots', dateKey);
    await setDoc(docRef, { metrics }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save daily snapshot to cloud:', e);
    return false;
  }
};

// Write Roster History (Period Document Split)
export const saveRosterHistoryToCloud = async (roster, periodId) => {
  if (!db || !periodId) return false;
  try {
    const ref = doc(db, 'stores', 'store-1', 'periods', periodId);
    await setDoc(ref, { roster }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save period roster to cloud:', e);
    return false;
  }
};

// Write Playbook Settings
export const savePlaybookSettingsToCloud = async (settings) => {
  const ref = getStoreDocRef('playbookSettings');
  if (!ref) return false;
  try {
    await setDoc(ref, { settings }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save playbookSettings to cloud:', e);
    return false;
  }
};

// Write Managers Settings
export const saveManagersToCloud = async (managers) => {
  const ref = getStoreDocRef('managersSettings');
  if (!ref) return false;
  try {
    await setDoc(ref, { managers }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save managers to cloud:', e);
    return false;
  }
};

// Write Department Goals
export const saveDeptGoalsToCloud = async (goals) => {
  const ref = getStoreDocRef('deptGoals');
  if (!ref) return false;
  try {
    await setDoc(ref, { goals }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save deptGoals to cloud:', e);
    return false;
  }
};

// Subscribe to Recent Sessions
export const subscribeToRecentSessions = (onUpdate) => {
  const ref = getStoreDocRef('recentSessions');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().sessions || []);
    }
  });
};

// Write Recent Sessions
export const saveRecentSessionsToCloud = async (sessions) => {
  const ref = getStoreDocRef('recentSessions');
  if (!ref) return false;
  try {
    await setDoc(ref, { sessions }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save recentSessions to cloud:', e);
    return false;
  }
};

// Subscribe to Metrics
export const subscribeToMetrics = (onUpdate) => {
  const ref = getStoreDocRef('metrics');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().metrics);
    }
  });
};

// Write Metrics
export const saveMetricsToCloud = async (metrics) => {
  const ref = getStoreDocRef('metrics');
  if (!ref) return false;
  try {
    await setDoc(ref, { metrics }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save metrics to cloud:', e);
    return false;
  }
};

// Subscribe to Follow-Up Tasks
export const subscribeToFollowUpTasks = (onUpdate) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', 'store-1', 'followUpTasks');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      const tasks = [];
      snap.forEach((doc) => {
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
export const saveFollowUpTaskToCloud = async (task) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', 'store-1', 'followUpTasks', task.id);
    await setDoc(docRef, {
      ...task,
      timestamp: task.timestamp || new Date().getTime()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save task to cloud:', e);
    return false;
  }
};

// Delete Follow-Up Task
export const deleteFollowUpTaskFromCloud = async (taskId) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', 'store-1', 'followUpTasks', taskId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete task from cloud:', e);
    return false;
  }
};

// Subscribe to Floor Leader Shifts
export const subscribeToFloorLeaderShifts = (onUpdate) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', 'store-1', 'floorLeaderShifts');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      const shifts = [];
      snap.forEach((doc) => {
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
export const saveFloorLeaderShiftToCloud = async (shift) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', 'store-1', 'floorLeaderShifts', shift.id);
    await setDoc(docRef, {
      ...shift,
      timestamp: shift.timestamp || new Date().getTime()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save floor leader shift to cloud:', e);
    return false;
  }
};

// Delete Floor Leader Shift
export const deleteFloorLeaderShiftFromCloud = async (shiftId) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', 'store-1', 'floorLeaderShifts', shiftId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete shift from cloud:', e);
    return false;
  }
};

// Seed initial offline data to cloud when connecting first time!
export const seedOfflineDataToCloud = async (offlineData) => {
  if (!db) return false;
  try {
    const { activePeriod, rosterHistory, playbookSettings, deptGoals, recentSessions, metrics, followUpTasks, floorLeaderShifts, managers } = offlineData;
    
    // Check if cloud data exists first to avoid blindly overwriting existing cloud data!
    const activePeriodSnap = await getDoc(getStoreDocRef('activePeriod'));
    if (!activePeriodSnap.exists() && activePeriod) {
      await saveActivePeriodToCloud(activePeriod);
    }
    
    // Seed periods collection if empty
    const periodsColRef = collection(db, 'stores', 'store-1', 'periods');
    const periodsQuerySnap = await getDocs(query(periodsColRef, limit(1)));
    if (periodsQuerySnap.empty && rosterHistory) {
      for (const periodId of Object.keys(rosterHistory)) {
        await saveRosterHistoryToCloud(rosterHistory[periodId], periodId);
      }
    }

    const playbookSnap = await getDoc(getStoreDocRef('playbookSettings'));
    if (!playbookSnap.exists() && playbookSettings) {
      await savePlaybookSettingsToCloud(playbookSettings);
    }

    const managersSnap = await getDoc(getStoreDocRef('managersSettings'));
    if (!managersSnap.exists() && managers) {
      await saveManagersToCloud(managers);
    }

    const goalsSnap = await getDoc(getStoreDocRef('deptGoals'));
    if (!goalsSnap.exists() && deptGoals) {
      await saveDeptGoalsToCloud(deptGoals);
    }

    const sessionsSnap = await getDoc(getStoreDocRef('recentSessions'));
    if (!sessionsSnap.exists() && recentSessions) {
      await saveRecentSessionsToCloud(recentSessions);
    }

    const metricsSnap = await getDoc(getStoreDocRef('metrics'));
    if (!metricsSnap.exists() && metrics) {
      await saveMetricsToCloud(metrics);
    }

    // Seed followUpTasks sub-collection
    const tasksColRef = collection(db, 'stores', 'store-1', 'followUpTasks');
    const tasksQuerySnap = await getDocs(query(tasksColRef, limit(1)));
    if (tasksQuerySnap.empty && followUpTasks && Array.isArray(followUpTasks)) {
      for (const t of followUpTasks) {
        await saveFollowUpTaskToCloud(t);
      }
    }

    // Seed floorLeaderShifts sub-collection
    const shiftsColRef = collection(db, 'stores', 'store-1', 'floorLeaderShifts');
    const shiftsQuerySnap = await getDocs(query(shiftsColRef, limit(1)));
    if (shiftsQuerySnap.empty && floorLeaderShifts && Array.isArray(floorLeaderShifts)) {
      for (const s of floorLeaderShifts) {
        await saveFloorLeaderShiftToCloud(s);
      }
    }

    // Seed coachingLogs sub-collection
    const colRef = collection(db, 'stores', 'store-1', 'coachingLogs');
    const q = query(colRef, limit(1));
    const logsSnap = await getDocs(q);
    if (logsSnap.empty && offlineData.coachingLogs && Array.isArray(offlineData.coachingLogs)) {
      for (const log of offlineData.coachingLogs) {
        await saveCoachingLogToCloud(log);
      }
    }

    return true;
  } catch (e) {
    console.error('Failed to seed offline data:', e);
    return false;
  }
};

// Add coaching log to Firestore sub-collection
export const saveCoachingLogToCloud = async (log) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', 'store-1', 'coachingLogs');
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
export const subscribeToCoachingLogs = (onUpdate) => {
  if (!db) return null;
  try {
    const colRef = collection(db, 'stores', 'store-1', 'coachingLogs');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      const logs = [];
      snap.forEach((doc) => {
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
export const deleteCoachingLogFromCloud = async (logId) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'stores', 'store-1', 'coachingLogs', logId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete coaching log:', e);
    return false;
  }
};

// Test real Firebase connection latency
export const testLatency = async () => {
  if (!db) return -1;
  const startTime = Date.now();
  try {
    const ref = getStoreDocRef('activePeriod');
    if (ref) {
      await getDoc(ref);
      return Date.now() - startTime;
    }
  } catch (e) {
    console.error('Latency test failed:', e);
  }
  return -1;
};

