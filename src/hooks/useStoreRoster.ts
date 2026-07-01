import { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Employee } from '../types';

const EMPTY_OBJ: Record<string, any> = {};
const EMPTY_ARR: Employee[] = [];

export interface VisibleCols {
  hours: boolean;
  dept: boolean;
  memberships: boolean;
  creditCards: boolean;
  warranty: boolean;
  surveys: boolean;
  rph: boolean;
  basket: boolean;
  attach: boolean;
  status: boolean;
}

export function useStoreRoster() {
  const activePeriod = useStore(state => state.activePeriod);
  const rosterHistory = useStore(state => state.rosterHistory);

  const _rawroster = activePeriod ? ((rosterHistory || EMPTY_OBJ)[activePeriod] || EMPTY_OBJ) : EMPTY_OBJ;
  const roster = useMemo(() => {
    return (Object.values(_rawroster) as Employee[]).sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
  }, [_rawroster]);

  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(tempSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [tempSearch]);
  
  const [showAddForm, setShowAddForm] = useState(false);

  // Roster History and Performance Editor states
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false);
  
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showImporter, setShowImporter] = useState(false);

  // View options & layout configuration settings
  const [activeSubView, setActiveSubView] = useState('list');
  const [showViewSettings, setShowViewSettings] = useState(false);
  
  const [isDense, setIsDense] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 1024;
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsDense(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [visibleCols, setVisibleCols] = useState<VisibleCols>({
    hours: true,
    dept: true,
    memberships: true,
    creditCards: true,
    warranty: true,
    surveys: true,
    rph: true,
    basket: true,
    attach: true,
    status: true
  });

  const handleStartEdit = useCallback((emp: Employee) => {
    setEditingEmployee(emp);
  }, []);

  const DEPARTMENTS = ['All', 'Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  const filteredRoster = useMemo(() => {
    return (roster || EMPTY_ARR).filter(emp => {
      if (!emp) return false;
      const matchesSearch = emp?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false;
      const matchesDept = activeDept === 'All' || emp?.dept === activeDept;
      return matchesSearch && matchesDept;
    });
  }, [roster, searchTerm, activeDept]);

  return {
    selectedProfileEmployee, setSelectedProfileEmployee,
    searchTerm, setSearchTerm,
    tempSearch, setTempSearch,
    activeDept, setActiveDept,
    showAddForm, setShowAddForm,
    showNewPeriodForm, setShowNewPeriodForm,
    editingEmployee, setEditingEmployee,
    showImporter, setShowImporter,
    activeSubView, setActiveSubView,
    showViewSettings, setShowViewSettings,
    isDense, setIsDense,
    visibleCols, setVisibleCols,
    handleStartEdit,
    DEPARTMENTS,
    filteredRoster
  };
}
