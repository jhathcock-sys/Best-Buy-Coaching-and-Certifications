const fs = require('fs');

const code = fs.readFileSync('src/components/FloorLeaderTracker.tsx', 'utf8');
const lines = code.split('\n');

// Find the start and end of the custom hook logic
const startLogic = lines.findIndex(l => l.includes('const [leaderName, setLeaderName]'));
const endLogic = lines.findIndex(l => l.includes('const getEmployeesOnShift = () => {'));
const returnJSX = lines.findIndex(l => l.includes('return ('));

// The hook logic goes from startLogic to returnJSX
const hookLogic = lines.slice(startLogic, returnJSX).join('\n');

// Create the useFloorLeader.ts file
const hookFile = \import { useState } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

export function useFloorLeaderTracker(activeManager, roster) {
  const activeShift = useStore((state) => state.activeShift);
  const setActiveShift = useStore((state) => state.setActiveShift);

  const isTodayWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

\ + hookLogic + \
  return {
    leaderName, setLeaderName,
    dailyRevenueGoal, setDailyRevenueGoal,
    dailyAppsGoal, setDailyAppsGoal,
    dailyPmsGoal, setDailyPmsGoal,
    preExistingRevenue, setPreExistingRevenue,
    preExistingApps, setPreExistingApps,
    preExistingPms, setPreExistingPms,
    isWeekend, setIsWeekend,
    leaderTab, setLeaderTab,
    isImportModalOpen, setIsImportModalOpen,
    selectedEmpId, setSelectedEmpId,
    winType, setWinType,
    ocvEmpId, setOcvEmpId,
    ocvConnect, setOcvConnect,
    ocvRecommend, setOcvRecommend,
    ocvProtect, setOcvProtect,
    ocvClose, setOcvClose,
    ocvNotes, setOcvNotes,
    ocvSuccessMsg, setOcvSuccessMsg,
    handleStartShift,
    handleAddHour,
    handleRemoveHour,
    handleUpdateMetric,
    handleUpdateStartRevenue,
    handleUpdateEndRevenue,
    handleEndShift,
    handleAssignZone,
    handleUnassignZone,
    handleAddBreak,
    handleToggleBreak,
    handleDeleteBreak,
    handleToggleBreakState,
    handleImportSchedule,
    handleLogFloorWin,
    handleUndoWin,
    handleLogOcvObservation,
    getEmployeesOnShift
  };
}
\;

fs.writeFileSync('src/hooks/useFloorLeaderTracker.ts', hookFile);

// Create HistoricalShiftsArchive.tsx
const startArchive = lines.findIndex(l => l.includes('{/* HISTORICAL SHIFTS LIST */}'));
const endArchive = lines.findIndex(l => l.includes('{/* Import Schedule Modal */}'));

const archiveCode = lines.slice(startArchive, endArchive).join('\n');

const archiveFile = \import React from 'react';
import { Clock, Trash2 } from 'lucide-react';

export default function HistoricalShiftsArchive({ shifts, onDeleteShift }) {
  return (
    <>
\ + archiveCode + \
    </>
  );
}
\;

fs.writeFileSync('src/components/FloorLeaderTracker/HistoricalShiftsArchive.tsx', archiveFile);

console.log('Extraction of hook and archive completed!');
