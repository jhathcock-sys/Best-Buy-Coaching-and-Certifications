import { useState } from 'react';

const isTodayWeekend = () => {
  const day = new Date().getDay();
  return day === 0 || day === 6;
};

export function useFloorSetup(activeManager, activeShift, setActiveShift) {
  const [leaderName, setLeaderName] = useState(activeManager?.name || '');
  const [dailyRevenueGoal, setDailyRevenueGoal] = useState('10000');
  const [dailyAppsGoal, setDailyAppsGoal] = useState('10');
  const [dailyPmsGoal, setDailyPmsGoal] = useState('15');
  const [preExistingRevenue, setPreExistingRevenue] = useState('0');
  const [preExistingApps, setPreExistingApps] = useState('0');
  const [preExistingPms, setPreExistingPms] = useState('0');
  const [isWeekend, setIsWeekend] = useState(isTodayWeekend());
  const [leaderTab, setLeaderTab] = useState('tracker');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [prevActiveManager, setPrevActiveManager] = useState(activeManager);
  
  if (activeManager !== prevActiveManager) {
    setPrevActiveManager(activeManager);
    if (activeManager) {
      setLeaderName(activeManager.name);
    }
  }

  const handleStartShift = (e) => {
    e.preventDefault();
    if (!leaderName.trim()) {
      alert('Please enter your name to start the floor lead shift.');
      return;
    }

    const newShift = {
      id: 'shift_' + Date.now(),
      leaderName: leaderName.trim(),
      date: new Date().toLocaleDateString(),
      isWeekend: isWeekend,
      dailyRevenueGoal: parseFloat(dailyRevenueGoal) || 10000,
      dailyAppsGoal: parseInt(dailyAppsGoal) || 10,
      dailyPmsGoal: parseInt(dailyPmsGoal) || 15,
      preExistingRevenue: parseFloat(preExistingRevenue) || 0,
      preExistingApps: parseInt(preExistingApps) || 0,
      preExistingPms: parseInt(preExistingPms) || 0,
      hours: [
        { hourNumber: 1, pms: 0, apps: 0, revenue: 0, startRevenue: '', endRevenue: '' }
      ],
      zoneAssignments: {
        'Computing': [],
        'Mobile': [],
        'Home Theatre': [],
        'Front End': [],
        'Geek Squad': [],
        'Appliances': []
      },
      breakSchedule: [],
      activeBreaks: {},
      wins: []
    };
    setActiveShift(newShift);
  };

  return {
    leaderName, setLeaderName,
    dailyRevenueGoal, setDailyRevenueGoal,
    dailyAppsGoal, setDailyAppsGoal,
    dailyPmsGoal, setDailyPmsGoal,
    preExistingRevenue, setPreExistingRevenue,
    preExistingApps, setPreExistingApps,
    preExistingPms, setPreExistingPms,
    isWeekend, setIsWeekend,
    leaderTab, setLeaderTab,
    isImportModalOpen, setIsImportModalOpen,
    handleStartShift
  };
}
