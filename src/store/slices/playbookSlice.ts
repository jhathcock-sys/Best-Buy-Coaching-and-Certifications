// @ts-nocheck
import { StateCreator } from 'zustand';
import { StoreState, PlaybookSlice } from '../../types/store';
import { 
  savePlaybookSettingsToCloud,
  saveRecentSessionsToCloud,
  saveFollowUpTaskToCloud,
  saveCoachingLogToCloud,
  deleteCoachingLogFromCloud,
  saveMetricsToCloud
} from '../../services/firebase';
import { safeJsonParse, DEFAULT_PLAYBOOK_SETTINGS } from './constants';

export const createPlaybookSlice: StateCreator<StoreState, [], [], PlaybookSlice> = (set, get) => {
  let initialPlaybookSettings = DEFAULT_PLAYBOOK_SETTINGS;
  try {
    const savedSettings = localStorage.getItem('bby_playbook_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed) {
        initialPlaybookSettings = parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse playbook settings', e);
  }

  const initialRecentSessions = safeJsonParse(localStorage.getItem('bby_recent_sessions'), []);
  const initialCustomScenarios = safeJsonParse(localStorage.getItem('bby_custom_scenarios'), []);
  const initialFollowUpTasks = safeJsonParse(localStorage.getItem('bby_follow_up_tasks'), []);
  const initialCoachingLogs = safeJsonParse(localStorage.getItem('bby_coaching_logs'), []);

  return {
    recentSessions: initialRecentSessions,
    customScenarios: initialCustomScenarios,
    playbookSettings: initialPlaybookSettings,
    followUpTasks: initialFollowUpTasks,
    coachingLogs: initialCoachingLogs,

    setRecentSessions: (recentSessions) => set({ recentSessions }),
    setCustomScenarios: (customScenarios) => set({ customScenarios }),
    setCoachingLogs: (coachingLogs) => set({ coachingLogs }),
    setFollowUpTasks: (followUpTasks) => set({ followUpTasks }),
    
    setPlaybookSettings: (playbookSettings) => {
      set({ playbookSettings });
      if (playbookSettings?.storePin) {
        set({ storePin: playbookSettings.storePin });
      }
    },

    saveSettings: ({ apiKey: newKey, playbookSettings: newSettings }) => {
      set({ apiKey: newKey, playbookSettings: newSettings });
      localStorage.setItem('bby_api_key', newKey);
      localStorage.setItem('bby_playbook_settings', JSON.stringify(newSettings));
      if (get().dbConnected) {
        savePlaybookSettingsToCloud(newSettings);
      }
    },

    importCustomScenario: (newScenario) => {
      const customScenarios = get().customScenarios || [];
      const updated = [...(Array.isArray(customScenarios) ? customScenarios : []), newScenario];
      set({ customScenarios: updated });
      localStorage.setItem('bby_custom_scenarios', JSON.stringify(updated));
    },

    deleteCustomScenario: (scenarioId) => {
      const customScenarios = get().customScenarios || [];
      const updated = (Array.isArray(customScenarios) ? customScenarios : []).filter(s => s.id !== scenarioId);
      set({ customScenarios: updated });
      localStorage.setItem('bby_custom_scenarios', JSON.stringify(updated));
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
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      if (dbConnected) {
        saveRecentSessionsToCloud(updatedSessions);
      }

      const empId = session.employeeId || (rosterHistory[activePeriod] || []).find(e => e.name === session.customerName)?.id || `emp-${Date.now()}`;
      const newLog = {
        employeeId: empId,
        employeeName: session.customerName,
        category: session.category || 'Coaching',
        avatar: session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        score: session.score || 100,
        date: newSession.date,
        notes: session.notes || '',
        timestamp: Date.now(),
        coachName: get().activeManager?.name || 'Supervisor'
      };
      
      const updatedLogs = [newLog, ...(Array.isArray(coachingLogs) ? coachingLogs : [])];
      set({ coachingLogs: updatedLogs });
      localStorage.setItem('bby_coaching_logs', JSON.stringify(updatedLogs));
      if (dbConnected) {
        saveCoachingLogToCloud(newLog);
      }
    },

    deleteCoachingSession: (index) => {
      const recentSessions = get().recentSessions || [];
      const dbConnected = get().dbConnected;
      const updatedSessions = (Array.isArray(recentSessions) ? recentSessions : []).filter((_, idx) => idx !== index);
      set({ recentSessions: updatedSessions });
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      if (dbConnected) {
        saveRecentSessionsToCloud(updatedSessions);
      }
    },

    deleteCoachingLog: async (logId) => {
      const coachingLogs = get().coachingLogs || [];
      const recentSessions = get().recentSessions || [];
      const dbConnected = get().dbConnected;
      
      const logToDelete = (Array.isArray(coachingLogs) ? coachingLogs : []).find(l => l.id === logId || (logId && l.timestamp === logId));
      if (!logToDelete) return;
      
      const updatedLogs = (Array.isArray(coachingLogs) ? coachingLogs : []).filter(l => l.id !== logId && l.timestamp !== logId);
      set({ coachingLogs: updatedLogs });
      localStorage.setItem('bby_coaching_logs', JSON.stringify(updatedLogs));
      
      const updatedSessions = (Array.isArray(recentSessions) ? recentSessions : []).filter(s => 
        !(s.customerName === logToDelete.employeeName && s.date === logToDelete.date && s.notes === logToDelete.notes)
      );
      set({ recentSessions: updatedSessions });
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      
      if (dbConnected) {
        if (logToDelete.id) {
          await deleteCoachingLogFromCloud(logToDelete.id);
        }
        saveRecentSessionsToCloud(updatedSessions);
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
      localStorage.setItem('bby_follow_up_tasks', JSON.stringify(updated));
      if (dbConnected) {
        saveFollowUpTaskToCloud(newTask);
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
      localStorage.setItem('bby_follow_up_tasks', JSON.stringify(updated));
      if (dbConnected && targetTask) {
        saveFollowUpTaskToCloud(targetTask);
      }
    },

    completeRoleplay: async ({ category, customerName, avatar, score, passed, growReport, metrics: newMetrics }) => {
      const recentSessions = get().recentSessions || [];
      const metrics = get().metrics || { memberships: 0, creditCards: 0, warranty: 0, surveys: 5.0, rph: 0 };
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
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      if (dbConnected) {
        saveRecentSessionsToCloud(updatedSessions);
      }

      if (passed && newMetrics) {
        const averagedMetrics = {
          memberships: Math.round((metrics.memberships * 2 + newMetrics.memberships) / 3),
          creditCards: metrics.creditCards + newMetrics.creditCards,
          warranty: Math.round((metrics.warranty * 2 + newMetrics.warranty) / 3),
          surveys: Math.round(((metrics.surveys * 2 + newMetrics.surveys) / 3) * 10) / 10,
          rph: Math.round((metrics.rph * 2 + newMetrics.rph) / 3)
        };
        set({ metrics: averagedMetrics });
        localStorage.setItem('bby_metrics', JSON.stringify(averagedMetrics));
        if (dbConnected) {
          saveMetricsToCloud(averagedMetrics);
        }
      }
    }
  };
};
