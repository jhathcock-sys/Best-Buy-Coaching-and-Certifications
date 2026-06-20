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
import { INITIAL_ROSTER, DEFAULT_DEPT_GOALS } from './constants';

const getCurrentPeriodStr = () => {
  const d = new Date();
  return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
};

export const createMetricsSlice: StateCreator<StoreState, [], [], MetricsSlice> = (set, get) => {
  const defaultPeriod = getCurrentPeriodStr();
  const initialActivePeriod = defaultPeriod;

  return {
    rosterHistory: { [defaultPeriod]: INITIAL_ROSTER },
    activePeriod: initialActivePeriod,
    deptGoals: DEFAULT_DEPT_GOALS,
    metrics: { memberships: 0, creditCards: 0, warranty: 0, surveys: 5.0, rph: 0 },
    dailySnapshots: {},

    setRosterHistory: (rosterHistory) => set({ rosterHistory }),
    setActivePeriod: (activePeriod) => set({ activePeriod }),
    setDeptGoals: (deptGoals) => set({ deptGoals }),
    setMetrics: (metrics) => set({ metrics }),
    setDailySnapshots: (dailySnapshots) => set({ dailySnapshots }),

    addDailySnapshot: (dateKey, metrics) => {
      const currentSnapshots = get().dailySnapshots || {};
      const newSnapshots = { ...currentSnapshots, [dateKey]: metrics };
      set({ dailySnapshots: newSnapshots });
      if (get().dbConnected && get().storeId) {
        saveDailySnapshotToCloud(get().storeId, dateKey, metrics);
      }
    },

    saveDeptGoals: (newGoals) => {
      set({ deptGoals: newGoals });
      if (get().dbConnected && get().storeId) {
        saveDeptGoalsToCloud(get().storeId, newGoals);
      }
    },

    addEmployee: (newEmp) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = Array.isArray(rosterHistory[activePeriod]) ? rosterHistory[activePeriod] : [];
      
      const empWithTimestamp = {
        ...newEmp,
        lastUpdated: Date.now()
      };
      const updated = [...currentRoster, empWithTimestamp];
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
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
      
      set({ rosterHistory: newHistory });
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
      if (dbConnected) {
        saveRosterHistoryToCloud(updated, activePeriod);
      }
    },

    changePeriod: (p) => {
      set({ activePeriod: p });
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
      if (dbConnected) {
        saveRosterHistoryToCloud(newRoster, newPeriodName);
        saveActivePeriodToCloud(newPeriodName);
      }
    }
  };
};
