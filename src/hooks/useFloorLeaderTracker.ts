import { useState } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import { useFloorLogging } from './FloorLeader/useFloorLogging';
import { useFloorScheduling } from './FloorLeader/useFloorScheduling';

export function useFloorLeaderTracker(activeManager, roster, onSaveShift) {
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);
  
  // Zustand store actions
  const editEmployee = useStore((state) => state.editEmployee);
  const logCoachingSession = useStore((state) => state.logCoachingSession);

  // --- UI State ---
  const [leaderTab, setLeaderTab] = useState('tracker');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- Domain Hooks ---
  const floorLogging = useFloorLogging(roster, activeShift, setActiveShift, logCoachingSession, editEmployee);
  const floorScheduling = useFloorScheduling(roster, activeShift, setActiveShift);

  // --- Core Shift Tracking Logic ---
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
        const endVal = h.endRevenue !== undefined && h.endRevenue !== '' ? parseFloat(String(h.endRevenue)) : '';
        
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
        const startVal = h.startRevenue !== undefined && h.startRevenue !== '' ? parseFloat(String(h.startRevenue)) : '';
        
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

  const checkHourStatus = (pms, apps, isWeekendShift) => {
    const pmGoal = isWeekendShift ? 3 : 2;
    const appGoal = isWeekendShift ? 3 : 2;
    return pms >= pmGoal && apps >= appGoal;
  };

  const handleEndShift = () => {
    if (!activeShift) return;
    if (confirm('Are you sure you want to end your shift? This will archive your floor leading logs.')) {
      const hoursArray = Array.isArray(activeShift.hours) ? activeShift.hours : [];
      const totalPms = hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0);
      const totalApps = hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0);
      const totalRevenue = hoursArray.reduce((sum, h) => sum + (parseFloat(String(h.revenue)) || 0), 0) + (activeShift.preExistingRevenue || 0);
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
      }
    }
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

  const hoursArray = activeShift && Array.isArray(activeShift.hours) ? activeShift.hours : [];
  const activeSummary = activeShift ? {
    totalPms: hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0),
    totalApps: hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0),
    totalRevenue: hoursArray.reduce((sum, h) => sum + (parseFloat(String(h.revenue)) || 0), 0) + (activeShift.preExistingRevenue || 0),
    onTrackHours: hoursArray.filter(h => 
      checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
    ).length,
    onTrackRatio: hoursArray.length > 0 ? Math.round((hoursArray.filter(h => 
      checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
    ).length / hoursArray.length) * 100) : 0
  } : null;

  const leaderMetrics = {
    revenuePace: activeSummary ? Math.round((activeSummary.totalRevenue / Math.max(1, activeSummary.onTrackHours)) * 100) / 100 : 0,
    appsPace: activeSummary ? Math.round((activeSummary.totalApps / Math.max(1, activeSummary.onTrackHours)) * 10) / 10 : 0,
    pmsPace: activeSummary ? Math.round((activeSummary.totalPms / Math.max(1, activeSummary.onTrackHours)) * 10) / 10 : 0
  };

  // Compose all hooks and return the unified object
  return {
    leaderTab, setLeaderTab,
    isImportModalOpen, setIsImportModalOpen,
    ...floorLogging,
    ...floorScheduling,
    
    // Core tracking state & actions
    activeShift,
    setActiveShift,
    handleAddHour,
    handleRemoveHour,
    handleUpdateMetric,
    handleUpdateStartRevenue,
    handleUpdateEndRevenue,
    handleEndShift,
    getEmployeesOnShift,
    activeSummary,
    leaderMetrics
  };
}
