// @ts-nocheck
import { StateCreator } from 'zustand';
import { StoreState, MetricsSlice } from '../../types/store';
import { EmployeeSchema } from '../../schemas';
import { 
  saveActivePeriodToCloud,
  saveRosterHistoryToCloud,
  saveDeptGoalsToCloud,
  saveDailySnapshotToCloud
} from '../../services/firebase';
import { safeJsonParse, INITIAL_ROSTER, DEFAULT_DEPT_GOALS } from './constants';

export const createMetricsSlice: StateCreator<StoreState, [], [], MetricsSlice> = (set, get) => {
  const initialActivePeriod = localStorage.getItem('bby_active_period') || 'May 2026';

  let initialRosterHistory = { 'May 2026': INITIAL_ROSTER };
  const savedHistory = localStorage.getItem('bby_roster_history');
  if (savedHistory) {
    const parsed = safeJsonParse(savedHistory, null);
    if (parsed) {
      initialRosterHistory = parsed;
    }
  } else {
    const savedRoster = localStorage.getItem('bby_roster');
    if (savedRoster) {
      const parsedRoster = safeJsonParse(savedRoster, null);
      if (parsedRoster && Array.isArray(parsedRoster)) {
        let rosterToMigrate = parsedRoster;
        if (parsedRoster.some(e => e.id === 'jordan') || 
            parsedRoster.some(e => e.id === 'yinel' && e.dept === 'General Sales') || 
            !parsedRoster.some(e => e.id === 'yinel') || 
            !parsedRoster.some(e => e.id === 'yinel' && 'hours' in e)) {
          rosterToMigrate = INITIAL_ROSTER;
        }
        initialRosterHistory = { 'May 2026': rosterToMigrate };
        localStorage.setItem('bby_roster_history', JSON.stringify(initialRosterHistory));
      }
    }
  }

  let initialDeptGoals = DEFAULT_DEPT_GOALS;
  const savedGoals = localStorage.getItem('bby_dept_goals');
  if (savedGoals) {
    const parsed = safeJsonParse(savedGoals, null);
    if (parsed) {
      initialDeptGoals = parsed;
      let changed = false;
      if (!initialDeptGoals['Front End']) {
        initialDeptGoals['Front End'] = { memberships: 8.0,  creditCards: 12.5,  warranty: 11.0, surveys: 1.0, rph: 640 };
        changed = true;
      }
      if (!initialDeptGoals['General Sales']) {
        initialDeptGoals['General Sales'] = { memberships: 5000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 640 };
        changed = true;
      }
      if (changed) {
        localStorage.setItem('bby_dept_goals', JSON.stringify(initialDeptGoals));
      }
    }
  }

  const initialMetrics = safeJsonParse(localStorage.getItem('bby_metrics'), { memberships: 52, creditCards: 4, warranty: 12, surveys: 4.7, rph: 1050 });
  const initialDailySnapshots = safeJsonParse(localStorage.getItem('bby_daily_snapshots'), {});

  return {
    rosterHistory: initialRosterHistory,
    activePeriod: initialActivePeriod,
    deptGoals: initialDeptGoals,
    metrics: initialMetrics,
    dailySnapshots: initialDailySnapshots,

    setRosterHistory: (rosterHistory) => set({ rosterHistory }),
    setActivePeriod: (activePeriod) => set({ activePeriod }),
    setDeptGoals: (deptGoals) => set({ deptGoals }),
    setMetrics: (metrics) => set({ metrics }),
    setDailySnapshots: (dailySnapshots) => set({ dailySnapshots }),

    addDailySnapshot: (dateKey, metrics) => {
      const currentSnapshots = get().dailySnapshots || {};
      const newSnapshots = { ...currentSnapshots, [dateKey]: metrics };
      set({ dailySnapshots: newSnapshots });
      if (get().dbConnected) {
        saveDailySnapshotToCloud(dateKey, metrics);
      } else {
        localStorage.setItem('bby_daily_snapshots', JSON.stringify(newSnapshots));
      }
    },

    saveDeptGoals: (newGoals) => {
      set({ deptGoals: newGoals });
      localStorage.setItem('bby_dept_goals', JSON.stringify(newGoals));
      if (get().dbConnected) {
        saveDeptGoalsToCloud(newGoals);
      }
    },

    addEmployee: (newEmp) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = Array.isArray(rosterHistory[activePeriod]) ? rosterHistory[activePeriod] : [];
      
      try {
        const deletedIds = JSON.parse(localStorage.getItem('bby_deleted_employees') || '[]');
        const deletedNames = JSON.parse(localStorage.getItem('bby_deleted_employee_names') || '[]');
        const nameKey = newEmp.name.toLowerCase().trim();
        
        localStorage.setItem('bby_deleted_employees', JSON.stringify(deletedIds.filter(id => id !== newEmp.id)));
        localStorage.setItem('bby_deleted_employee_names', JSON.stringify(deletedNames.filter(n => n !== nameKey)));
      } catch (e) { console.error('Failed to update deleted employees storage', e); }

      const empWithTimestamp = {
        ...newEmp,
        lastUpdated: Date.now()
      };
      const updated = [...currentRoster, empWithTimestamp];
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
      localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
      if (dbConnected) {
        saveRosterHistoryToCloud(updated, activePeriod);
      }
    },

    editEmployee: (empId, updatedFields) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = Array.isArray(rosterHistory[activePeriod]) ? rosterHistory[activePeriod] : [];
      const updated = currentRoster.map(emp => {
        if (emp.id === empId) {
          return { ...emp, ...updatedFields, lastUpdated: Date.now() };
        }
        return emp;
      });
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
      localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
      if (dbConnected) {
        saveRosterHistoryToCloud(updated, activePeriod);
      }
    },

    deleteEmployee: (empId) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = Array.isArray(rosterHistory[activePeriod]) ? rosterHistory[activePeriod] : [];
      const targetEmp = currentRoster.find(emp => emp.id === empId);
      if (!targetEmp) return;
      
      const updated = currentRoster.filter(emp => emp.id !== empId);
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      
      try {
        const deletedIds = JSON.parse(localStorage.getItem('bby_deleted_employees') || '[]');
        if (!deletedIds.includes(empId)) {
          localStorage.setItem('bby_deleted_employees', JSON.stringify([...deletedIds, empId]));
        }
        
        const deletedNames = JSON.parse(localStorage.getItem('bby_deleted_employee_names') || '[]');
        const empNameKey = targetEmp.name.toLowerCase().trim();
        if (!deletedNames.includes(empNameKey)) {
          localStorage.setItem('bby_deleted_employee_names', JSON.stringify([...deletedNames, empNameKey]));
        }
      } catch (e) {
        console.error('Failed to update deleted employees storage', e);
      }

      set({ rosterHistory: newHistory });
      localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
      if (dbConnected) {
        saveRosterHistoryToCloud(updated, activePeriod);
      }
    },

    updateEmployeeDept: (empId, newDept) => {
      get().editEmployee(empId, { dept: newDept });
    },

    bulkImportEmployees: (importedEmployees, targetPeriod) => {
      const activePeriod = targetPeriod || get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = Array.isArray(rosterHistory[activePeriod]) ? rosterHistory[activePeriod] : [];
      
      try {
        const deletedNames = JSON.parse(localStorage.getItem('bby_deleted_employee_names') || '[]');
        const importedNames = importedEmployees.map(e => e.name.toLowerCase().trim());
        const filteredNames = deletedNames.filter(n => !importedNames.includes(n));
        localStorage.setItem('bby_deleted_employee_names', JSON.stringify(filteredNames));
      } catch (e) { console.error('Failed to clean tombstones', e); }

      const rosterMap = {};
      currentRoster.forEach(emp => {
        rosterMap[emp.name.toLowerCase().trim()] = emp;
      });

      importedEmployees.forEach(newEmp => {
        if (!newEmp.name || newEmp.name.trim() === 'Unknown Name' || newEmp.name.trim() === '') {
          return;
        }

        const nameKey = newEmp.name.toLowerCase().trim();
        let candidateEmp;

        if (rosterMap[nameKey]) {
          candidateEmp = { ...rosterMap[nameKey], ...newEmp, lastUpdated: Date.now() };
        } else {
          candidateEmp = { id: 'emp_' + Math.random().toString(36).substring(2, 11), ...newEmp, lastUpdated: Date.now() };
        }

        const parsed = EmployeeSchema.safeParse(candidateEmp);
        if (parsed.success) {
          rosterMap[nameKey] = parsed.data;
        } else {
          console.error(`Validation failed for imported employee ${newEmp.name}:`, parsed.error);
        }
      });

      const updated = Object.values(rosterMap);
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
      localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
      if (dbConnected) {
        saveRosterHistoryToCloud(updated, activePeriod);
      }
    },

    changePeriod: (p) => {
      set({ activePeriod: p });
      localStorage.setItem('bby_active_period', p);
      if (get().dbConnected) {
        saveActivePeriodToCloud(p);
      }
    },

    createPeriodArchive: (newPeriodName, copyOption) => {
      const rosterHistory = get().rosterHistory || {};
      const activePeriod = get().activePeriod;
      const dbConnected = get().dbConnected;
      const currentRoster = Array.isArray(rosterHistory[activePeriod]) ? rosterHistory[activePeriod] : [];
      let newRoster;
      const now = Date.now();
      
      if (copyOption === 'roster-only') {
        newRoster = currentRoster.map(emp => ({
          ...emp, hours: 0, memberships: 0, creditCards: 0, warranty: 0, surveys: 5.0, rph: 0, basket: 0, m365: 0, audio: 0, gap: 'None', lastUpdated: now
        }));
      } else if (copyOption === 'roster-and-metrics') {
        newRoster = currentRoster.map(emp => ({ ...emp, lastUpdated: now }));
      } else {
        newRoster = [];
      }
      
      const newHistory = { ...rosterHistory, [newPeriodName]: newRoster };
      set({ rosterHistory: newHistory, activePeriod: newPeriodName });
      localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
      localStorage.setItem('bby_active_period', newPeriodName);
      if (dbConnected) {
        saveRosterHistoryToCloud(newRoster, newPeriodName);
        saveActivePeriodToCloud(newPeriodName);
      }
    }
  };
};
