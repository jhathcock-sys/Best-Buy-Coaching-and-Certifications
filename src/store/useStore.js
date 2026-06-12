import { create } from 'zustand';
import { 
  isFirebaseConnected, 
  initFirebase,
  saveActivePeriodToCloud,
  saveRosterHistoryToCloud,
  savePlaybookSettingsToCloud,
  saveDeptGoalsToCloud,
  saveRecentSessionsToCloud,
  saveMetricsToCloud,
  saveFollowUpTaskToCloud,
  deleteFollowUpTaskFromCloud,
  saveFloorLeaderShiftToCloud,
  deleteFloorLeaderShiftFromCloud,
  saveCoachingLogToCloud,
  deleteCoachingLogFromCloud,
  saveManagersToCloud
} from '../services/firebase';

const INITIAL_ROSTER = [
  { id: 'yinel', name: 'Yinel', dept: 'Front End', hours: 34.5, memberships: 10, creditCards: 1, warranty: 22.2, surveys: 2, rph: 744, gap: 'BBY Credit Cards (1 App)' },
  { id: 'julianna', name: 'Julianna', dept: 'Computing', hours: 78.0, memberships: 6, creditCards: 2, warranty: 11.2, surveys: 1, rph: 1049, gap: 'None' },
  { id: 'muntarin', name: 'Muntarin', dept: 'Home Theatre', hours: 51.4, memberships: 4, creditCards: 0, warranty: 17.1, surveys: 1, rph: 868, gap: 'BBY Credit Cards (0 Apps)' },
  { id: 'ricky', name: 'Ricky', dept: 'General Sales', hours: 59.9, memberships: 3, creditCards: 7, warranty: 11.5, surveys: 0, rph: 649, gap: '5 Star Surveys' },
  { id: 'paulie', name: 'Paul / Paulie', dept: 'Appliances', hours: 25.0, memberships: 3, creditCards: 2, warranty: 11.6, surveys: 0, rph: 1436, gap: '5 Star Surveys' },
  { id: 'daniel', name: 'Daniel', dept: 'Mobile', hours: 30.8, memberships: 3, creditCards: 2, warranty: 7.5, surveys: 1, rph: 1386, gap: 'GSP Attach (7.5% vs 12.0%)' },
  { id: 'kevin', name: 'Kevin', dept: 'Geek Squad', hours: 43.6, memberships: 2, creditCards: 5, warranty: 4.0, surveys: 0, rph: 1460, gap: 'GSP Attach (4.0% vs 12.0%)' },
  { id: 'victor', name: 'Victor', dept: 'Home Theatre', hours: 129.1, memberships: 11, creditCards: 13, warranty: 8.0, surveys: 0.2, rph: 629, gap: '5 Star Surveys' },
  { id: 'ivan', name: 'Ivan', dept: 'Computing', hours: 69.3, memberships: 2, creditCards: 1, warranty: 6.8, surveys: 1, rph: 792, gap: 'GSP Attach & Memberships' },
  { id: 'avneet', name: 'Avneet', dept: 'Mobile', hours: 26.7, memberships: 2, creditCards: 1, warranty: 3.7, surveys: 1, rph: 404, gap: 'Multiple Gaps (1 Category)' }
];

const DEFAULT_DEPT_GOALS = {
  'Front End': { memberships: 8.0, membershipsType: 'Hours', creditCards: 12.5, creditCardsType: 'Hours', warranty: 11.0, surveys: 1.0, rph: 640 },
  'General Sales': { memberships: 5000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 640 },
  'Appliances': { memberships: 15000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 1200 },
  'Computing': { memberships: 8000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 900, basket: 150, m365: 60.0 },
  'Mobile': { memberships: 6000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 8.0, surveys: 1.0, rph: 700 },
  'Home Theatre': { memberships: 10000, membershipsType: 'Dollars', creditCards: 12000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 800, basket: 250, audio: 35.0 },
  'Geek Squad': { memberships: 5000, membershipsType: 'Dollars', creditCards: 15000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 500 }
};


