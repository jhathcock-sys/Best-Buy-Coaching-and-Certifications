import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Employee, CoachingLog } from '../../types';

export function useFloorLogging(roster: Employee[]) {
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);
  const logCoachingSession = useStore((state) => state.logCoachingSession);
  const editEmployee = useStore((state) => state.editEmployee);

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [winType, setWinType] = useState<'pm' | 'app'>('pm');

  const handleLogOcvObservation = (data: { empId: string; connect: boolean; recommend: boolean; protect: boolean; close: boolean; notes: string }) => {
    const { empId, connect, recommend, protect, close, notes } = data;
    if (!empId) {
      alert("Please select an associate for the OCV Floor Observation!");
      return Promise.resolve();
    }

    const emp = roster.find(e => e.id === empId);
    if (!emp) return Promise.resolve();

    const checkedCount = (connect ? 1 : 0) + (recommend ? 1 : 0) + (protect ? 1 : 0) + (close ? 1 : 0);
    const score = Math.round((checkedCount / 4) * 100);

    const notesText = `### 30-Second OCV Floor Observation
**Benchmarks Met:** ${checkedCount}/4 (${score}%)
- **Connect:** ${connect ? '✅ Met' : '❌ Missed'} (warm greeting, intro, open discovery)
- **Recommend:** ${recommend ? '✅ Met' : '❌ Missed'} (solution match, Good/Better/Best demo)
- **Protect:** ${protect ? '✅ Met' : '❌ Missed'} (Plus/Total memberships & protection attach)
- **Close:** ${close ? '✅ Met' : '❌ Missed'} (Best Buy Card financing pitch & survey ask)

**Supervisor observations & feedback:**
${notes || 'No specific observation notes logged.'}`;

    logCoachingSession({
      customerName: emp.name,
      employeeId: emp.id,
      category: 'OCV Observation',
      score: score,
      avatar: emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      notes: notesText
    } as CoachingLog);

    return Promise.resolve();
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
        if (Array.isArray(ids) && ids.includes(emp.id)) {
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

    const updatedWins = [...(activeShift.wins || []), newWin];

    setActiveShift({
      ...activeShift,
      hours: updatedHours,
      wins: updatedWins
    });

    editEmployee(emp.id, {
      memberships: (emp.memberships || 0) + (winType === 'pm' ? 1 : 0),
      creditCards: (emp.creditCards || 0) + (winType === 'app' ? 1 : 0)
    });

    useStore.getState().addTrophy(emp.id, {
      id: `trophy-${Date.now()}`,
      type: winType === 'pm' ? 'Plus/Total Membership' : 'Best Buy Credit Card',
      category: 'Floor Win',
      date: new Date().toLocaleDateString(),
      icon: winType === 'pm' ? 'ShieldCheck' : 'CreditCard'
    });

    setSelectedEmpId('');
  };

  const handleUndoWin = (winId: string) => {
    if (!activeShift) return;
    const win = (activeShift.wins || []).find((w: any) => w.id === winId);
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

    const updatedWins = (activeShift.wins || []).filter((w: any) => w.id !== winId);

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

  return {
    selectedEmpId, setSelectedEmpId,
    winType, setWinType,
    handleLogOcvObservation,
    handleLogFloorWin,
    handleUndoWin
  };
}
