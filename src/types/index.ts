export interface Trophy {
  id?: string;
  type: string;
  category: string;
  date: string;
  icon: string;
}

export interface ActionPlan {
  id?: string;
  type: string;
  status: string;
  reason: string;
  dateCreated: string;
  planText?: string;
}

export interface Employee {
  id: string;
  name: string;
  dept: string;
  employeeNumber?: string;
  hours: number;
  memberships: number;
  creditCards: number;
  warranty: number;
  surveys: number;
  rph: number;
  transactions?: number;
  gap?: string;
  metricGap?: string;
  avatar?: string;
  lastUpdated?: number;
  basket?: number;
  m365?: number;
  audio?: number;
  focus5?: boolean;
  trophies?: Trophy[];
  actionPlans?: ActionPlan[];
  description?: string;
  initialGreeting?: string;
  personality?: string;
  coachingGoal?: string;
  revenue?: number;
  revenueOwed?: number;
  revenueStatus?: 'on-track' | 'off-track' | 'none';
  apps?: number;
  appsOwed?: number;
  appsStatus?: 'on-track' | 'off-track' | 'none';
  membershipsOwed?: number;
  membershipsStatus?: 'on-track' | 'off-track' | 'none';
}

export interface DeptGoal {
  memberships: number;
  membershipsType: 'Hours' | 'Dollars';
  creditCards: number;
  creditCardsType: 'Hours' | 'Dollars';
  warranty: number;
  surveys: number;
  rph: number;
  basket?: number;
  m365?: number;
  audio?: number;
}

export interface MetricAverages {
  memberships: number;
  creditCards: number;
  warranty: number;
  surveys: number;
  rph: number;
  revenue?: number;
  apps?: number;
  totalRevenue?: number;
  totalHours?: number;
}

export interface PlaybookSettings {
  useGemini: boolean;
  customSystemPrompt: string;
  allowedPhrases: string[];
  forbiddenPhrases: string[];
  storePin: string;
  trainingLogs: string[];
  aiMode?: string;
}

export interface Manager {
  name: string;
  role: string;
  pin?: string;
}

export interface CoachingLog {
  id?: string;
  employeeId: string;
  employeeName: string;
  category: string;
  avatar: string;
  score: number;
  date: string;
  notes: string;
  timestamp: number;
  coachName: string;
  customerName?: string;
  rating?: string;
}

export interface ShiftHourEntry {
  hourNumber: number;
  pms: number;
  apps: number;
  revenue: string | number;
  startRevenue?: string | number;
  endRevenue?: string | number;
  [key: string]: any;
}

export interface ShiftEvent {
  id: string;
  date: string;
  type: string;
  manager: string;
  notes?: string;
  lastUpdated?: number;
  leaderName?: string;
  hours?: ShiftHourEntry[];
  totalPms?: number;
  totalApps?: number;
  totalRevenue?: number;
  action?: string;
  dueDate?: string;
  timestamp?: number;
  zoneAssignments?: Record<string, string[]>;
  breakSchedule?: BreakEntry[];
  activeBreaks?: Record<string, string>;
  dailyRevenueGoal?: number;
  dailyAppsGoal?: number;
  dailyPmsGoal?: number;
  preExistingRevenue?: number;
  preExistingApps?: number;
  preExistingPms?: number;
  isWeekend?: boolean;
  wins?: ShiftWin[];
}

export interface FollowUpTask {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  action?: string;
  dueDate?: string;
  completed?: boolean;
  notes?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
export interface ShiftWin { id: string; empId: string; empName: string; zone: string; type: 'pm' | 'card' | 'app'; timestamp: number; hourIndex?: number; }
export interface ShiftSummary { totalPms: number; totalApps: number; totalRevenue: number; onTrackHours: number; onTrackRatio: number; }

export interface BreakEntry { id: string; empId: string; name: string; time: string; type: string; completed: boolean; }
export interface HistoricalShift { id: string; date: string; leaderName: string; isWeekend: boolean; totalHours: number; totalRevenue: number; totalPms: number; totalApps: number; onTrackRatio: number; }

