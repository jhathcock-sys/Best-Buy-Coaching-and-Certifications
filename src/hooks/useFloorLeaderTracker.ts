import { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import { useFloorScheduling } from './FloorLeader/useFloorScheduling';
import { FloorLeaderTabType } from '../components/FloorLeaderTracker/FloorLeaderTabs';
import { Employee, Manager, ShiftEvent } from '../types';

export function useFloorLeaderTracker(
  activeManager: Manager | null,
  roster: Employee[],
  onSaveShift: (shift: ShiftEvent) => void | Promise<void>
) {
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);

  // --- UI State ---
  const [leaderTab, setLeaderTab] = useState<FloorLeaderTabType>('tracker');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- Domain Hooks ---
  const floorScheduling = useFloorScheduling();

  const checkHourStatus = useCallback((pms: number, apps: number, isWeekendShift?: boolean) => {
    const pmGoal = isWeekendShift ? 3 : 2;
    const appGoal = isWeekendShift ? 3 : 2;
    return pms >= pmGoal && apps >= appGoal;
  }, []);

  const handleEndShift = useCallback(async () => {
    if (!activeShift) return;
    if (window.confirm('Are you sure you want to end your shift? This will archive your floor leading logs.')) {
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
          await onSaveShift(archivedShift);
        }
        // Only clear the shift if the save was successful
        setActiveShift(null);
      } catch (e) {
        toast.error("Failed to archive floor leader shift.");
        console.error("Failed to archive floor leader shift:", e);
      }
    }
  }, [activeShift, onSaveShift, setActiveShift, checkHourStatus]);

  const getEmployeesOnShift = useCallback(() => {
    if (!activeShift || !activeShift.zoneAssignments) return [];
    const activeEmpIds = new Set<string>();
    Object.values(activeShift.zoneAssignments).forEach(ids => {
      if (Array.isArray(ids)) {
        ids.forEach(id => activeEmpIds.add(id));
      }
    });
    return roster.filter(emp => activeEmpIds.has(emp.id));
  }, [activeShift, roster]);

  const activeSummary = useMemo(() => {
    if (!activeShift) return null;
    const hoursArray = Array.isArray(activeShift.hours) ? activeShift.hours : [];
    
    return {
      totalPms: hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0),
      totalApps: hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0),
      totalRevenue: hoursArray.reduce((sum, h) => sum + (parseFloat(String(h.revenue)) || 0), 0) + (activeShift.preExistingRevenue || 0),
      onTrackHours: hoursArray.filter(h => 
        checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
      ).length,
      onTrackRatio: hoursArray.length > 0 ? Math.round((hoursArray.filter(h => 
        checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
      ).length / hoursArray.length) * 100) : 0
    };
  }, [activeShift, checkHourStatus]);

  const leaderMetrics = useMemo(() => {
    if (!activeSummary || !activeShift) return { revenuePace: 0, appsPace: 0, pmsPace: 0 };
    
    const hoursArray = Array.isArray(activeShift.hours) ? activeShift.hours : [];
    const totalHours = Math.max(1, hoursArray.length); // Use total elapsed hours instead of onTrackHours
    
    return {
      revenuePace: Math.round((activeSummary.totalRevenue / totalHours) * 100) / 100,
      appsPace: Math.round((activeSummary.totalApps / totalHours) * 10) / 10,
      pmsPace: Math.round((activeSummary.totalPms / totalHours) * 10) / 10
    };
  }, [activeSummary, activeShift]);

  // Compose all hooks and return the unified object
  return {
    leaderTab, setLeaderTab,
    isImportModalOpen, setIsImportModalOpen,
    ...floorScheduling,
    
    // Core tracking state & actions
    activeShift,
    setActiveShift,
    handleEndShift,
    getEmployeesOnShift,
    activeSummary,
    leaderMetrics
  };
}