const DEFAULT_PLAYBOOK_SETTINGS = {
  useGemini: false,
  customSystemPrompt: '',
  allowedPhrases: ['My Best Buy Plus', 'My Best Buy Total', 'Geek Squad Protection', 'AppleCare+'],
  forbiddenPhrases: ['warranty', 'pushy', 'contract'],
  storePin: '1234',
  trainingLogs: [
    `## 📋 Coaching Plan: Ricky / 5-Star Surveys

* **What**: Deliver a warmer checkout experience and explicitly ask for 5-star survey feedback at checkout.
* **How**: Slow down, write your name on the receipt sleeve, make direct eye contact, and say: "I hope I made your shopping easy today. My name is Ricky; please take 30 seconds to let me know how I did on the 5-star survey!"
* **Why**: Ensures customer loyalty, measures our store service indices, and highlights excellent human work on the checkout floor.
* **Behavior**: Secure at least 2 five-star survey mentions this week and maintain a 4.8+ survey average.
* **Validation**: Leader will perform 3 checkout observations this week and review the Sunday 5 Star survey comment log.

---
### 🔍 Background & Performance Context
* **Observed Strengths**: Excellent transactional speeds, zero cashier queue backlog, and highly professional checkout processing.
* **Performance Gap / Metric Focus**: Ricky has 0 5 Star surveys this month (store standard is maintaining 2+ five-star survey mentions per week).
* **Coaching Date**: 6/6/2026`
  ]
};

export const MANAGERS = [
  { name: 'Corey T.', role: 'Experience Manager Sales Focused', pin: '2001' },
  { name: 'Joey Z', role: 'Experience Manager Ops Focused', pin: '2002' },
  { name: 'Sam E', role: 'Experience Manager Sales Focus', pin: '2003' },
  { name: 'Lee R', role: 'Experience Supervisor Sales', pin: '2004' },
  { name: 'James H', role: 'Experience Supervisor Sales and Front End', pin: '2005' },
  { name: 'Sackett', role: 'GM', pin: '2006' },
  { name: 'Will C.', role: 'GM', pin: '2007' }
];

const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON parsing failed:', e);
    return fallback;
  }
};

