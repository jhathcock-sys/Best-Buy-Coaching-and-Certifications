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



  return (
    <AppContext.Provider value={{
      activeView,
      setActiveView
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
