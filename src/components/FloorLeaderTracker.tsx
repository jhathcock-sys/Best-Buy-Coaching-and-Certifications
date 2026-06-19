// @ts-nocheck
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useStore } from '../store/useStore';
import ZoneScheduler from './ZoneScheduler';
import BreakRunSheet from './BreakRunSheet';
import ImportScheduleModal from './ImportScheduleModal';
import FloorAudit from './FloorAudit';
import ShiftSimulator from './ShiftSimulator';
import FiveStarAuditor from './FiveStarAuditor';
import ShiftSetupForm from './FloorLeader/ShiftSetupForm';
import ShiftTrackerTab from './FloorLeader/ShiftTrackerTab';


export default function FloorLeaderTracker({ shifts = [], onSaveShift, onDeleteShift, roster = [], activeManager, onAddEmployee }) {
  const { apiKey } = useApp();
  
  // Auto-detect if today is weekend (0=Sun, 6=Sat)
  const isTodayWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  // Active shift states from Zustand store
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);

  const [leaderName, setLeaderName] = useState(activeManager?.name || '');
  const [dailyRevenueGoal, setDailyRevenueGoal] = useState('10000');
  const [dailyAppsGoal, setDailyAppsGoal] = useState('10');
  const [dailyPmsGoal, setDailyPmsGoal] = useState('15');
  const [preExistingRevenue, setPreExistingRevenue] = useState('0');
  const [preExistingApps, setPreExistingApps] = useState('0');
  const [preExistingPms, setPreExistingPms] = useState('0');
  const [isWeekend, setIsWeekend] = useState(isTodayWeekend());
  const [leaderTab, setLeaderTab] = useState('tracker');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Set leader name from logged in manager
  const [prevActiveManager, setPrevActiveManager] = useState(activeManager);
  
  if (activeManager !== prevActiveManager) {
    setPrevActiveManager(activeManager);
    if (activeManager) {
      setLeaderName(activeManager.name);
    }
  }


  // Zustand store actions
  const editEmployee = useStore((state) => state.editEmployee);
  const logCoachingSession = useStore((state) => state.logCoachingSession);

  // States for logging floor wins (credit cards and memberships)
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [winType, setWinType] = useState('pm'); // 'pm' or 'app'

  // States for OCV Floor Observation Card
  const [ocvEmpId, setOcvEmpId] = useState('');
  const [ocvConnect, setOcvConnect] = useState(false);
  const [ocvRecommend, setOcvRecommend] = useState(false);
  const [ocvProtect, setOcvProtect] = useState(false);
  const [ocvClose, setOcvClose] = useState(false);
  const [ocvNotes, setOcvNotes] = useState('');
  const [ocvSuccessMsg, setOcvSuccessMsg] = useState(false);

  const handleLogOcvObservation = () => {
    if (!ocvEmpId) {
      alert("Please select an associate for the OCV Floor Observation!");
      return;
    }

    const emp = roster.find(e => e.id === ocvEmpId);
    if (!emp) return;

    const checkedCount = (ocvConnect ? 1 : 0) + (ocvRecommend ? 1 : 0) + (ocvProtect ? 1 : 0) + (ocvClose ? 1 : 0);
    const score = Math.round((checkedCount / 4) * 100);

    const notesText = `### 30-Second OCV Floor Observation
**Benchmarks Met:** ${checkedCount}/4 (${score}%)
- **Connect:** ${ocvConnect ? '✅ Met' : '❌ Missed'} (warm greeting, intro, open discovery)
- **Recommend:** ${ocvRecommend ? '✅ Met' : '❌ Missed'} (solution match, Good/Better/Best demo)
- **Protect:** ${ocvProtect ? '✅ Met' : '❌ Missed'} (Plus/Total memberships & protection attach)
- **Close:** ${ocvClose ? '✅ Met' : '❌ Missed'} (Best Buy Card financing pitch & survey ask)

**Supervisor observations & feedback:**
${ocvNotes || 'No specific observation notes logged.'}`;

    logCoachingSession({
      customerName: emp.name,
      employeeId: emp.id,
      category: 'OCV Observation',
      score: score,
      avatar: emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      notes: notesText
    });

    setOcvSuccessMsg(true);
    setTimeout(() => setOcvSuccessMsg(false), 3000);

    // Reset OCV form
    setOcvEmpId('');
    setOcvConnect(false);
    setOcvRecommend(false);
    setOcvProtect(false);
    setOcvClose(false);
    setOcvNotes('');
  };


  const getEmployeesOnShift = () => {
    if (!activeShift || !activeShift.zoneAssignments) return [];
    const activeEmpIds = new Set();
    Object.values(activeShift.zoneAssignments).forEach(ids => {
      if (Array.isArray(ids)) {
        ids.forEach(id => activeEmpIds.add(id));
      }
    });
    return roster.filter(emp => activeEmpIds.has(emp.id));
  };

  const handleLogFloorWin = () => {
    if (!activeShift) return;
    if (!selectedEmpId) {
      alert("Please select an associate first!");
      return;
    }
    const emp = roster.find(e => e.id === selectedEmpId);
    if (!emp) return;

    let empZone = 'Floor';
    if (activeShift.zoneAssignments) {
      Object.entries(activeShift.zoneAssignments).forEach(([zoneName, ids]) => {
        if (ids.includes(emp.id)) {
          empZone = zoneName;
        }
      });
    }

    const latestIdx = activeShift.hours && activeShift.hours.length > 0 ? activeShift.hours.length - 1 : 0;
    const newWin = {
      id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      empId: emp.id,
      empName: emp.name,
      zone: empZone,
      type: winType,
      timestamp: Date.now(),
      hourIndex: latestIdx
    };

    // Update hourly count of the current hour interval
    const updatedHours = [...(activeShift.hours || [])];
    if (updatedHours[latestIdx]) {
      const targetHour = { ...updatedHours[latestIdx] };
      if (winType === 'pm') {
        targetHour.pms = (targetHour.pms || 0) + 1;
      } else {
        targetHour.apps = (targetHour.apps || 0) + 1;
      }
      updatedHours[latestIdx] = targetHour;
    }

    // Append win history
    const updatedWins = [...(activeShift.wins || []), newWin];

    setActiveShift({
      ...activeShift,
      hours: updatedHours,
      wins: updatedWins
    });

    // Update roster employee metrics
    editEmployee(emp.id, {
      memberships: (emp.memberships || 0) + (winType === 'pm' ? 1 : 0),
      creditCards: (emp.creditCards || 0) + (winType === 'app' ? 1 : 0)
    });

    // Clear dropdown selection
    setSelectedEmpId('');
  };

  const handleUndoWin = (winId) => {
    if (!activeShift) return;
    const win = (activeShift.wins || []).find(w => w.id === winId);
    if (!win) return;

    const emp = roster.find(e => e.id === win.empId);

    const updatedHours = [...(activeShift.hours || [])];
    const hourIdx = win.hourIndex;
    if (updatedHours[hourIdx]) {
      const targetHour = { ...updatedHours[hourIdx] };
      if (win.type === 'pm') {
        targetHour.pms = Math.max(0, (targetHour.pms || 0) - 1);
      } else {
        targetHour.apps = Math.max(0, (targetHour.apps || 0) - 1);
      }
      updatedHours[hourIdx] = targetHour;
    }

    const updatedWins = (activeShift.wins || []).filter(w => w.id !== winId);

    setActiveShift({
      ...activeShift,
      hours: updatedHours,
      wins: updatedWins
    });

    if (emp) {
      editEmployee(emp.id, {
        memberships: Math.max(0, (emp.memberships || 0) - (win.type === 'pm' ? 1 : 0)),
        creditCards: Math.max(0, (emp.creditCards || 0) - (win.type === 'app' ? 1 : 0))
      });
    }
  };

  const getShiftLeaderboard = () => {
    const onShift = getEmployeesOnShift();
    const targetList = onShift.length > 0 ? onShift : roster;
    
    const leaderboard = targetList.map(emp => {
      const empWins = (activeShift?.wins || []).filter(w => w.empId === emp.id);
      const pms = empWins.filter(w => w.type === 'pm').length;
      const apps = empWins.filter(w => w.type === 'app').length;
      return {
        ...emp,
        shiftPms: pms,
        shiftApps: apps,
        shiftTotal: pms + apps
      };
    });

    return leaderboard.sort((a, b) => {
      if (b.shiftTotal !== a.shiftTotal) {
        return b.shiftTotal - a.shiftTotal;
      }
      return a.name.localeCompare(b.name);
    });
  };
  

  const handleStartShift = (e) => {
    e.preventDefault();
    if (!leaderName.trim()) {
      alert('Please enter your name to start the floor lead shift.');
      return;
    }

    const newShift = {
      id: 'shift_' + Date.now(),
      leaderName: leaderName.trim(),
      date: new Date().toLocaleDateString(),
      isWeekend: isWeekend,
      dailyRevenueGoal: parseFloat(dailyRevenueGoal) || 10000,
      dailyAppsGoal: parseInt(dailyAppsGoal) || 10,
      dailyPmsGoal: parseInt(dailyPmsGoal) || 15,
      preExistingRevenue: parseFloat(preExistingRevenue) || 0,
      preExistingApps: parseInt(preExistingApps) || 0,
      preExistingPms: parseInt(preExistingPms) || 0,
      hours: [
        { hourNumber: 1, pms: 0, apps: 0, revenue: 0, startRevenue: '', endRevenue: '' }
      ],
      zoneAssignments: {
        'Computing': [],
        'Mobile': [],
        'Home Theatre': [],
        'Front End': [],
        'Geek Squad': [],
        'Appliances': []
      },
      breakSchedule: [],
      activeBreaks: {},
      wins: []
    };
    setActiveShift(newShift);
  };

  const handleAddHour = () => {
    if (!activeShift) return;
    const nextHour = activeShift.hours.length + 1;
    const prevHour = activeShift.hours[activeShift.hours.length - 1];
    const initialStart = prevHour && prevHour.endRevenue !== undefined && prevHour.endRevenue !== '' ? prevHour.endRevenue : '';
    const updated = {
      ...activeShift,
      hours: [
        ...activeShift.hours,
        { hourNumber: nextHour, pms: 0, apps: 0, revenue: 0, startRevenue: initialStart, endRevenue: '' }
      ]
    };
    setActiveShift(updated);
  };

  const handleRemoveHour = (index) => {
    if (!activeShift || activeShift.hours.length <= 1) return;
    const updatedHours = activeShift.hours.filter((_, i) => i !== index).map((h, idx) => ({
      ...h,
      hourNumber: idx + 1
    }));
    setActiveShift({
      ...activeShift,
      hours: updatedHours
    });
  };

  const handleUpdateMetric = (hourIndex, field, delta) => {
    if (!activeShift) return;
    const updatedHours = activeShift.hours.map((h, i) => {
      if (i === hourIndex) {
        const newVal = Math.max(0, h[field] + delta);
        return { ...h, [field]: newVal };
      }
      return h;
    });
    setActiveShift({
      ...activeShift,
      hours: updatedHours
    });
  };



  const handleUpdateStartRevenue = (hourIndex, value) => {
    if (!activeShift) return;
    const updatedHours = activeShift.hours.map((h, idx) => {
      if (idx === hourIndex) {
        const startVal = value === '' ? '' : (parseFloat(value) || 0);
        const endVal = h.endRevenue !== undefined && h.endRevenue !== '' ? parseFloat(h.endRevenue) : '';
        
        let netRevenue = h.revenue || 0;
        if (startVal !== '' && endVal !== '') {
          netRevenue = Math.max(0, endVal - startVal);
        }
        
        return {
          ...h,
          startRevenue: startVal,
          revenue: netRevenue
        };
      }
      return h;
    });
    setActiveShift({
      ...activeShift,
      hours: updatedHours
    });
  };

  const handleUpdateEndRevenue = (hourIndex, value) => {
    if (!activeShift) return;
    const updatedHours = activeShift.hours.map((h, idx) => {
      if (idx === hourIndex) {
        const endVal = value === '' ? '' : (parseFloat(value) || 0);
        const startVal = h.startRevenue !== undefined && h.startRevenue !== '' ? parseFloat(h.startRevenue) : '';
        
        let netRevenue = h.revenue || 0;
        if (startVal !== '' && endVal !== '') {
          netRevenue = Math.max(0, endVal - startVal);
        }
        
        return {
          ...h,
          endRevenue: endVal,
          revenue: netRevenue
        };
      }
      return h;
    });
    setActiveShift({
      ...activeShift,
      hours: updatedHours
    });
  };

  // Status check helper
  const checkHourStatus = (pms, apps, isWeekendShift) => {
    const pmGoal = isWeekendShift ? 3 : 2;
    const appGoal = isWeekendShift ? 3 : 2;
    return pms >= pmGoal && apps >= appGoal;
  };

  const handleEndShift = () => {
    if (!activeShift) return;
    if (confirm('Are you sure you want to end your shift? This will archive your floor leading logs.')) {
      // Calculate overall statistics
      const hoursArray = Array.isArray(activeShift.hours) ? activeShift.hours : [];
      const totalPms = hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0);
      const totalApps = hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0);
      const totalRevenue = hoursArray.reduce((sum, h) => sum + (parseFloat(h.revenue) || 0), 0) + (activeShift.preExistingRevenue || 0);
      const onTrackCount = hoursArray.filter(h => 
        checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
      ).length;
      const onTrackRatio = hoursArray.length > 0 ? Math.round((onTrackCount / hoursArray.length) * 100) : 0;

      const archivedShift = {
        ...activeShift,
        endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        totalPms,
        totalApps,
        totalRevenue,
        totalHours: hoursArray.length,
        onTrackRatio
      };

      try {
        if (onSaveShift) {
          onSaveShift(archivedShift);
        }
      } catch (e) {
        toast.error("Failed to archive floor leader shift.");
        console.error("Failed to archive floor leader shift:", e);
      } finally {
        setActiveShift(null);
        setLeaderName('');
        setPreExistingRevenue('0');
        setPreExistingApps('0');
        setPreExistingPms('0');
        setPreExistingPms('0');
      }
    }
  };

  // Summary Metrics calculations for Active Shift
  const hoursArray = activeShift && Array.isArray(activeShift.hours) ? activeShift.hours : [];
  const activeSummary = activeShift ? {
    totalPms: hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0),
    totalApps: hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0),
    totalRevenue: hoursArray.reduce((sum, h) => sum + (parseFloat(h.revenue) || 0), 0) + (activeShift.preExistingRevenue || 0),
    onTrackHours: hoursArray.filter(h => 
      checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
    ).length,
    onTrackRatio: hoursArray.length > 0 ? Math.round((hoursArray.filter(h => 
      checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
    ).length / hoursArray.length) * 100) : 0
  } : null;


  const handleAssignZone = (zone, empId) => {
    if (!activeShift) return;
    const emp = roster.find(e => e.id === empId);
    if (!emp) return;

    const currentAssignments = activeShift.zoneAssignments || {
      'Computing': [], 'Mobile': [], 'Home Theatre': [], 'Front End': [], 'Geek Squad': [], 'Appliances': []
    };

    const cleanedAssignments = {};
    Object.keys(currentAssignments).forEach(z => {
      cleanedAssignments[z] = (currentAssignments[z] || []).filter(id => id !== empId);
    });

    cleanedAssignments[zone] = [...(cleanedAssignments[zone] || []), empId];

    setActiveShift({
      ...activeShift,
      zoneAssignments: cleanedAssignments
    });
  };

  const handleUnassignZone = (zone, empId) => {
    if (!activeShift) return;
    const currentAssignments = activeShift.zoneAssignments || {
      'Computing': [], 'Mobile': [], 'Home Theatre': [], 'Front End': [], 'Geek Squad': [], 'Appliances': []
    };
    const updated = {
      ...currentAssignments,
      [zone]: (currentAssignments[zone] || []).filter(id => id !== empId)
    };
    setActiveShift({
      ...activeShift,
      zoneAssignments: updated
    });
  };

  const handleAddBreak = (newBreak) => {
    if (!activeShift) return;
    const currentBreaks = activeShift.breakSchedule || [];
    setActiveShift({
      ...activeShift,
      breakSchedule: [...currentBreaks, newBreak]
    });
  };

  const handleToggleBreak = (breakId) => {
    if (!activeShift) return;
    const currentBreaks = activeShift.breakSchedule || [];
    const updated = currentBreaks.map(b => {
      if (b.id === breakId) {
        return { ...b, completed: !b.completed };
      }
      return b;
    });
    setActiveShift({
      ...activeShift,
      breakSchedule: updated
    });
  };

  const handleDeleteBreak = (breakId) => {
    if (!activeShift) return;
    const currentBreaks = activeShift.breakSchedule || [];
    const updated = currentBreaks.filter(b => b.id !== breakId);
    setActiveShift({
      ...activeShift,
      breakSchedule: updated
    });
  };

  const handleToggleBreakState = (empId, breakType) => {
    if (!activeShift) return;
    const currentActiveBreaks = activeShift.activeBreaks || {};
    const updatedActiveBreaks = { ...currentActiveBreaks };

    if (breakType) {
      // Start a break
      updatedActiveBreaks[empId] = breakType;
      
      // Auto-log break as completed in the Run Sheet
      const emp = roster.find(e => e.id === empId);
      const empName = emp ? emp.name : 'Associate';
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newBreak = {
        id: `manual_break_${empId}_${Date.now()}`,
        empId,
        name: empName,
        time: nowTimeStr,
        type: breakType === '15m' ? '15 min Break' : '30 min Lunch',
        completed: true
      };

      setActiveShift({
        ...activeShift,
        activeBreaks: updatedActiveBreaks,
        breakSchedule: [...(activeShift.breakSchedule || []), newBreak]
      });
    } else {
      // End break
      delete updatedActiveBreaks[empId];
      setActiveShift({
        ...activeShift,
        activeBreaks: updatedActiveBreaks
      });
    }
  };

  const handleImportSchedule = ({ zoneAssignments, breakSchedule }) => {
    if (!activeShift) return;
    
    // Merge zones: for each zone, merge new assignments with existing ones, avoiding duplicates
    const currentZones = activeShift.zoneAssignments || {
      'Computing': [], 'Mobile': [], 'Home Theatre': [], 'Front End': [], 'Geek Squad': [], 'Appliances': []
    };
    
    const mergedZones = {};
    Object.keys(currentZones).forEach(z => {
      const existingIds = currentZones[z] || [];
      const newIds = zoneAssignments[z] || [];
      mergedZones[z] = Array.from(new Set([...existingIds, ...newIds]));
    });

    // Append breaks
    const currentBreaks = activeShift.breakSchedule || [];
    const mergedBreaks = [...currentBreaks, ...breakSchedule];

    setActiveShift({
      ...activeShift,
      zoneAssignments: mergedZones,
      breakSchedule: mergedBreaks
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header Panel */}
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Floor Leader Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track hourly credit cards (Apps) and memberships (PMs) targets in real-time during your floor-leading shift.
        </p>
      </div>

      {!activeShift ? (
        <ShiftSetupForm activeManager={activeManager} />
      ) : (
        /* ACTIVE MONITORING VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Shift Controls & Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            
            {/* Active Leader Details */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0, 70, 190, 0.08)', border: '1px solid rgba(0,70,190,0.2)' }}>
                <Clock size={24} color="var(--bby-blue)" />
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Active Shift Leader</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.1rem 0 0 0' }}>{activeShift.leaderName}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {activeShift.isWeekend ? 'Weekend Targets (3/3)' : 'Weekday Targets (2/2)'}
                </span>
              </div>
            </div>

            {/* Total Revenue Shift Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Revenue</span>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '0.2rem', color: 'var(--info)' }}>
                ${activeSummary.totalRevenue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accumulated across shift</span>
            </div>

            {/* Total PMs Shift Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total PMs (Memberships)</span>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '0.2rem', color: '#fff' }}>
                {activeSummary.totalPms}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accumulated across shift</span>
            </div>

            {/* Total Apps Shift Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Apps (Credit Cards)</span>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '0.2rem', color: '#fff' }}>
                {activeSummary.totalApps}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Accumulated across shift</span>
            </div>

            {/* Overall Shift Standing Health */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Shift On-Track Rate</span>
              <div style={{ 
                fontSize: '2rem', 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 800, 
                marginTop: '0.2rem',
                color: activeSummary.onTrackRatio >= 70 ? 'var(--success)' : activeSummary.onTrackRatio >= 40 ? 'var(--bby-yellow)' : 'var(--error)'
              }}>
                {activeSummary.onTrackRatio}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {activeSummary.onTrackHours} of {activeShift.hours.length} hours meeting target
              </span>
            </div>

          </div>

          {/* Tab Selection Header bar with End Shift */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'tracker' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'tracker' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('tracker')}
              >
                Hourly Tracker
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'scheduler' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'scheduler' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('scheduler')}
              >
                Zones & Breaks Run Sheet
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'audit' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'audit' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('audit')}
              >
                Floor Audit (Vision)
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'sim' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'sim' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('sim')}
              >
                Shift Simulator
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'survey' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'survey' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('survey')}
              >
                5-Star Detractor Coach
              </button>

            </div>
            
            <button className="btn btn-accent" onClick={handleEndShift} style={{ padding: '0.5rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--error)', height: '36px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Power size={14} /> End Shift
            </button>
          </div>

                    {leaderTab === 'tracker' && (
            <ShiftTrackerTab 
              activeShift={activeShift}
              setActiveShift={setActiveShift}
              roster={roster}
              handleAddHour={handleAddHour}
              handleUpdateMetric={handleUpdateMetric}
              handleUpdateStartRevenue={handleUpdateStartRevenue}
              handleUpdateEndRevenue={handleUpdateEndRevenue}
              handleRemoveHour={handleRemoveHour}
              handleLogFloorWin={handleLogFloorWin}
              selectedEmpId={selectedEmpId}
              setSelectedEmpId={setSelectedEmpId}
              winType={winType}
              setWinType={setWinType}
              ocvEmpId={ocvEmpId}
              setOcvEmpId={setOcvEmpId}
              ocvConnect={ocvConnect}
              setOcvConnect={setOcvConnect}
              ocvRecommend={ocvRecommend}
              setOcvRecommend={setOcvRecommend}
              ocvProtect={ocvProtect}
              setOcvProtect={setOcvProtect}
              ocvClose={ocvClose}
              setOcvClose={setOcvClose}
              ocvNotes={ocvNotes}
              setOcvNotes={setOcvNotes}
              handleLogOcvObservation={handleLogOcvObservation}
              ocvSuccessMsg={ocvSuccessMsg}
              handleUndoWin={handleUndoWin}
            />
          )}



          {leaderTab === 'scheduler' && (
            /* Interactive Floor Zone & Break Scheduler Tab content */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
                <button 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.2rem', fontSize: '0.825rem' }}
                  onClick={() => setIsImportModalOpen(true)}
                >
                  <Upload size={15} /> Import Floor Schedule
                </button>
              </div>
              <ZoneScheduler 
                zoneAssignments={activeShift.zoneAssignments || {}}
                roster={roster}
                onAssignZone={handleAssignZone}
                onUnassignZone={handleUnassignZone}
                activeBreaks={activeShift.activeBreaks || {}}
                onToggleBreakState={handleToggleBreakState}
              />
              <BreakRunSheet 
                breakSchedule={activeShift.breakSchedule || []}
                roster={roster}
                onAddBreak={handleAddBreak}
                onToggleBreak={handleToggleBreak}
                onDeleteBreak={handleDeleteBreak}
              />
            </div>
          )}

          {leaderTab === 'audit' && (
            <FloorAudit />
          )}

          {leaderTab === 'sim' && (
            <ShiftSimulator roster={roster} />
          )}

          {leaderTab === 'survey' && (
            <FiveStarAuditor roster={roster} />
          )}


        </div>
      )}

      {/* HISTORICAL SHIFTS LIST */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--info)" /> Past Floor Leading Shifts Archive
        </h3>
        
        {shifts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1.5px dashed var(--border-glass)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No archived floor-leading shifts logged yet. Complete your first shift above.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                  <th style={{ padding: '0.75rem 1rem' }}>FLOOR LEADER</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TYPE</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>HOURS</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TOTAL REVENUE</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TOTAL PMs</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TOTAL APPs</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ON-TRACK RATE</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>{shift.date}</td>
                    <td style={{ padding: '1rem', color: '#fff' }}>{shift.leaderName}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {shift.isWeekend ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--bby-yellow)', background: 'rgba(253, 216, 53, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(253, 216, 53, 0.15)' }}>Weekend</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--bby-blue)', background: 'rgba(0, 70, 190, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(0, 70, 190, 0.15)' }}>Weekday</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#fff' }}>{shift.totalHours} hrs</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--info)', fontWeight: 700 }}>
                      ${shift.totalRevenue ? shift.totalRevenue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$0.00'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#fff', fontWeight: 700 }}>{shift.totalPms}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#fff', fontWeight: 700 }}>{shift.totalApps}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        fontWeight: 700,
                        color: shift.onTrackRatio >= 70 ? 'var(--success)' : shift.onTrackRatio >= 40 ? 'var(--bby-yellow)' : 'var(--error)' 
                      }}>
                        {shift.onTrackRatio}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this archived shift?')) {
                            onDeleteShift(shift.id);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
                        title="Delete Shift History"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Schedule Modal */}
      <ImportScheduleModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        roster={roster}
        onImportConfirm={handleImportSchedule}
        apiKey={apiKey}
        onAddEmployee={onAddEmployee}
      />

    </div>
  );
}
