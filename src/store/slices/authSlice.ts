import { StateCreator } from 'zustand';
import { StoreState, AuthSlice } from '../../types/store';
import { initFirebase, isFirebaseConnected, saveManagersToCloud, getUserByPin, signInTenant, createTenantAuth, signOutTenant, getStoreGuestPin } from '../../services/firebase';
import { MANAGERS, DEFAULT_PLAYBOOK_SETTINGS } from './constants';
import bcrypt from 'bcryptjs';

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => {
  // Initial state logic specific to auth
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hasEnvKey = !!(envKey && envKey.trim().length > 10);
  const initialApiKey = hasEnvKey ? envKey : '';
  
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
    apiKey: initialApiKey,
    dbConnected: initialDbConnected,
    isAuthenticated: sessionStorage.getItem('bby_authenticated') === 'true',
    storePin: '1234', // will be overwritten by playbook settings in useStore
    activeManager: initialActiveManager,
    activeAdvisor: null,
    managers: initialManagers,
    storeId: sessionStorage.getItem('bby_store_id') || '1480',

    setStoreId: (storeId) => {
      set({ storeId });
      if (storeId) sessionStorage.setItem('bby_store_id', storeId);
      else sessionStorage.removeItem('bby_store_id');
    },


    setApiKey: (key) => {
      set({ apiKey: key });
    },
    
    setDbConnected: (connected) => set({ dbConnected: connected }),
    setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
    setStorePin: (pin) => set({ storePin: pin }),

    loginAdvisor: async (advisor) => {
      if (get().dbConnected) {
        const storeId = get().storeId || '1480';
        let trueStorePin = get().storePin;
        try {
          const cloudPin = await getStoreGuestPin(storeId);
          if (cloudPin) trueStorePin = cloudPin;
          
          let authSuccess = await signInTenant(storeId, trueStorePin);
          if (!authSuccess) {
            await createTenantAuth(storeId, trueStorePin);
          }
        } catch (e) {
          console.warn("Failed to background auth advisor", e);
        }
      }
      sessionStorage.setItem('bby_authenticated', 'true');
      set({ isAuthenticated: true, activeAdvisor: advisor, activeManager: null });
    },
    login: async (pin, storeId) => {
      let manager = null;
      let authSuccess = false;

      // 1. Try to authenticate first so we can bypass secured read rules
      if (get().dbConnected) {
        authSuccess = await signInTenant(storeId, pin);
      }
      
      // 2. Fetch from cloud 'users' collection if authenticated
      if (get().dbConnected && authSuccess) {
        manager = await getUserByPin(storeId, pin);
      }
      
      // 3. Fallback to legacy local state if not found or offline/not auth'd yet
      if (!manager) {
        manager = get().managers.find(m => {
          if (!m.pin) return false;
          const isHashed = m.pin.startsWith('$2a$') || m.pin.startsWith('$2b$');
          if (isHashed) {
            return bcrypt.compareSync(pin, m.pin);
          }
          return m.pin === pin;
        }) || null;
      }

      if (manager) {
        // 4. Authenticate/Create if we bypassed step 1 because they were in local state
        if (get().dbConnected && !authSuccess) {
          authSuccess = await signInTenant(storeId, pin);
          if (!authSuccess) {
            const created = await createTenantAuth(storeId, pin);
            if (created) {
              authSuccess = await signInTenant(storeId, pin);
            }
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
           // Try to read it directly to prevent listener race conditions
           const cloudPin = await getStoreGuestPin(storeId);
           if (cloudPin) {
             trueStorePin = cloudPin;
           }
         } else {
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
        metrics: { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0, totalRevenue: 0, totalHours: 0 },
        coachingLogs: [],
        followUpTasks: [],
        deptGoals: {},
        recentSessions: [],
        floorLeaderShifts: [],
        playbookSettings: DEFAULT_PLAYBOOK_SETTINGS
      });
    },

    handleSaveFirebaseConfig: (config) => {
      if (config) {
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

