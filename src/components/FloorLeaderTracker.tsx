// @ts-nocheck
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo } from 'lucide-react';
import { useFloorLeaderTracker } from '../hooks/useFloorLeaderTracker';
import FloorLeaderHeader from './FloorLeaderTracker/FloorLeaderHeader';
import FloorLeaderTabs from './FloorLeaderTracker/FloorLeaderTabs';
// HistoricalShiftsArchive is already imported below
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
  
  const {
    activeShift, setActiveShift,
    activeSummary,
    leaderMetrics,
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
  } = useFloorLeaderTracker(activeManager, roster, onSaveShift);

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
          <FloorLeaderHeader 
            activeShift={activeShift} 
            activeSummary={activeSummary} 
          />

          {/* Tab Selection Header bar with End Shift */}
          <FloorLeaderTabs 
            leaderTab={leaderTab} 
            setLeaderTab={setLeaderTab} 
            handleEndShift={handleEndShift} 
          />

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
      <HistoricalShiftsArchive shifts={shifts} />

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
