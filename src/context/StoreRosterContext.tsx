import React, { createContext, useContext, useState } from 'react';

interface StoreRosterContextType {
  selectedProfileEmployee: any;
  setSelectedProfileEmployee: (emp: any) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tempSearch: string;
  setTempSearch: (term: string) => void;
  activeDept: string;
  setActiveDept: (dept: string) => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  showNewPeriodForm: boolean;
  setShowNewPeriodForm: (show: boolean) => void;
  newPeriodName: string;
  setNewPeriodName: (name: string) => void;
  copyOption: string;
  setCopyOption: (opt: string) => void;
  editingEmployee: any;
  setEditingEmployee: (emp: any) => void;
  showImporter: boolean;
  setShowImporter: (show: boolean) => void;
  activeSubView: string;
  setActiveSubView: (view: string) => void;
  showViewSettings: boolean;
  setShowViewSettings: (show: boolean) => void;
  isDense: boolean;
  setIsDense: (dense: boolean) => void;
  visibleCols: any;
  setVisibleCols: (cols: any) => void;
}

const StoreRosterContext = createContext<StoreRosterContextType | undefined>(undefined);

export function StoreRosterProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [copyOption, setCopyOption] = useState('roster-only');
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [activeSubView, setActiveSubView] = useState('list');
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [isDense, setIsDense] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [visibleCols, setVisibleCols] = useState({
    memberships: true,
    creditCards: true,
    warranty: true,
    surveys: true,
    rph: true,
    basket: true,
    m365: true,
    audio: true,
    focus5: true
  });

  return (
    <StoreRosterContext.Provider value={{
      selectedProfileEmployee, setSelectedProfileEmployee,
      searchTerm, setSearchTerm,
      tempSearch, setTempSearch,
      activeDept, setActiveDept,
      showAddForm, setShowAddForm,
      showNewPeriodForm, setShowNewPeriodForm,
      newPeriodName, setNewPeriodName,
      copyOption, setCopyOption,
      editingEmployee, setEditingEmployee,
      showImporter, setShowImporter,
      activeSubView, setActiveSubView,
      showViewSettings, setShowViewSettings,
      isDense, setIsDense,
      visibleCols, setVisibleCols
    }}>
      {children}
    </StoreRosterContext.Provider>
  );
}

export function useStoreRoster() {
  const context = useContext(StoreRosterContext);
  if (!context) {
    throw new Error('useStoreRoster must be used within a StoreRosterProvider');
  }
  return context;
}
