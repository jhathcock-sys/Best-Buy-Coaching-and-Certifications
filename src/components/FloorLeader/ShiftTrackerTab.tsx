import React, { useMemo, useCallback } from 'react';
import ShiftTrackerGoals from './ShiftTrackerGoals';
import ShiftTrackerHourlyLog from './ShiftTrackerHourlyLog';
import ShiftTrackerSidebar from './ShiftTrackerSidebar';
import { useStore } from '../../store/useStore';
import { useFloorLogging } from '../../hooks/FloorLeader/useFloorLogging';
import { Employee } from '../../types';

interface ShiftTrackerTabProps {
  roster: Employee[];
}

export default function ShiftTrackerTab({ roster = [] }: ShiftTrackerTabProps) {
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);

  const {
    selectedEmpId, setSelectedEmpId,
    winType, setWinType,
    handleLogOcvObservation,
    handleLogFloorWin,
    handleUndoWin
  } = useFloorLogging(roster);

  const handleAddHour = useCallback(() => {
    if (!activeShift) return;
    const nextHour = (activeShift.hours?.length || 0) + 1;
    const prevHour = activeShift.hours?.[activeShift.hours.length - 1];
    const initialStart = prevHour && prevHour.endRevenue !== undefined && prevHour.endRevenue !== '' ? prevHour.endRevenue : '';
    const updated = {
      ...activeShift,
      hours: [
        ...(activeShift.hours || []),
        { hourNumber: nextHour, pms: 0, apps: 0, revenue: 0, startRevenue: initialStart, endRevenue: '' }
      ]
    };
    setActiveShift(updated);
  }, [activeShift, setActiveShift]);

  const handleRemoveHour = useCallback((index: number) => {
    if (!activeShift || !activeShift.hours || activeShift.hours.length <= 1) return;
    const updatedHours = activeShift.hours.filter((_: any, i: number) => i !== index).map((h: any, idx: number) => ({
      ...h,
      hourNumber: idx + 1
    }));
    setActiveShift({
      ...activeShift,
      hours: updatedHours
    });
  }, [activeShift, setActiveShift]);

  const handleUpdateMetric = useCallback((hourIndex: number, field: string, delta: number) => {
    if (!activeShift || !activeShift.hours) return;
    const updatedHours = activeShift.hours.map((h: any, i: number) => {
      if (i === hourIndex) {
        const newVal = Math.max(0, (h[field] || 0) + delta);
        return { ...h, [field]: newVal };
      }
      return h;
    });
    setActiveShift({
      ...activeShift,
      hours: updatedHours
    });
  }, [activeShift, setActiveShift]);

  const handleUpdateStartRevenue = useCallback((hourIndex: number, value: string) => {
    if (!activeShift || !activeShift.hours) return;
    const updatedHours = activeShift.hours.map((h: any, idx: number) => {
      if (idx === hourIndex) {
        const startVal = value === '' ? '' : (parseFloat(value) || 0);
        const endVal = h.endRevenue !== undefined && h.endRevenue !== '' ? parseFloat(String(h.endRevenue)) : '';
        
        let netRevenue = h.revenue || 0;
        if (startVal !== '' && endVal !== '') {
          netRevenue = Math.max(0, (endVal as number) - (startVal as number));
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
  }, [activeShift, setActiveShift]);

  const handleUpdateEndRevenue = useCallback((hourIndex: number, value: string) => {
    if (!activeShift || !activeShift.hours) return;
    const updatedHours = activeShift.hours.map((h: any, idx: number) => {
      if (idx === hourIndex) {
        const endVal = value === '' ? '' : (parseFloat(value) || 0);
        const startVal = h.startRevenue !== undefined && h.startRevenue !== '' ? parseFloat(String(h.startRevenue)) : '';
        
        let netRevenue = h.revenue || 0;
        if (startVal !== '' && endVal !== '') {
          netRevenue = Math.max(0, (endVal as number) - (startVal as number));
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
  }, [activeShift, setActiveShift]);

  const checkHourStatus = useCallback((pms: number, apps: number, isWeekendShift: boolean) => {
    const pmGoal = isWeekendShift ? 3 : 2;
    const appGoal = isWeekendShift ? 3 : 2;
    return pms >= pmGoal && apps >= appGoal;
  }, []);

  const getEmployeesOnShift = useCallback(() => {
    if (!activeShift || !activeShift.hours || activeShift.hours.length === 0) return [];
    const assignedIds = new Set<string>();
    if (activeShift.zoneAssignments) {
      (Object.values(activeShift.zoneAssignments) as string[][]).forEach((arr: string[]) => {
        arr.forEach(id => assignedIds.add(id));
      });
    }
    return roster.filter(emp => assignedIds.has(emp.id));
  }, [activeShift, roster]);

  const getShiftLeaderboard = useCallback(() => {
    const targetList = roster || [];
    const wins = activeShift?.wins || [];

    const leaderboard = targetList.map(emp => {
      const empWins = wins.filter((w: any) => w.empId === emp.id);
      const apps = empWins.filter((w: any) => w.type === 'app').length;
      const pms = empWins.filter((w: any) => w.type === 'pm').length;
      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff`,
        role: emp.dept,
        apps,
        pms,
        total: apps + pms
      };
    });

    return leaderboard.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.pms !== a.pms) return b.pms - a.pms;
      return b.apps - a.apps;
    });
  }, [activeShift, roster]);

  const activeSummary = useMemo(() => {
    if (!activeShift) return null;
    const hoursArray = Array.isArray(activeShift.hours) ? activeShift.hours : [];
    return {
      totalPms: hoursArray.reduce((sum: number, h: any) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0),
      totalApps: hoursArray.reduce((sum: number, h: any) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0),
      totalRevenue: hoursArray.reduce((sum: number, h: any) => sum + (parseFloat(h.revenue) || 0), 0) + (activeShift.preExistingRevenue || 0),
      onTrackHours: hoursArray.filter((h: any) => 
        checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
      ).length,
      onTrackRatio: hoursArray.length > 0 ? Math.round((hoursArray.filter((h: any) => 
        checkHourStatus(h.pms || 0, h.apps || 0, activeShift.isWeekend)
      ).length / hoursArray.length) * 100) : 0
    };
  }, [activeShift, checkHourStatus]);

  if (!activeShift) return null;

  return (
    <div className="flex-column gap-xl">
      <ShiftTrackerGoals activeSummary={activeSummary} />
      <ShiftTrackerHourlyLog 
        checkHourStatus={checkHourStatus}
        handleAddHour={handleAddHour}
        handleUpdateMetric={handleUpdateMetric}
        handleUpdateStartRevenue={handleUpdateStartRevenue}
        handleUpdateEndRevenue={handleUpdateEndRevenue}
        handleRemoveHour={handleRemoveHour}
      />
      <ShiftTrackerSidebar 
        handleUndoWin={handleUndoWin}
        getShiftLeaderboard={getShiftLeaderboard}
        getEmployeesOnShift={getEmployeesOnShift}
        roster={roster}
        winConfig={{
          selectedEmpId, setSelectedEmpId,
          winType, setWinType,
          handleLogFloorWin
        }}
        ocvConfig={{
          handleLogOcvObservation
        }}
      />
    </div>
  );
}
