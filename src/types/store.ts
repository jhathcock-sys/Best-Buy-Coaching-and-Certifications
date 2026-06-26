import { 
  Employee, 
  DeptGoal, 
  MetricAverages, 
  PlaybookSettings, 
  Manager, 
  CoachingLog, 
  ShiftEvent,
  FollowUpTask,
  Trophy,
  ActionPlan,
  CustomScenario
} from './index';
import { UiSlice } from '../store/slices/uiSlice';

export interface AuthSlice {
  activeView: string;
  apiKey: string;
  dbConnected: boolean;
  isAuthenticated: boolean;
  storePin: string;
  activeManager: Manager | null;
  activeAdvisor: Employee | null;
  managers: Manager[];
  storeId: string | null;
  
  setActiveView: (view: string) => void;
  setApiKey: (key: string) => void;
  setDbConnected: (connected: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setStorePin: (pin: string) => void;
  loginAdvisor: (advisor: Employee | null) => void;
  login: (pin: string, storeId: string) => Promise<boolean>;
  logout: () => Promise<void> | void;
  handleSaveFirebaseConfig: (config: Record<string, string> | null) => void;
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

export interface RoleplayPayload {
  category: string;
  customerName: string;
  avatar: string;
  score: number;
  passed: boolean;
  growReport: { reality: string; [key: string]: unknown };
  metrics?: Partial<Employee>;
  scenarioId?: string;
}

export interface PlaybookSlice {
  recentSessions: CoachingLog[];
  customScenarios: CustomScenario[];
  playbookSettings: PlaybookSettings;
  followUpTasks: FollowUpTask[];
  coachingLogs: CoachingLog[];
  isPlaybookHydrated: boolean;

  setRecentSessions: (sessions: CoachingLog[]) => void;
  setCustomScenarios: (scenarios: CustomScenario[]) => void;
  setCoachingLogs: (logs: CoachingLog[]) => void;
  setFollowUpTasks: (tasks: FollowUpTask[]) => void;
  setPlaybookSettings: (settings: PlaybookSettings) => void;
  setIsPlaybookHydrated: (hydrated: boolean) => void;
  saveSettings: (payload: { apiKey: string, playbookSettings: PlaybookSettings }) => void;
  importCustomScenario: (newScenario: CustomScenario) => void;
  deleteCustomScenario: (scenarioId: string) => void;
  logCoachingSession: (session: Partial<CoachingLog> & { customerName: string }) => void;
  deleteCoachingSession: (index: number) => void;
  deleteCoachingLog: (logId: string) => Promise<void>;
  addFollowUpTask: (task: FollowUpTask) => void;
  completeFollowUpTask: (taskId: string) => void;
  completeRoleplay: (payload: RoleplayPayload) => Promise<void>;
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
  bulkImportEmployees: (importedEmployees: Partial<Employee>[], targetPeriod?: string) => void;
  changePeriod: (p: string) => void;
  createPeriodArchive: (newPeriodName: string, copyOption: string) => void;
  addTrophy: (empId: string, trophy: Trophy) => void;
  removeTrophy: (empId: string, trophyId: string) => void;
  addActionPlan: (empId: string, plan: ActionPlan) => void;
}

export type StoreState = AuthSlice & ShiftSlice & PlaybookSlice & MetricsSlice & UiSlice;
