const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

const missingLines = `import MetricCards from './Dashboard/MetricCards';
import CircularGauge from './Dashboard/CircularGauge';

import { useMemo, useState } from 'react';
import { TrendingUp, Compass, ShieldCheck, CreditCard, Star, DollarSign, ArrowUpRight, MessageSquare, Play, ClipboardList, Check, AlertCircle, Sparkles } from 'lucide-react';
import { calculateCVI } from '../store/cviHelper';
import { useStore } from '../store/useStore';
import { Employee, ShiftEvent, CoachingLog, FollowUpTask, DeptGoal } from '../types';

export interface DashboardProps {
  recentSessions?: any[];
  onNavigate?: any;
  roster?: any[];
  followUpTasks?: any[];
  onCompleteFollowUpTask?: any;
  deptGoals?: any;
  onCoachEmployee?: any;
  onCreateLog?: any;
  onShadowEmployee?: any;
  floorLeaderShifts?: any[];
  coachingLogs?: any[];
  activePeriod?: string;
  rosterHistory?: any;
  activeManager?: string;
}

export default function Dashboard({ 
  recentSessions, 
  onNavigate, 
  roster = [], 
  followUpTasks = [], 
  onCompleteFollowUpTask, 
  deptGoals = {}, 
  onCoachEmployee, 
  onCreateLog, 
  onShadowEmployee,
  floorLeaderShifts = [],
  coachingLogs = [],
  activePeriod,
  rosterHistory = {},
  activeManager
}: DashboardProps) {
  const [rankMetric, setRankMetric] = useState('memberships');
  const [chartMetric, setChartMetric] = useState('memberships');
  const dailySnapshots = useStore(state => state.dailySnapshots);

  const calculatedMetrics = useMemo(() => {
    if (!roster || roster.length === 0) return { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0 };
    `;

// The file currently looks like this at the top:
// import CircularGauge from './Dashboard/CircularGauge';
// 
// import { useMemo, useState } from 'react';
// import { TrendingUp, Compass, ShieldCheck, CreditCard, Star, DollarSign, ArrowUpRight, MessageSquare, Play, ClipboardList, Check, AlertCircle, Sparkles } from 'lucide-react';
// import { calculateCVI } from '../store/cviHelper';
// import { useStore } from '../store/useStore';
//     if (!roster || roster.length === 0) return { memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0 };
//     
//     let totalMemberships = 0;

const regexToReplace = /import CircularGauge from '\.\/Dashboard\/CircularGauge';[\s\S]*?if \(\!roster \|\| roster\.length === 0\) return \{ memberships: 0, creditCards: 0, warranty: 0, surveys: 0, rph: 0 \};/;

content = content.replace(regexToReplace, missingLines);

fs.writeFileSync(dashPath, content);
console.log('Fixed Dashboard missing lines');
