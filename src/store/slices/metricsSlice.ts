import { StateCreator } from 'zustand';
import { StoreState, MetricsSlice } from '../../types/store';
import { Employee } from '../../types';
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
      const currentRoster = rosterHistory[activePeriod] || {};
      
      const empWithTimestamp = {
        ...newEmp,
        lastUpdated: Date.now()
      };
      const updated = { ...currentRoster, [newEmp.id]: empWithTimestamp };
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
      if (dbConnected) {
        saveRosterHistoryToCloud(get().storeId, updated, activePeriod);
      }
    },

    editEmployee: (empId, updatedFields) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = rosterHistory[activePeriod] || {};
      
      if (!currentRoster[empId]) return;

      const updated = {
        ...currentRoster,
        [empId]: {
          ...currentRoster[empId],
          ...updatedFields,
          lastUpdated: Date.now()
        }
      };
      
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
      if (dbConnected) {
        saveRosterHistoryToCloud(get().storeId, updated, activePeriod);
      }
    },

    deleteEmployee: (empId) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = rosterHistory[activePeriod] || {};
      
      if (!currentRoster[empId]) return;
      
      const updated = { ...currentRoster };
      delete updated[empId];
      
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      
      set({ rosterHistory: newHistory });
      if (dbConnected) {
        saveRosterHistoryToCloud(get().storeId, updated, activePeriod);
      }
    },

    updateEmployeeDept: (empId, newDept) => {
      get().editEmployee(empId, { dept: newDept });
    },

    addTrophy: (empId, trophy) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const currentRoster = rosterHistory[activePeriod] || {};
      const targetEmp = currentRoster[empId];
      if (!targetEmp) return;

      const currentTrophies = targetEmp.trophies || [];
      const updatedTrophies = [trophy, ...currentTrophies];
      
      get().editEmployee(empId, { trophies: updatedTrophies });
    },

    addActionPlan: (empId, plan) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const currentRoster = rosterHistory[activePeriod] || {};
      const targetEmp = currentRoster[empId];
      if (!targetEmp) return;

      const currentPlans = targetEmp.actionPlans || [];
      const updatedPlans = [plan, ...currentPlans];
      
      get().editEmployee(empId, { actionPlans: updatedPlans });
    },

    bulkImportEmployees: (importedEmployees, targetPeriod) => {
      const activePeriod = targetPeriod || get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const dbConnected = get().dbConnected;
      const currentRoster = rosterHistory[activePeriod] || {};
      
      const rosterMap = { ...currentRoster };

      importedEmployees.forEach(newEmp => {
        if (!newEmp.name || newEmp.name.trim() === 'Unknown Name' || newEmp.name.trim() === '') {
          return;
        }

        const nameKey = newEmp.name.toLowerCase().trim();
        let candidateEmp;
        
        // Find existing emp by name or create new one
        const existingEmp = Object.values(rosterMap).find((e: any) => e.name.toLowerCase().trim() === nameKey);

        if (existingEmp) {
          candidateEmp = { ...(existingEmp as any), ...newEmp, lastUpdated: Date.now() };
        } else {
          candidateEmp = { id: 'emp_' + Math.random().toString(36).substring(2, 11), ...newEmp, lastUpdated: Date.now() };
        }

        const parsed = EmployeeSchema.safeParse(candidateEmp);
        if (parsed.success) {
          rosterMap[parsed.data.id] = parsed.data;
        } else {
          console.error(`Validation failed for imported employee ${newEmp.name}:`, parsed.error);
        }
      });

      const newHistory = { ...rosterHistory, [activePeriod]: rosterMap };
      set({ rosterHistory: newHistory });
      if (dbConnected) {
        saveRosterHistoryToCloud(get().storeId, rosterMap, activePeriod);
      }
    },

    changePeriod: (p) => {
      set({ activePeriod: p });
      if (get().dbConnected) {
        saveActivePeriodToCloud(get().storeId, p);
      }
    },

    createPeriodArchive: (newPeriodName, copyOption) => {
      const rosterHistory = get().rosterHistory || {};
      const activePeriod = get().activePeriod;
      const dbConnected = get().dbConnected;
      const currentRoster = rosterHistory[activePeriod] || {};
      let newRoster: Record<string, Employee> = {};
      const now = Date.now();
      
      if (copyOption === 'roster-only') {
        Object.values(currentRoster).forEach((emp: any) => {
          newRoster[emp.id] = {
            ...emp, hours: 0, memberships: 0, creditCards: 0, warranty: 0, surveys: 5.0, rph: 0, basket: 0, m365: 0, audio: 0, gap: 'None', lastUpdated: now
          };
        });
      } else if (copyOption === 'roster-and-metrics') {
        Object.values(currentRoster).forEach((emp: any) => {
          newRoster[emp.id] = { ...emp, lastUpdated: now };
        });
      }
      
      const newHistory = { ...rosterHistory, [newPeriodName]: newRoster };
      set({ rosterHistory: newHistory, activePeriod: newPeriodName });
      if (dbConnected) {
        saveRosterHistoryToCloud(get().storeId, newRoster, newPeriodName);
        saveActivePeriodToCloud(get().storeId, newPeriodName);
      }
    }
  };
};
