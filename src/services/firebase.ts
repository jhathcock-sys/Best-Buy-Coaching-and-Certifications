import { toast } from 'react-hot-toast';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, getDoc, collection, addDoc, query, orderBy, limit, deleteDoc, getDocs, getDocsFromCache, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import bcrypt from 'bcryptjs';

export let app: any = null;
let db: any = null;
let auth: any = null;

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
    
    auth = getAuth(app);

    // Enable offline local database caching and synchronization with the modern API
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });

    return db;
  } catch (e) {
    console.error('Firebase initialization failed:', e);
    app = null;
    db = null;
    auth = null;
    return null;
  }
};

// Initialize on load
initFirebase();

export const isFirebaseConnected = () => {
  return db !== null;
};

// True Firebase Authentication
export const signInTenant = async (storeId: string, pin: string) => {
  if (!auth) return false;
  const email = `s${storeId}_p${pin}@bby.app`;
  const password = `BBY_${storeId}_${pin}_secret!`;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error: any) {
    console.error('Firebase Auth Sign In Failed:', error);
    return false;
  }
};

// Only call this when we have VERIFIED the PIN matches a manager or the storePin
export const createTenantAuth = async (storeId: string, pin: string) => {
  if (!app) return false;
  try {
    const functionsInstance = getFunctions(app);
    const provisionTenantAccount = httpsCallable(functionsInstance, 'provisionTenantAccount');
    await provisionTenantAccount({ storeId, pin });
    return true;
  } catch (error) {
    console.error('Failed to create tenant auth via Cloud Function:', error);
    return false;
  }
};

export const signOutTenant = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch(e) {
      console.error(e);
    }
  }
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
    } else {
      onUpdate(null);
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
    } else {
      onUpdate({ useGemini: false, storePin: '1234' });
    }
  });
};

// Subscribe to Managers Settings (Legacy)
export const subscribeToManagers = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'managersSettings');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().managers || []);
    } else {
      onUpdate([]);
    }
  });
};

// Fetch User by PIN (New Auth Flow)
export const getUserByPin = async (storeId: string, pin: string) => {
  if (!db) return null;
  
  const withTimeout = <T>(promise: Promise<T>, ms = 4000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
  };

  try {
    const usersRef = collection(db, 'stores', storeId, 'users');
    
    let snap: any;
    try {
      snap = await withTimeout(getDocs(usersRef));
    } catch (err: any) {
      if (err.message === 'timeout' || err.code === 'unavailable') {
        console.warn('Network timeout fetching users by PIN, falling back to cache.');
        snap = await getDocsFromCache(usersRef);
      } else {
        throw err;
      }
    }

    if (!snap.empty) {
      for (const d of snap.docs) {
        const data = d.data();
        if (data.pin) {
          // Check if it's already a bcrypt hash (starts with $2a$ or $2b$) or plain text
          const isHashed = data.pin.startsWith('$2a$') || data.pin.startsWith('$2b$');
          if (isHashed) {
            if (bcrypt.compareSync(pin, data.pin)) {
              return { id: d.id, ...data };
            }
          } else {
            // Legacy plaintext fallback
            if (data.pin === pin) {
              return { id: d.id, ...data };
            }
          }
        }
      }
    }
    
    // Phase 1 Auth Lazy Migration: check legacy managersSettings if not found
    const legacyRef = getStoreDocRef(storeId, 'managersSettings');
    let legacySnap: any;
    try {
      legacySnap = await withTimeout(getDoc(legacyRef));
    } catch (err: any) {
      // If we timeout checking legacy, just return null and fallback to local state array
      return null;
    }
    
    if (legacySnap && legacySnap.exists()) {
      const legacyManagers = legacySnap.data().managers || [];
      const legacyUser = legacyManagers.find((m: any) => {
        if (!m.pin) return false;
        const isHashed = m.pin.startsWith('$2a$') || m.pin.startsWith('$2b$');
        if (isHashed) {
          return bcrypt.compareSync(pin, m.pin);
        }
        return m.pin === pin;
      });
      
      if (legacyUser) {
        // Migrate to users collection
        const docId = legacyUser.id || `user_${legacyUser.pin}`;
        const userDocRef = doc(usersRef, docId);
        await setDoc(userDocRef, {
          ...legacyUser,
          status: 'active',
          migratedAt: new Date().getTime()
        }, { merge: true });
        
        console.log(`Lazy migrated user ${legacyUser.name} to users collection.`);
        return { id: docId, ...legacyUser };
      }
    }
    
    return null;
  } catch (e) {
    console.error('Failed to get user by PIN:', e);
    return null;
  }
};

// Subscribe to Department Goals
export const subscribeToDeptGoals = (storeId: string, onUpdate: any) => {
  const ref = getStoreDocRef(storeId, 'deptGoals');
  if (!ref) return null;
  return onSnapshot(ref, (snap: any) => {
    if (snap.exists()) {
      onUpdate(snap.data().goals);
    } else {
      onUpdate({});
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
    // Hash PINs securely using bcrypt before saving
    const hashedManagers = managers.map((m: any) => {
      let securePin = m.pin;
      // Only hash if it exists and isn't already hashed
      if (securePin && !(securePin.startsWith('$2a$') || securePin.startsWith('$2b$'))) {
        securePin = bcrypt.hashSync(securePin, 10);
      }
      return { ...m, pin: securePin };
    });

    await setDoc(ref, { managers: hashedManagers }, { merge: true });
    
    // Phase 1 Auth Migration: Keep 'users' collection in sync with managers array
    const usersColRef = collection(db, 'stores', storeId, 'users');
    const activeIds: string[] = [];
    
    for (const manager of hashedManagers) {
      if (!manager.pin) continue;
      // If we don't have the original plaintext PIN, the ID generation below is flawed since it uses the hashed PIN if m.id is missing.
      // But the UI generates an ID when adding a manager. Let's make sure docId is stable.
      // The original code used `manager.id || user_${manager.pin}`.
      // We will preserve this but warn that using a hashed PIN as an ID is not ideal, but it's what was there.
      // Actually, since hashedManagers contains the HASHED pin, we'll try to find the plaintext pin from the original array for the ID fallback.
      const originalManager = managers.find((om: any) => om.name === manager.name);
      const docId = manager.id || `user_${originalManager?.pin || manager.pin}`;
      activeIds.push(docId);
      
      const userDocRef = doc(usersColRef, docId);
      await setDoc(userDocRef, {
        ...manager,
        status: 'active',
        updatedAt: new Date().getTime()
      }, { merge: true });
    }
    
    // Remove users that were deleted from the managers array
    const usersSnap = await getDocs(usersColRef);
    for (const userDoc of usersSnap.docs) {
      if (!activeIds.includes(userDoc.id)) {
        await deleteDoc(userDoc.ref);
      }
    }
    
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
    } else {
      onUpdate([]);
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
    } else {
      onUpdate({ memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0, totalRevenue: 0, totalHours: 0 });
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

