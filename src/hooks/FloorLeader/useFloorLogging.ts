import { useState } from 'react';
import { useStore } from '../../store/useStore';

export function useFloorLogging(roster, activeShift, setActiveShift, logCoachingSession, editEmployee) {
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

  return {
    selectedEmpId, setSelectedEmpId,
    winType, setWinType,
    ocvEmpId, setOcvEmpId,
    ocvConnect, setOcvConnect,
    ocvRecommend, setOcvRecommend,
    ocvProtect, setOcvProtect,
    ocvClose, setOcvClose,
    ocvNotes, setOcvNotes,
    ocvSuccessMsg, setOcvSuccessMsg,
    handleLogOcvObservation,
    handleLogFloorWin,
    handleUndoWin
  };
}
