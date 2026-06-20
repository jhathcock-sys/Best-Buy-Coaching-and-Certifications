import React, { useState } from 'react';
import { Trophy, CheckCircle2, XCircle, Plus, Minus, Trash2, Flame, Undo, TrendingUp, AlertCircle } from 'lucide-react';
import ShiftTrackerGoals from './ShiftTrackerGoals';
import ShiftTrackerHourlyLog from './ShiftTrackerHourlyLog';
import ShiftTrackerSidebar from './ShiftTrackerSidebar';

export default function ShiftTrackerTab({ activeShift, setActiveShift, roster = [], handleAddHour, handleUpdateMetric, handleUpdateStartRevenue, handleUpdateEndRevenue, handleRemoveHour, handleLogFloorWin, handleLogOcvObservation, ocvSuccessMsg, handleUndoWin }) {
  const [currentHourKey, setCurrentHourKey] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [newObservation, setNewObservation] = useState('');
  const [newWinMsg, setNewWinMsg] = useState('');
  const [winFeed, setWinFeed] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [winType, setWinType] = useState('App');
  const [ocvEmpId, setOcvEmpId] = useState('');
  const [ocvConnect, setOcvConnect] = useState(false);
  const [ocvRecommend, setOcvRecommend] = useState(false);
  const [ocvProtect, setOcvProtect] = useState(false);
  const [ocvClose, setOcvClose] = useState(false);
  const [ocvNotes, setOcvNotes] = useState('');

  const handleSaveHourlyLog = () => {};
  const handleSaveObservation = () => {};
  const handleLogWin = () => {};
  const renderPaceIndicator = (current, target) => {
    if (current >= target) return <Flame size={14} color="var(--success)" />;
    if (current >= target * 0.8) return <TrendingUp size={14} color="var(--bby-yellow)" />;
    return <AlertCircle size={14} color="var(--danger)" />;
  };

  const getEmployeesOnShift = () => {
    if (!activeShift || !activeShift.hours || activeShift.hours.length === 0) return [];
    const assignedIds = new Set();
    if (activeShift.zoneAssignments) {
      Object.values(activeShift.zoneAssignments).forEach(arr => {
        arr.forEach(id => assignedIds.add(id));
      });
    }
    return roster.filter(emp => assignedIds.has(emp.id));
  };

  const checkHourStatus = (pms, apps, isWeekendShift) => {
    const pmGoal = isWeekendShift ? 3 : 2;
    const appGoal = isWeekendShift ? 3 : 2;
    return pms >= pmGoal && apps >= appGoal;
  };

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

  // Helper for generating the leaderboard logic inside the UI
  const getShiftLeaderboard = () => {
    const targetList = roster || [];
    const wins = activeShift?.wins || [];

    const leaderboard = targetList.map(emp => {
      const empWins = wins.filter(w => w.empId === emp.id);
      const apps = empWins.filter(w => w.type === 'app').length;
      const pms = empWins.filter(w => w.type === 'pm').length;
      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff`,
        role: emp.role,
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
  };

  if (!activeShift) return null;

  return (
            /* Hourly Tracker Log Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
          <ShiftTrackerGoals 
  activeSummary={activeSummary}
  activeShift={activeShift}
  setActiveShift={setActiveShift}
  currentHourKey={currentHourKey}
  selectedLog={selectedLog}
  setSelectedLog={setSelectedLog}
  newObservation={newObservation}
  setNewObservation={setNewObservation}
  newWinMsg={newWinMsg}
  setNewWinMsg={setNewWinMsg}
  winFeed={winFeed}
  setWinFeed={setWinFeed}
  handleSaveHourlyLog={handleSaveHourlyLog}
  handleSaveObservation={handleSaveObservation}
  handleLogWin={handleLogWin}
  renderPaceIndicator={renderPaceIndicator}
  handleUndoWin={handleUndoWin}
 />
          <ShiftTrackerHourlyLog 
  activeSummary={activeSummary}
  activeShift={activeShift}
  setActiveShift={setActiveShift}
  checkHourStatus={checkHourStatus}
  handleAddHour={handleAddHour}
  handleUpdateMetric={handleUpdateMetric}
  handleUpdateStartRevenue={handleUpdateStartRevenue}
  handleUpdateEndRevenue={handleUpdateEndRevenue}
  handleRemoveHour={handleRemoveHour}
  currentHourKey={currentHourKey}
  selectedLog={selectedLog}
  setSelectedLog={setSelectedLog}
  newObservation={newObservation}
  setNewObservation={setNewObservation}
  newWinMsg={newWinMsg}
  setNewWinMsg={setNewWinMsg}
  winFeed={winFeed}
  setWinFeed={setWinFeed}
  handleSaveHourlyLog={handleSaveHourlyLog}
  handleSaveObservation={handleSaveObservation}
  handleLogWin={handleLogWin}
  renderPaceIndicator={renderPaceIndicator}
  handleUndoWin={handleUndoWin}
 />
          <ShiftTrackerSidebar 
  activeSummary={activeSummary}
  activeShift={activeShift}
  setActiveShift={setActiveShift}
  currentHourKey={currentHourKey}
  selectedLog={selectedLog}
  setSelectedLog={setSelectedLog}
  newObservation={newObservation}
  setNewObservation={setNewObservation}
  newWinMsg={newWinMsg}
  setNewWinMsg={setNewWinMsg}
  winFeed={winFeed}
  setWinFeed={setWinFeed}
  handleSaveHourlyLog={handleSaveHourlyLog}
  handleSaveObservation={handleSaveObservation}
  handleLogWin={handleLogWin}
  renderPaceIndicator={renderPaceIndicator}
  handleUndoWin={handleUndoWin}
 />
          </div>
          
  );
}
