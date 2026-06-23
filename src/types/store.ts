import { 
  Employee, 
  DeptGoal, 
  MetricAverages, 
  PlaybookSettings, 
  Manager, 
  CoachingLog, 
  ShiftEvent 
} from './index';
import { UiSlice } from '../store/slices/uiSlice';

export interface AuthSlice {
  activeView: string;
  apiKey: string;
  dbConnected: boolean;
  isAuthenticated: boolean;
  storePin: string;
  activeManager: Manager | null;
  activeAdvisor: any;
  managers: Manager[];
  storeId: string | null;
  
  setActiveView: (view: string) => void;
  setApiKey: (key: string) => void;
  setDbConnected: (connected: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setStorePin: (pin: string) => void;
  loginAdvisor: (advisor: any) => void;
  login: (pin: string, storeId: string) => boolean;
  logout: () => void;
  handleSaveFirebaseConfig: (config: any) => void;
  setManagers: (managers: Manager[]) => void;
  saveManagers: (newManagers: Manager[]) => void;
  setStoreId: (storeId: string | null) => void;
}

export interface ShiftSlice {
  floorLeaderShifts: ShiftEvent[];
  activeShift: ShiftEvent | null;

  setFloorLeaderShifts: (shifts: ShiftEvent[]) => void;
  setActiveShift: (shift: ShiftEvent | null) => void;
  saveFloorLeaderShift: (newShift: ShiftEvent) => void;
  deleteFloorLeaderShift: (shiftId: string) => void;
}

export interface PlaybookSlice {
  recentSessions: any[];
  customScenarios: any[];
  playbookSettings: PlaybookSettings;
  followUpTasks: any[];
  coachingLogs: CoachingLog[];

  setRecentSessions: (sessions: any[]) => void;
  setCustomScenarios: (scenarios: any[]) => void;
  setCoachingLogs: (logs: CoachingLog[]) => void;
  setFollowUpTasks: (tasks: any[]) => void;
  setPlaybookSettings: (settings: PlaybookSettings) => void;
  saveSettings: (payload: { apiKey: string, playbookSettings: PlaybookSettings }) => void;
  importCustomScenario: (newScenario: any) => void;
  deleteCustomScenario: (scenarioId: string) => void;
  logCoachingSession: (session: any) => void;
  deleteCoachingSession: (index: number) => void;
  deleteCoachingLog: (logId: string) => Promise<void>;
  addFollowUpTask: (task: any) => void;
  completeFollowUpTask: (taskId: string) => void;
  completeRoleplay: (payload: any) => Promise<void>;
}

export interface MetricsSlice {
  rosterHistory: Record<string, Record<string, Employee>>;
  activePeriod: string;
  deptGoals: Record<string, DeptGoal>;
  metrics: MetricAverages;
  dailySnapshots: Record<string, Employee[]>;

  setRosterHistory: (history: Record<string, Record<string, Employee>>) => void;
  setActivePeriod: (period: string) => void;
  setDeptGoals: (goals: Record<string, DeptGoal>) => void;
  setMetrics: (metrics: MetricAverages) => void;
  setDailySnapshots: (snapshots: Record<string, Employee[]>) => void;
  addDailySnapshot: (dateKey: string, metrics: Employee[]) => void;
  saveDeptGoals: (newGoals: Record<string, DeptGoal>) => void;
  addEmployee: (newEmp: Employee) => void;
  editEmployee: (empId: string, updatedFields: Partial<Employee>) => void;
  deleteEmployee: (empId: string) => void;
  updateEmployeeDept: (empId: string, newDept: string) => void;
  bulkImportEmployees: (importedEmployees: Employee[], targetPeriod?: string) => void;
  changePeriod: (p: string) => void;
  createPeriodArchive: (newPeriodName: string, copyOption: string) => void;
  addTrophy: (empId: string, trophy: any) => void;
  addActionPlan: (empId: string, plan: any) => void;
}

export type StoreState = AuthSlice & ShiftSlice & PlaybookSlice & MetricsSlice & UiSlice;
