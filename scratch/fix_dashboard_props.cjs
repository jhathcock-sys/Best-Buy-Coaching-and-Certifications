const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

const interfaceString = `
export interface DashboardProps {
  roster?: any[];
  coachingLogs?: any[];
  floorLeaderShifts?: any[];
  managers?: any[];
  recentSessions?: any[];
  onNavigate?: any;
  onCompleteFollowUpTask?: any;
  onCoachEmployee?: any;
  onCreateLog?: any;
  onShadowEmployee?: any;
  activePeriod?: string;
  activeManager?: string;
}

export default function Dashboard({
  roster = [],
  coachingLogs = [],
  floorLeaderShifts = [],
  managers = [],
  recentSessions = [],
  onNavigate,
  onCompleteFollowUpTask,
  onCoachEmployee,
  onCreateLog,
  onShadowEmployee,
  activePeriod,
  activeManager
}: DashboardProps) {
`;

content = content.replace(/export default function Dashboard\(\{\s*roster = \[\],\s*coachingLogs = \[\],\s*floorLeaderShifts = \[\],\s*managers = \[\],\s*recentSessions = \[\],\s*onNavigate,\s*onCompleteFollowUpTask,\s*onCoachEmployee,\s*onCreateLog,\s*onShadowEmployee,\s*activePeriod,\s*activeManager\s*\}\) \{/m, interfaceString);

// Fix remaining mapping errors inside JSX
content = content.replace(/roster\.map\(\(emp\) =>/g, 'roster.map((emp: any) =>');
content = content.replace(/coachingLogs\.map\(\(log\) =>/g, 'coachingLogs.map((log: any) =>');
content = content.replace(/floorLeaderShifts\.map\(\(shift\) =>/g, 'floorLeaderShifts.map((shift: any) =>');
content = content.replace(/pendingTasks\.map\(\(t\) =>/g, 'pendingTasks.map((t: any) =>');
content = content.replace(/activeFocus5Alerts\.map\(\(alert, idx\) =>/g, 'activeFocus5Alerts.map((alert: any, idx: number) =>');
content = content.replace(/leaderboardData\.map\(\(emp, idx\) =>/g, 'leaderboardData.map((emp: any, idx: number) =>');

fs.writeFileSync(dashPath, content);
console.log('Fixed Dashboard Props');
