/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

const AppContext = createContext();

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const setActiveView = (view) => navigate(view === 'dashboard' ? '/' : `/${view}`);

  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);
  const dbConnected = useStore((state) => state.dbConnected);
  const setDbConnected = useStore((state) => state.setDbConnected);
  const handleSaveFirebaseConfig = useStore((state) => state.handleSaveFirebaseConfig);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const storePin = useStore((state) => state.storePin);
  const setStorePin = useStore((state) => state.setStorePin);
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);

  return (
    <AppContext.Provider value={{
      activeView,
      setActiveView,
      apiKey,
      setApiKey,
      dbConnected,
      setDbConnected,
      handleSaveFirebaseConfig,
      isAuthenticated,
      setIsAuthenticated,
      storePin,
      setStorePin,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
