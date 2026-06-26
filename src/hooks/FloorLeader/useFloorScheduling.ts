import { useStore } from '../../store/useStore';
import { Employee, BreakEntry } from '../../types';

export function useFloorScheduling() {
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || {};
  const _rawRoster = rosterHistory[activePeriod] || {};
  const roster = Object.values(_rawRoster) as Employee[];

  const handleAssignZone = (zone: string, empId: string) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    const emp = roster.find((e: Employee) => e.id === empId);
    if (!emp) return;

    const currentAssignments = activeShift.zoneAssignments || {
      'Computing': [], 'Mobile': [], 'Home Theatre': [], 'Front End': [], 'Geek Squad': [], 'Appliances': []
    };

    const cleanedAssignments: Record<string, string[]> = {};
    Object.keys(currentAssignments).forEach(z => {
      cleanedAssignments[z] = (currentAssignments[z] || []).filter((id: string) => id !== empId);
    });

    cleanedAssignments[zone] = [...(cleanedAssignments[zone] || []), empId];

    setActiveShift({
      ...activeShift,
      zoneAssignments: cleanedAssignments
    });
  };

  const handleUnassignZone = (zone: string, empId: string) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    const currentAssignments = activeShift.zoneAssignments || {
      'Computing': [], 'Mobile': [], 'Home Theatre': [], 'Front End': [], 'Geek Squad': [], 'Appliances': []
    };
    const updated = {
      ...currentAssignments,
      [zone]: (currentAssignments[zone] || []).filter((id: string) => id !== empId)
    };
    setActiveShift({
      ...activeShift,
      zoneAssignments: updated
    });
  };

  const handleAddBreak = (newBreak: BreakEntry) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    const currentBreaks = activeShift.breakSchedule || [];
    setActiveShift({
      ...activeShift,
      breakSchedule: [...currentBreaks, newBreak]
    });
  };

  const handleToggleBreak = (breakId: string) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    const currentBreaks = activeShift.breakSchedule || [];
    const updated = currentBreaks.map((b: BreakEntry) => {
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

  const handleDeleteBreak = (breakId: string) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    const currentBreaks = activeShift.breakSchedule || [];
    const updated = currentBreaks.filter((b: BreakEntry) => b.id !== breakId);
    setActiveShift({
      ...activeShift,
      breakSchedule: updated
    });
  };

  const handleToggleBreakState = (empId: string, breakType: string | null) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    const currentActiveBreaks = activeShift.activeBreaks || {};
    const updatedActiveBreaks = { ...currentActiveBreaks };

    if (breakType) {
      // Start a break
      updatedActiveBreaks[empId] = breakType;
      
      // Auto-log break as completed in the Run Sheet
      const emp = roster.find((e: Employee) => e.id === empId);
      const empName = emp ? emp.name : 'Associate';
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newBreak: BreakEntry = {
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

  const handleImportSchedule = ({ zoneAssignments = {}, breakSchedule = [] }: { zoneAssignments?: Record<string, string[]>, breakSchedule?: BreakEntry[] } = {}) => {
    const { activeShift, setActiveShift } = useStore.getState();
    if (!activeShift) return;
    
    // Merge zones: for each zone, merge new assignments with existing ones, avoiding duplicates
    const currentZones = activeShift.zoneAssignments || {
      'Computing': [], 'Mobile': [], 'Home Theatre': [], 'Front End': [], 'Geek Squad': [], 'Appliances': []
    };
    
    const mergedZones: Record<string, string[]> = {};
    Object.keys(currentZones).forEach(z => {
      const existingIds = currentZones[z] || [];
      const newIds = zoneAssignments?.[z] || [];
      mergedZones[z] = Array.from(new Set([...existingIds, ...newIds]));
    });

    // Append breaks
    const currentBreaks = activeShift.breakSchedule || [];
    const mergedBreaks = [...currentBreaks, ...(breakSchedule || [])];

    setActiveShift({
      ...activeShift,
      zoneAssignments: mergedZones,
      breakSchedule: mergedBreaks
    });
  };

  return {
    handleAssignZone,
    handleUnassignZone,
    handleAddBreak,
    handleToggleBreak,
    handleDeleteBreak,
    handleToggleBreakState,
    handleImportSchedule
  };
}
