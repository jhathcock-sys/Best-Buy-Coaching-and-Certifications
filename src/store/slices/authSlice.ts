// @ts-nocheck
import { StateCreator } from 'zustand';
import { StoreState, AuthSlice } from '../../types/store';
import { initFirebase, isFirebaseConnected, saveManagersToCloud } from '../../services/firebase';
import { MANAGERS } from './constants';

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => {
  // Initial state logic specific to auth
  const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim().length > 10);
  const initialApiKey = localStorage.getItem('bby_api_key') || (hasEnvKey ? import.meta.env.VITE_GEMINI_API_KEY : '');
  
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
  const savedManagers = localStorage.getItem('bby_managers');
  if (savedManagers) {
    try {
      const parsed = JSON.parse(savedManagers);
      if (parsed && Array.isArray(parsed)) {
        initialManagers = parsed;
      }
    } catch (e) {
      console.error('Failed to parse managers from localStorage', e);
    }
  }

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
    storeId: sessionStorage.getItem('bby_store_id') || null,

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
    login: (pin, storeId) => {
      const manager = get().managers.find(m => m.pin === pin);
      if (manager) {
        sessionStorage.setItem('bby_authenticated', 'true');
        sessionStorage.setItem('bby_active_manager', JSON.stringify(manager));
        sessionStorage.setItem('bby_store_id', storeId);
        set({ isAuthenticated: true, activeManager: manager, storeId });
        return true;
      }
      if (pin === get().storePin) {
        const guestManager = { name: 'Default Supervisor', role: 'Store Leader' };
        sessionStorage.setItem('bby_authenticated', 'true');
        sessionStorage.setItem('bby_active_manager', JSON.stringify(guestManager));
        sessionStorage.setItem('bby_store_id', storeId);
        set({ isAuthenticated: true, activeManager: guestManager, storeId });
        return true;
      }
      return false;
    },

    logout: () => {
      sessionStorage.removeItem('bby_authenticated');
      sessionStorage.removeItem('bby_active_manager');
      sessionStorage.removeItem('bby_store_id');
      set({ isAuthenticated: false, activeManager: null, activeAdvisor: null, storeId: null });
    },

    handleSaveFirebaseConfig: (config) => {
      if (config) {
        localStorage.setItem('bby_firebase_config', JSON.stringify(config));
        const database = initFirebase(config);
        set({ dbConnected: !!database });
        if (database) {
          alert("Connected to Firebase Cloud Database! Roster data, department targets, and exemplar templates are now synchronized in real-time.");
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
      localStorage.setItem('bby_managers', JSON.stringify(newManagers));
      if (get().dbConnected) {
        saveManagersToCloud(newManagers);
      }
    }
  };
};