export const useStore = create((set, get) => {
  // Check if API key exists in env
  const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim().length > 10);
  const initialApiKey = localStorage.getItem('bby_api_key') || (hasEnvKey ? import.meta.env.VITE_GEMINI_API_KEY : '');

  // Load initial store PIN from playbook settings
  let initialStorePin = '1234';
  let initialPlaybookSettings = DEFAULT_PLAYBOOK_SETTINGS;
  try {
    const savedSettings = localStorage.getItem('bby_playbook_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed) {
        initialPlaybookSettings = parsed;
        if (parsed.storePin) {
          initialStorePin = parsed.storePin;
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse playbook settings for PIN startup', e);
  }

  // Load initial active period
  const initialActivePeriod = localStorage.getItem('bby_active_period') || 'May 2026';

  // Load initial roster history with migration safeguards
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

  // Load initial department goals with Front End & General Sales safeguards
  let initialDeptGoals = DEFAULT_DEPT_GOALS;
  const savedGoals = localStorage.getItem('bby_dept_goals');
  if (savedGoals) {
    const parsed = safeJsonParse(savedGoals, null);
    if (parsed) {
      initialDeptGoals = parsed;
      let changed = false;
      if (!initialDeptGoals['Front End']) {
        initialDeptGoals['Front End'] = { 
          memberships: 8.0, membershipsType: 'Hours', 
          creditCards: 12.5, creditCardsType: 'Hours', 
          warranty: 11.0, surveys: 1.0, rph: 640 
        };
        changed = true;
      }
      if (!initialDeptGoals['General Sales']) {
        initialDeptGoals['General Sales'] = { 
          memberships: 5000, membershipsType: 'Dollars', 
          creditCards: 8000, creditCardsType: 'Dollars', 
          warranty: 11.0, surveys: 1.0, rph: 640 
        };
        changed = true;
      }
      if (changed) {
        localStorage.setItem('bby_dept_goals', JSON.stringify(initialDeptGoals));
      }
    }
  }

  // Load remaining operational states from localStorage
  const initialMetrics = safeJsonParse(localStorage.getItem('bby_metrics'), { memberships: 52, creditCards: 4, warranty: 12, surveys: 4.7, rph: 1050 });
  
  let initialActiveManager = null;
  try {
    const savedManager = sessionStorage.getItem('bby_active_manager');
    if (savedManager) {
      initialActiveManager = JSON.parse(savedManager);
    }
  } catch (e) {
    console.error('Failed to parse active manager from sessionStorage', e);
  }

  const initialRecentSessions = safeJsonParse(localStorage.getItem('bby_recent_sessions'), []);
  const initialCustomScenarios = safeJsonParse(localStorage.getItem('bby_custom_scenarios'), []);
  const initialFollowUpTasks = safeJsonParse(localStorage.getItem('bby_follow_up_tasks'), []);
  const initialFloorLeaderShifts = safeJsonParse(localStorage.getItem('bby_floor_leader_shifts'), []);
  const initialCoachingLogs = safeJsonParse(localStorage.getItem('bby_coaching_logs'), []);

  // Load initial managers from localStorage or defaults
  let initialManagers = MANAGERS;
  const savedManagers = localStorage.getItem('bby_managers');
  if (savedManagers) {
    const parsed = safeJsonParse(savedManagers, null);
    if (parsed && Array.isArray(parsed)) {
      initialManagers = parsed;
    }
  }

  return {
    // UI Routing & Authentication
    activeView: 'dashboard',
    apiKey: initialApiKey,
    dbConnected: isFirebaseConnected(),
    isAuthenticated: sessionStorage.getItem('bby_authenticated') === 'true',
    storePin: initialStorePin,
    activeManager: initialActiveManager,


    // Operational Data State
    rosterHistory: initialRosterHistory,
    activePeriod: initialActivePeriod,
    followUpTasks: initialFollowUpTasks,
    floorLeaderShifts: initialFloorLeaderShifts,
    coachingLogs: initialCoachingLogs,
    deptGoals: initialDeptGoals,
    metrics: initialMetrics,

    recentSessions: initialRecentSessions,
    customScenarios: initialCustomScenarios,
    playbookSettings: initialPlaybookSettings,
    managers: initialManagers,

    // UI & Auth Actions
    setActiveView: (view) => set({ activeView: view }),

    setApiKey: (key) => {
      set({ apiKey: key });
      if (key) {
        localStorage.setItem('bby_api_key', key);
      } else {
        localStorage.removeItem('bby_api_key');
      }
    },
    setDbConnected: (connected) => set({ dbConnected: connected }),
    setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
    setStorePin: (pin) => set({ storePin: pin }),

    login: (pin) => {
      const manager = get().managers.find(m => m.pin === pin);
      if (manager) {
        sessionStorage.setItem('bby_authenticated', 'true');
        sessionStorage.setItem('bby_active_manager', JSON.stringify(manager));
        set({ isAuthenticated: true, activeManager: manager });
        return true;
      }
      if (pin === get().storePin) {
        const guestManager = { name: 'Default Supervisor', role: 'Store Leader' };
        sessionStorage.setItem('bby_authenticated', 'true');
        sessionStorage.setItem('bby_active_manager', JSON.stringify(guestManager));
        set({ isAuthenticated: true, activeManager: guestManager });
        return true;
      }
      return false;
    },

    logout: () => {
      sessionStorage.removeItem('bby_authenticated');
      sessionStorage.removeItem('bby_active_manager');
      set({ isAuthenticated: false, activeManager: null });
    },

    handleSaveFirebaseConfig: (config) => {
      if (config) {
        localStorage.setItem('bby_firebase_config', JSON.stringify(config));
        const database = initFirebase(config);
        set({ dbConnected: !!database });
        if (database) {
          alert("Connected to Firebase Cloud Database! Roster data, department targets, and exemplar templates are now synchronized in real-time.");
        }
      } else {
        localStorage.removeItem('bby_firebase_config');
        initFirebase(null);
        set({ dbConnected: false });
        alert("Switched back to Local Offline Sandbox Mode successfully.");
      }
    },

    // Operational Data Setters (for Firestore subscribers)
    setRosterHistory: (rosterHistory) => set({ rosterHistory }),
    setActivePeriod: (activePeriod) => set({ activePeriod }),
    setFollowUpTasks: (followUpTasks) => set({ followUpTasks }),
    setFloorLeaderShifts: (floorLeaderShifts) => set({ floorLeaderShifts }),
    setCoachingLogs: (coachingLogs) => set({ coachingLogs }),
    setDeptGoals: (deptGoals) => set({ deptGoals }),
    setMetrics: (metrics) => set({ metrics }),

    setRecentSessions: (recentSessions) => set({ recentSessions }),
    setCustomScenarios: (customScenarios) => set({ customScenarios }),
    setPlaybookSettings: (playbookSettings) => {
      set({ playbookSettings });
      if (playbookSettings?.storePin) {
        set({ storePin: playbookSettings.storePin });
      }
    },
    setManagers: (managers) => set({ managers }),
    saveManagers: (newManagers) => {
      set({ managers: newManagers });
      localStorage.setItem('bby_managers', JSON.stringify(newManagers));
      if (get().dbConnected) {
        saveManagersToCloud(newManagers);
      }
    },

    // Roster Mutator Actions
    addEmployee: (newEmp) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory;
      const dbConnected = get().dbConnected;
      const updated = [...(rosterHistory[activePeriod] || []), newEmp];
      const newHistory = { ...rosterHistory, [activePeriod]: updated };
      set({ rosterHistory: newHistory });
      localStorage.setItem('bby_roster_history', JSON.stringify(newHistory));
      if (dbConnected) {
        saveRosterHistoryToCloud(updated, activePeriod);
      }
    },

    editEmployee: (empId, updatedFields) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory;
      const dbConnected = get().dbConnected;
      const updated = (rosterHistory[activePeriod] || []).map(emp => {
        if (emp.id === empId) {
          return { ...emp, ...updatedFields };
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

    updateEmployeeDept: (empId, newDept) => {
      get().editEmployee(empId, { dept: newDept });
    },

    bulkImportEmployees: (importedEmployees) => {
      const activePeriod = get().activePeriod;
      const rosterHistory = get().rosterHistory;
      const dbConnected = get().dbConnected;
      const currentRoster = rosterHistory[activePeriod] || [];
      const rosterMap = {};
      
      currentRoster.forEach(emp => {
        rosterMap[emp.name.toLowerCase()] = emp;
      });

      importedEmployees.forEach(newEmp => {
        const nameKey = newEmp.name.toLowerCase();
        if (rosterMap[nameKey]) {
          rosterMap[nameKey] = { ...rosterMap[nameKey], ...newEmp };
        } else {
          rosterMap[nameKey] = {
            id: 'emp_' + Math.random().toString(36).substring(2, 11),
            ...newEmp
          };
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
      const rosterHistory = get().rosterHistory;
      const activePeriod = get().activePeriod;
      const dbConnected = get().dbConnected;
      const currentRoster = rosterHistory[activePeriod] || [];
      let newRoster = [];
      if (copyOption === 'roster-only') {
        newRoster = currentRoster.map(emp => ({
          ...emp,
          hours: 0,
          memberships: 0,
          creditCards: 0,
          warranty: 0,
          surveys: 5.0,
          rph: 0,
          basket: 0,
          m365: 0,
          audio: 0,
          gap: 'None'
        }));
      } else if (copyOption === 'roster-and-metrics') {
        newRoster = currentRoster.map(emp => ({ ...emp }));
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
    },

    // Coaching Log Actions
    logCoachingSession: (session) => {
      const recentSessions = get().recentSessions;
      const coachingLogs = get().coachingLogs;
      const rosterHistory = get().rosterHistory;
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
      
      // Update global recentSessions
      const updatedSessions = [newSession, ...recentSessions].slice(0, 15);
      set({ recentSessions: updatedSessions });
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      if (dbConnected) {
        saveRecentSessionsToCloud(updatedSessions);
      }

      // Update coachingLogs sub-collection
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
      const updatedLogs = [newLog, ...coachingLogs];
      set({ coachingLogs: updatedLogs });
      localStorage.setItem('bby_coaching_logs', JSON.stringify(updatedLogs));
      if (dbConnected) {
        saveCoachingLogToCloud(newLog);
      }
    },

    deleteCoachingSession: (index) => {
      const recentSessions = get().recentSessions;
      const dbConnected = get().dbConnected;
      const updatedSessions = recentSessions.filter((_, idx) => idx !== index);
      set({ recentSessions: updatedSessions });
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      if (dbConnected) {
        saveRecentSessionsToCloud(updatedSessions);
      }
    },

    deleteCoachingLog: async (logId) => {
      const coachingLogs = get().coachingLogs;
      const recentSessions = get().recentSessions;
      const dbConnected = get().dbConnected;
      
      const logToDelete = coachingLogs.find(l => l.id === logId || (logId && l.timestamp === logId));
      if (!logToDelete) return;
      
      // Update coachingLogs state
      const updatedLogs = coachingLogs.filter(l => l.id !== logId && l.timestamp !== logId);
      set({ coachingLogs: updatedLogs });
      localStorage.setItem('bby_coaching_logs', JSON.stringify(updatedLogs));
      
      // Synchronize with recentSessions (Dashboard)
      const updatedSessions = recentSessions.filter(s => 
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

    // Follow-up Task Actions
    addFollowUpTask: (task) => {
      const followUpTasks = get().followUpTasks;
      const dbConnected = get().dbConnected;
      const newTask = {
        ...task,
        id: 'task_' + Date.now(),
        timestamp: Date.now()
      };
      const updated = [...followUpTasks, newTask];
      set({ followUpTasks: updated });
      localStorage.setItem('bby_follow_up_tasks', JSON.stringify(updated));
      if (dbConnected) {
        saveFollowUpTaskToCloud(newTask);
      }
    },

    completeFollowUpTask: (taskId) => {
      const followUpTasks = get().followUpTasks;
      const dbConnected = get().dbConnected;
      let targetTask = null;
      const updated = followUpTasks.map(t => {
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

    // Floor Leader Shifts Actions
    saveFloorLeaderShift: (newShift) => {
      const floorLeaderShifts = get().floorLeaderShifts;
      const dbConnected = get().dbConnected;
      const updated = [newShift, ...floorLeaderShifts];
      set({ floorLeaderShifts: updated });
      localStorage.setItem('bby_floor_leader_shifts', JSON.stringify(updated));
      if (dbConnected) {
        saveFloorLeaderShiftToCloud(newShift);
      }
    },

    deleteFloorLeaderShift: (shiftId) => {
      const floorLeaderShifts = get().floorLeaderShifts;
      const dbConnected = get().dbConnected;
      const updated = floorLeaderShifts.filter(s => s.id !== shiftId);
      set({ floorLeaderShifts: updated });
      localStorage.setItem('bby_floor_leader_shifts', JSON.stringify(updated));
      if (dbConnected) {
        deleteFloorLeaderShiftFromCloud(shiftId);
      }
    },

    // Roleplay Actions
    completeRoleplay: async ({ scenarioId, category, customerName, avatar, score, passed, growReport, metrics: newMetrics }) => {
      const recentSessions = get().recentSessions;
      const metrics = get().metrics;
      const dbConnected = get().dbConnected;

      // 1. Add session log
      const newSession = {
        customerName,
        category,
        avatar,
        score,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: growReport.reality
      };
      const updatedSessions = [newSession, ...recentSessions].slice(0, 15);
      set({ recentSessions: updatedSessions });
      localStorage.setItem('bby_recent_sessions', JSON.stringify(updatedSessions));
      if (dbConnected) {
        saveRecentSessionsToCloud(updatedSessions);
      }

      // 2. Average in metrics if passed
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
    },

    // Settings & Target Goal Actions
    saveSettings: ({ apiKey: newKey, playbookSettings: newSettings }) => {
      set({ apiKey: newKey, playbookSettings: newSettings });
      localStorage.setItem('bby_api_key', newKey);
      localStorage.setItem('bby_playbook_settings', JSON.stringify(newSettings));
      if (get().dbConnected) {
        savePlaybookSettingsToCloud(newSettings);
      }
    },

    saveDeptGoals: (newGoals) => {
      set({ deptGoals: newGoals });
      localStorage.setItem('bby_dept_goals', JSON.stringify(newGoals));
      if (get().dbConnected) {
        saveDeptGoalsToCloud(newGoals);
      }
    },

    // Custom Scenario Actions
    importCustomScenario: (newScenario) => {
      const customScenarios = get().customScenarios;
      const updated = [...customScenarios, newScenario];
      set({ customScenarios: updated });
      localStorage.setItem('bby_custom_scenarios', JSON.stringify(updated));
    },

    deleteCustomScenario: (scenarioId) => {
      const customScenarios = get().customScenarios;
      const updated = customScenarios.filter(s => s.id !== scenarioId);
      set({ customScenarios: updated });
      localStorage.setItem('bby_custom_scenarios', JSON.stringify(updated));
    }
  };
});
