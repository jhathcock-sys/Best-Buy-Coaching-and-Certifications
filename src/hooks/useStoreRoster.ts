import { useState, useEffect, useMemo } from 'react';

export function useStoreRoster(roster) {
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null);
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
  const [newPeriodName, setNewPeriodName] = useState('');
  const [copyOption, setCopyOption] = useState('roster-only');
  
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showImporter, setShowImporter] = useState(false);

  // View options & layout configuration settings
  const [activeSubView, setActiveSubView] = useState('list');
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [isDense, setIsDense] = useState(window.innerWidth < 1024);
  const [visibleCols, setVisibleCols] = useState({
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

  const handleStartEdit = (emp) => {
    setEditingEmployee(emp);
  };

  const DEPARTMENTS = ['All', 'Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  const filteredRoster = useMemo(() => {
    return roster.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = activeDept === 'All' || emp.dept === activeDept;
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
    newPeriodName, setNewPeriodName,
    copyOption, setCopyOption,
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
