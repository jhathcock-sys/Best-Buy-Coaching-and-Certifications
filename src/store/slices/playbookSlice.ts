import { StateCreator } from 'zustand';
import { StoreState, PlaybookSlice } from '../../types/store';
import { Employee, CoachingLog } from '../../types';
import { DEFAULT_PLAYBOOK_SETTINGS } from './constants';
import { 
  savePlaybookSettingsToCloud,
  saveRecentSessionsToCloud,
  saveCoachingLogToCloud,
  deleteCoachingLogFromCloud,
  saveFollowUpTaskToCloud,
  saveMetricsToCloud
} from '../../services/firebase';
import { CoachingLogSchema } from '../../schemas';

export const createPlaybookSlice: StateCreator<StoreState, [], [], PlaybookSlice> = (set, get) => {
  let initialPlaybookSettings = DEFAULT_PLAYBOOK_SETTINGS;

  return {
    recentSessions: [],
    customScenarios: [],
    playbookSettings: initialPlaybookSettings,
    isPlaybookHydrated: false,
    followUpTasks: [],
    coachingLogs: [],

    setRecentSessions: (recentSessions) => set({ recentSessions }),
    setCustomScenarios: (customScenarios) => set({ customScenarios }),
    setCoachingLogs: (coachingLogs) => set({ coachingLogs }),
    setFollowUpTasks: (followUpTasks) => set({ followUpTasks }),
    setIsPlaybookHydrated: (isPlaybookHydrated) => set({ isPlaybookHydrated }),
    
    setPlaybookSettings: (playbookSettings) => {
      set({ playbookSettings, isPlaybookHydrated: true });
      if (playbookSettings?.storePin) {
        set({ storePin: playbookSettings.storePin });
      }
    },

    saveSettings: ({ apiKey: newKey, playbookSettings: newSettings }) => {
      set({ apiKey: newKey, playbookSettings: newSettings });
      localStorage.setItem('bby_api_key', newKey);
      if (get().dbConnected) {
        savePlaybookSettingsToCloud(get().storeId, newSettings);
      }
    },

    importCustomScenario: (newScenario) => {
      const customScenarios = get().customScenarios || [];
      const updated = [...(Array.isArray(customScenarios) ? customScenarios : []), newScenario];
      set({ customScenarios: updated });
    },

    deleteCustomScenario: (scenarioId) => {
      const customScenarios = get().customScenarios || [];
      const updated = (Array.isArray(customScenarios) ? customScenarios : []).filter(s => s.id !== scenarioId);
      set({ customScenarios: updated });
    },

    logCoachingSession: (session) => {
      const recentSessions = get().recentSessions || [];
      const coachingLogs = get().coachingLogs || [];
      const rosterHistory = get().rosterHistory || {};
      const activePeriod = get().activePeriod;
      const dbConnected = get().dbConnected;

      const newSession = {
        customerName: session.customerName,
        category: session.category || 'Coaching',
        avatar: session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        score: session.score || 100,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: session.notes || ''
      };
      
      const updatedSessions = [newSession, ...(Array.isArray(recentSessions) ? recentSessions : [])].slice(0, 15);
      set({ recentSessions: updatedSessions });
      if (dbConnected) {
        saveRecentSessionsToCloud(get().storeId, updatedSessions);
      }

      const periodMap1 = rosterHistory[activePeriod] || {};
      const empId = session.employeeId || Object.values(periodMap1).find((e: Employee) => e.name === session.customerName)?.id || `emp-${Date.now()}`;
      
      let newLog: CoachingLog;
      try {
        newLog = CoachingLogSchema.parse({
          id: `log-${Date.now()}`,
          employeeId: empId,
          employeeName: session.customerName,
          customerName: session.customerName,
          category: session.category || 'Coaching',
          avatar: session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          score: session.score || 100,
          date: newSession.date,
          notes: session.notes || '',
          timestamp: Date.now(),
          coachName: get().activeManager?.name || 'Supervisor'
        }) as CoachingLog;
      } catch (err) {
        console.error('Coaching log validation failed:', err);
        return;
      }
      
      const updatedLogs = [newLog, ...(Array.isArray(coachingLogs) ? coachingLogs : [])];
      set({ coachingLogs: updatedLogs });
      if (dbConnected) {
        saveCoachingLogToCloud(get().storeId, newLog);
      }

      // Check for PIP generation (3 consecutive gaps/fails) or Perfect Score Trophies
      const periodMap2 = rosterHistory[activePeriod] || {};
      const targetEmp = periodMap2[empId];
      
      if (targetEmp) {
        if (newLog.score === 100 || session.rating === 'Exceptional') {
          get().addTrophy(targetEmp.id, {
            id: 'trophy_' + Date.now(),
            type: 'Exceptional Floor Observation',
            category: session.category || 'Coaching',
            date: new Date().toLocaleDateString(),
            icon: 'Award'
          });
        }

        const employeeLogs = updatedLogs.filter(l => l.employeeId === empId);
        if (employeeLogs.length >= 3) {
          const lastThree = employeeLogs.slice(0, 3);
          const allFailed = lastThree.every(l => l.score < 60);
          
          if (allFailed) {
            const currentPlans = targetEmp.actionPlans || [];
            const hasActivePip = currentPlans.some(p => p.status === 'Active');
            
            if (!hasActivePip) {
              const newPip = {
                id: 'pip_' + Date.now(),
                type: '30-Day Action Plan',
                reason: 'Recurring behavioral gaps identified in 3 consecutive observations',
                dateCreated: new Date().toLocaleDateString(),
                status: 'Active'
              };
              get().addActionPlan(targetEmp.id, newPip);
              
              get().addFollowUpTask({
                employeeId: targetEmp.id,
                employeeName: targetEmp.name,
                department: targetEmp.dept || 'Sales',
                action: `Week 1 PIP: Schedule an extended 1-on-1 to review recent coaching logs and reset expectations.`,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
              get().addFollowUpTask({
                employeeId: targetEmp.id,
                employeeName: targetEmp.name,
                department: targetEmp.dept || 'Sales',
                action: `Week 2 PIP: Run a Coach Simulator session addressing the recurring gaps in ${session.category || 'Floor Skills'}.`,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
            }
          }
        }
      }
    },

    deleteCoachingSession: (index) => {
      const recentSessions = get().recentSessions || [];
      const dbConnected = get().dbConnected;
      const updatedSessions = (Array.isArray(recentSessions) ? recentSessions : []).filter((_, idx) => idx !== index);
      set({ recentSessions: updatedSessions });
      if (dbConnected) {
        saveRecentSessionsToCloud(get().storeId, updatedSessions);
      }
    },

    deleteCoachingLog: async (logId) => {
      const coachingLogs = get().coachingLogs || [];
      const recentSessions = get().recentSessions || [];
      const dbConnected = get().dbConnected;
      
      const logToDelete = (Array.isArray(coachingLogs) ? coachingLogs : []).find(l => l.id === logId || (logId && String(l.timestamp) === String(logId)));
      if (!logToDelete) return;
      
      const updatedLogs = (Array.isArray(coachingLogs) ? coachingLogs : []).filter(l => l.id !== logId && String(l.timestamp) !== String(logId));
      set({ coachingLogs: updatedLogs });
      
      const updatedSessions = (Array.isArray(recentSessions) ? recentSessions : []).filter(s => 
        !(s.customerName === logToDelete.employeeName && s.date === logToDelete.date && s.notes === logToDelete.notes)
      );
      set({ recentSessions: updatedSessions });
      
      if (dbConnected) {
        if (logToDelete.id) {
          await deleteCoachingLogFromCloud(get().storeId, logToDelete.id);
        }
        saveRecentSessionsToCloud(get().storeId, updatedSessions);
      }
    },

    addFollowUpTask: (task) => {
      const followUpTasks = get().followUpTasks || [];
      const dbConnected = get().dbConnected;
      const newTask = {
        ...task,
        id: 'task_' + Date.now(),
        timestamp: Date.now()
      };
      const updated = [...(Array.isArray(followUpTasks) ? followUpTasks : []), newTask];
      set({ followUpTasks: updated });
      if (dbConnected) {
        saveFollowUpTaskToCloud(get().storeId, newTask);
      }
    },

    completeFollowUpTask: (taskId) => {
      const followUpTasks = get().followUpTasks || [];
      const dbConnected = get().dbConnected;
      let targetTask = null;
      const updated = (Array.isArray(followUpTasks) ? followUpTasks : []).map(t => {
        if (t.id === taskId) {
          targetTask = { ...t, completed: true };
          return targetTask;
        }
        return t;
      });
      set({ followUpTasks: updated });
      if (dbConnected && targetTask) {
        saveFollowUpTaskToCloud(get().storeId, targetTask);
      }
    },

    completeRoleplay: async ({ category, customerName, avatar, score, passed, growReport, metrics: newMetrics }) => {
      const recentSessions = get().recentSessions || [];
      const metrics = get().metrics || { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0, totalRevenue: 0, totalHours: 0 };
      const dbConnected = get().dbConnected;

      const newSession = {
        customerName,
        category,
        avatar,
        score,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: growReport.reality
      };
      const updatedSessions = [newSession, ...(Array.isArray(recentSessions) ? recentSessions : [])].slice(0, 15);
      set({ recentSessions: updatedSessions });
      if (dbConnected) {
        saveRecentSessionsToCloud(get().storeId, updatedSessions);
      }

      // Check for PIP generation (3 consecutive fails) or Perfect Score Trophies
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory || {};
      const periodMap3 = rosterHistory[activePeriod] || {};
      const targetEmp = Object.values(periodMap3).find((e: Employee) => e.name === customerName);
      
      if (targetEmp) {
        if (score === 100) {
          get().addTrophy(targetEmp.id, {
            id: 'trophy_' + Date.now(),
            type: 'Perfect Roleplay Score',
            category: category,
            date: new Date().toLocaleDateString(),
            icon: 'Star'
          });
        }

        const employeeSessions = updatedSessions.filter(s => s.customerName === customerName);
        if (employeeSessions.length >= 3) {
          const lastThree = employeeSessions.slice(0, 3);
          const allFailed = lastThree.every(s => s.score < 60);
          
          if (allFailed) {
            // Check if they already have an active PIP
            const currentPlans = targetEmp.actionPlans || [];
            const hasActivePip = currentPlans.some(p => p.status === 'Active');
            
            if (!hasActivePip) {
              const newPip = {
                id: 'pip_' + Date.now(),
                type: '30-Day Action Plan',
                reason: 'Failed 3 consecutive AI Roleplays',
                dateCreated: new Date().toLocaleDateString(),
                status: 'Active'
              };
              get().addActionPlan(targetEmp.id, newPip);
              
              // Auto-inject Follow-Up Tasks for the manager
              get().addFollowUpTask({
                employeeId: targetEmp.id,
                employeeName: targetEmp.name,
                department: targetEmp.dept || 'Sales',
                action: `Week 1 PIP: Shadow ${targetEmp.name} on the floor for 30 minutes to observe ${category} skills.`,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
              get().addFollowUpTask({
                employeeId: targetEmp.id,
                employeeName: targetEmp.name,
                department: targetEmp.dept || 'Sales',
                action: `Week 2 PIP: Run a Coach Simulator session addressing the recurring gaps in ${category}.`,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
              get().addFollowUpTask({
                employeeId: targetEmp.id,
                employeeName: targetEmp.name,
                department: targetEmp.dept || 'Sales',
                action: `Week 3 PIP: ${targetEmp.name} must score > 80% on the ${category} Roleplay Arena.`,
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
            }
          }
        }
      }

      if (passed && newMetrics) {
        const prevTotalRev = metrics.totalRevenue || (metrics.rph * 40); // fallback
        const prevTotalHours = metrics.totalHours || 40;
        const newTotalRev = prevTotalRev + (newMetrics.revenue || (newMetrics.rph * 8)); // simulated 8hr shift
        const newTotalHours = prevTotalHours + 8;
        const trueRph = newTotalHours > 0 ? Math.round(newTotalRev / newTotalHours) : 0;

        const prevWarranty = metrics.warranty || 0;
        const newWarrantyVal = newMetrics.warranty || 0;
        const trueWarranty = newTotalHours > 0 ? Math.round(((prevWarranty * prevTotalHours) + (newWarrantyVal * 8)) / newTotalHours) : 0;

        const averagedMetrics = {
          ...metrics,
          memberships: metrics.memberships + newMetrics.memberships,
          creditCards: metrics.creditCards + newMetrics.creditCards,
          warranty: trueWarranty,
          surveys: metrics.surveys + newMetrics.surveys,
          rph: trueRph,
          totalRevenue: newTotalRev,
          totalHours: newTotalHours
        };
        set({ metrics: averagedMetrics });
        if (dbConnected) {
          saveMetricsToCloud(get().storeId, averagedMetrics);
        }
      }
    }
  };
};
