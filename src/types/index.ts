export interface Employee {
  id: string;
  name: string;
  dept: string;
  hours: number;
  memberships: number;
  creditCards: number;
  warranty: number;
  surveys: number;
  rph: number;
  gap?: string;
  lastUpdated?: number;
  basket?: number;
  m365?: number;
  audio?: number;
  focus5?: boolean;
  trophies?: any[];
  actionPlans?: any[];
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

export interface ShiftEvent {
  id: string;
  date: string;
  type: string;
  manager: string;
  notes?: string;
  lastUpdated?: number;
  leaderName?: string;
  hours?: any[];
  totalPms?: number;
  totalApps?: number;
  totalRevenue?: number;
  action?: string;
  dueDate?: string;
  timestamp?: number;
  zoneAssignments?: Record<string, string[]>;
  breakSchedule?: any[];
  activeBreaks?: Record<string, string>;
  dailyRevenueGoal?: number;
  dailyAppsGoal?: number;
  dailyPmsGoal?: number;
  preExistingRevenue?: number;
  preExistingApps?: number;
  preExistingPms?: number;
  isWeekend?: boolean;
  wins?: any[];
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
