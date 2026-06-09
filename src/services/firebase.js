import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

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
    db = getFirestore(app);

    // Enable offline local database caching and synchronization
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence failed: Browser not supported.');
      }
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

// Subscribe to Roster History
export const subscribeToRosterHistory = (onUpdate) => {
  const ref = getStoreDocRef('rosterHistory');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().history || {});
    }
  });
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

// Write Roster History
export const saveRosterHistoryToCloud = async (history) => {
  const ref = getStoreDocRef('rosterHistory');
  if (!ref) return false;
  try {
    await setDoc(ref, { history }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save rosterHistory to cloud:', e);
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
  const ref = getStoreDocRef('followUpTasks');
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data().tasks || []);
    }
  });
};

// Write Follow-Up Tasks
export const saveFollowUpTasksToCloud = async (tasks) => {
  const ref = getStoreDocRef('followUpTasks');
  if (!ref) return false;
  try {
    await setDoc(ref, { tasks }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to save followUpTasks to cloud:', e);
    return false;
  }
};

// Seed initial offline data to cloud when connecting first time!
export const seedOfflineDataToCloud = async (offlineData) => {
  if (!db) return false;
  try {
    const { activePeriod, rosterHistory, playbookSettings, deptGoals, recentSessions, metrics, followUpTasks } = offlineData;
    
    // Check if cloud data exists first to avoid blindly overwriting existing cloud data!
    const activePeriodSnap = await getDoc(getStoreDocRef('activePeriod'));
    if (!activePeriodSnap.exists() && activePeriod) {
      await saveActivePeriodToCloud(activePeriod);
    }
    
    const rosterSnap = await getDoc(getStoreDocRef('rosterHistory'));
    if (!rosterSnap.exists() && rosterHistory) {
      await saveRosterHistoryToCloud(rosterHistory);
    }

    const playbookSnap = await getDoc(getStoreDocRef('playbookSettings'));
    if (!playbookSnap.exists() && playbookSettings) {
      await savePlaybookSettingsToCloud(playbookSettings);
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

    const followUpSnap = await getDoc(getStoreDocRef('followUpTasks'));
    if (!followUpSnap.exists() && followUpTasks) {
      await saveFollowUpTasksToCloud(followUpTasks);
    }

    return true;
  } catch (e) {
    console.error('Failed to seed offline data:', e);
    return false;
  }
};

