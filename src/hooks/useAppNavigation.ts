import { useState, useEffect } from 'react';

export function useAppNavigation(activeView, setActiveView) {
  // Local UI-only state
  const [selectedCoachingRosterEmployee, setSelectedCoachingRosterEmployee] = useState(null);
  const [prefillBuilderData, setPrefillBuilderData] = useState(null);
  const [prefillShadowEmployee, setPrefillShadowEmployee] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({
    overview: false,
    floorOps: false,
    coachingPractice: false,
    recordsSetup: false
  });

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Auto-expand category of active view
  useEffect(() => {
    if (activeView === 'dashboard') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsedCategories(prev => ({ ...prev, overview: false }));
    } else if (activeView === 'roster' || activeView === 'shadow' || activeView === 'floorLeader') {
      setCollapsedCategories(prev => ({ ...prev, floorOps: false }));
    } else if (activeView === 'roleplay' || activeView === 'coach') {
      setCollapsedCategories(prev => ({ ...prev, coachingPractice: false }));
    } else if (activeView === 'builder' || activeView === 'history' || activeView === 'playbook') {
      setCollapsedCategories(prev => ({ ...prev, recordsSetup: false }));
    }
  }, [activeView]);

  // Roster Interactions
  const handleCoachEmployeeFromRoster = (emp) => {
    setSelectedCoachingRosterEmployee(emp);
    setActiveView('coach');
  };

  const handleCreateLogFromRoster = (emp) => {
    setPrefillBuilderData(emp);
    setActiveView('builder');
  };

  const handleShadowEmployeeFromRoster = (emp) => {
    setPrefillShadowEmployee(emp);
    setActiveView('shadow');
  };

  return {
    selectedCoachingRosterEmployee, setSelectedCoachingRosterEmployee,
    prefillBuilderData, setPrefillBuilderData,
    prefillShadowEmployee, setPrefillShadowEmployee,
    collapsedCategories, setCollapsedCategories,
    toggleCategory,
    handleCoachEmployeeFromRoster,
    handleCreateLogFromRoster,
    handleShadowEmployeeFromRoster
  };
}
