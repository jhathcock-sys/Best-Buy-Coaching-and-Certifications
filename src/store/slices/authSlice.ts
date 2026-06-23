import { StateCreator } from 'zustand';
import { StoreState, AuthSlice } from '../../types/store';
import { initFirebase, isFirebaseConnected, saveManagersToCloud, getUserByPin, signInTenant, createTenantAuth, signOutTenant } from '../../services/firebase';
import { MANAGERS } from './constants';

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => {
  // Initial state logic specific to auth
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hasEnvKey = !!(envKey && envKey.trim().length > 10);
  const initialApiKey = hasEnvKey ? envKey : (localStorage.getItem('bby_api_key') || '');
  
  let initialActiveManager = null;
  try {
    const savedManager = sessionStorage.getItem('bby_active_manager');
    if (savedManager) {
      initialActiveManager = JSON.parse(savedManager);
    }
  } catch (e) {
    console.error('Failed to parse active manager from sessionStorage', e);
  }

  let initialManagers = MANAGERS;

  const initialDbConnected = isFirebaseConnected();

  return {
    activeView: 'dashboard',
    apiKey: initialApiKey,
    dbConnected: initialDbConnected,
    isAuthenticated: sessionStorage.getItem('bby_authenticated') === 'true',
    storePin: '1234', // will be overwritten by playbook settings in useStore
    activeManager: initialActiveManager,
    activeAdvisor: null,
    managers: initialManagers,
    storeId: sessionStorage.getItem('bby_store_id') || localStorage.getItem('bby_last_store') || '1480',

    setStoreId: (storeId) => {
      set({ storeId });
      if (storeId) sessionStorage.setItem('bby_store_id', storeId);
      else sessionStorage.removeItem('bby_store_id');
    },

    setActiveView: (view) => set({ activeView: view }),

    setApiKey: (key) => {
      set({ apiKey: key });
      if (key) {
        localStorage.setItem('bby_api_key', key);
      } else {
        localStorage.removeItem('bby_api_key');
      }
    },
    
    setDbConnected: (connected) => set({ dbConnected: connected }),
    setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
    setStorePin: (pin) => set({ storePin: pin }),

    loginAdvisor: (advisor) => {
      sessionStorage.setItem('bby_authenticated', 'true');
      set({ isAuthenticated: true, activeAdvisor: advisor, activeManager: null });
    },
    login: async (pin, storeId) => {
      let manager = null;
      
      // Try to fetch from cloud 'users' collection first
      if (get().dbConnected) {
        manager = await getUserByPin(storeId, pin);
      }
      
      // Fallback to legacy local state if not found or offline
      if (!manager) {
        manager = get().managers.find(m => m.pin === pin) || null;
      }

      if (manager) {
        // Now authenticate with true Firebase Auth to secure the rules
        if (get().dbConnected) {
          let authSuccess = await signInTenant(storeId, pin);
          if (!authSuccess) {
            authSuccess = await createTenantAuth(storeId, pin);
            if (!authSuccess) console.error("Failed true Firebase authentication. Writes will be rejected.");
          }
        }

        sessionStorage.setItem('bby_authenticated', 'true');
        sessionStorage.setItem('bby_active_manager', JSON.stringify(manager));
        sessionStorage.setItem('bby_store_id', storeId);
        set({ isAuthenticated: true, activeManager: manager, storeId });
        return true;
      }
      
      // Fix: Async Race Condition Prevention for Tenant Guest Login
      let trueStorePin = get().storePin;
      if (get().dbConnected) {
         // Bypass the async listener race condition by manually fetching the source of truth
         let authSuccess = await signInTenant(storeId, pin);
         if (!authSuccess) {
           // We only create it if they are the true store pin!
           // But how do we check the true store pin if we can't read it?
           // We will have to try to read it via the legacy way (which will fail if rules block it)
           // If we're blocked, we can't authenticate a guest.
           // For now, if signInTenant succeeds, they are a valid user (either manager or guest).
         }
         
         if (authSuccess) {
           trueStorePin = pin; // Auth succeeded, bypass the stale state check
         }
      }

      if (pin === trueStorePin) {
        // Authenticate guest to true Firebase Auth if not already done
        if (get().dbConnected) {
           let authSuccess = await signInTenant(storeId, pin);
           if (!authSuccess) {
              await createTenantAuth(storeId, pin);
           }
        }

        const guestManager = { name: 'Default Supervisor', role: 'Store Leader' };
        sessionStorage.setItem('bby_authenticated', 'true');
        sessionStorage.setItem('bby_active_manager', JSON.stringify(guestManager));
        sessionStorage.setItem('bby_store_id', storeId);
        set({ isAuthenticated: true, activeManager: guestManager, storeId });
        return true;
      }
      return false;
    },

    logout: async () => {
      if (get().dbConnected) {
        await signOutTenant();
      }
      sessionStorage.removeItem('bby_authenticated');
      sessionStorage.removeItem('bby_active_manager');
      sessionStorage.removeItem('bby_store_id');
      set({ 
        isAuthenticated: false, 
        activeManager: null, 
        activeAdvisor: null, 
        storeId: null,
        // WIPE LEAKED TENANT DATA:
        rosterHistory: {},
        dailySnapshots: {},
        metrics: { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0, totalRevenue: 0, totalHours: 0 }
      });
    },

    handleSaveFirebaseConfig: (config) => {
      if (config) {
        localStorage.setItem('bby_firebase_config', JSON.stringify(config));
        const database = initFirebase(config);
        set({ dbConnected: !!database });
        if (database) {
          import('../../services/firebase').then(({ pushOfflineDataToCloud }) => {
            const state = get();
            const offlineData = {
              activePeriod: state.activePeriod,
              rosterHistory: state.rosterHistory,
              playbookSettings: state.playbookSettings,
              deptGoals: state.deptGoals,
              recentSessions: state.recentSessions,
              metrics: state.metrics,
              followUpTasks: state.followUpTasks,
              floorLeaderShifts: state.floorLeaderShifts,
              coachingLogs: state.coachingLogs,
              managers: state.managers
            };
            pushOfflineDataToCloud(state.storeId, offlineData).then(() => {
              alert("Connected to Firebase Cloud Database! Roster data, department targets, and local sandbox data are now synchronized in real-time.");
            });
          });
        }
      } else {
        localStorage.removeItem('bby_firebase_config');
        initFirebase(null);
        set({ dbConnected: false });
        alert("Switched back to Local Offline Sandbox Mode successfully.");
      }
    },

    setManagers: (managers) => set({ managers }),
    saveManagers: (newManagers) => {
      set({ managers: newManagers });
      if (get().dbConnected) {
        saveManagersToCloud(get().storeId, newManagers);
      }
    }
  };
};

