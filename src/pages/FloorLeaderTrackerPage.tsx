import React from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo } from 'lucide-react';
import { useFloorLeaderTracker } from '../hooks/useFloorLeaderTracker';
import FloorLeaderHeader from '../components/FloorLeaderTracker/FloorLeaderHeader';
import FloorLeaderTabs from '../components/FloorLeaderTracker/FloorLeaderTabs';
import HistoricalShiftsArchive from '../components/FloorLeaderTracker/HistoricalShiftsArchive';
import { useStore } from '../store/useStore';
import ZoneScheduler from '../components/ZoneScheduler';
import BreakRunSheet from '../components/BreakRunSheet';
import ImportScheduleModal from '../components/ImportScheduleModal';
import FloorAudit from '../components/FloorAudit';
import ShiftSimulator from '../components/ShiftSimulator';
import FiveStarAuditor from '../components/FiveStarAuditor';
import ShiftSetupForm from '../components/FloorLeader/ShiftSetupForm';
import ShiftTrackerTab from '../components/FloorLeader/ShiftTrackerTab';
import HandoffReportModal from '../components/FloorLeaderTracker/HandoffReportModal';


const EMPTY_OBJ = {};
const EMPTY_ARR: any[] = [];

export default function FloorLeaderTracker() {
  const activeManager = useStore((state) => state.activeManager);
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);
  const shifts = useStore((state) => state.floorLeaderShifts) || EMPTY_ARR;
  const onSaveShift = useStore((state) => state.saveFloorLeaderShift);
  const onDeleteShift = useStore((state) => state.deleteFloorLeaderShift);
  const onAddEmployee = useStore((state) => state.addEmployee);
  const apiKey = useStore((state) => state.apiKey);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  
  const {
    activeShift, setActiveShift,
    activeSummary,
    leaderMetrics,
    leaderTab, setLeaderTab,
    isImportModalOpen, setIsImportModalOpen,
    ocvSuccessMsg, setOcvSuccessMsg,
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
    getEmployeesOnShift,
    selectedEmpId, setSelectedEmpId,
    winType, setWinType,
    ocvEmpId, setOcvEmpId,
    ocvConnect, setOcvConnect,
    ocvRecommend, setOcvRecommend,
    ocvProtect, setOcvProtect,
    ocvClose, setOcvClose,
    ocvNotes, setOcvNotes
  } = useFloorLeaderTracker(activeManager, roster, onSaveShift);

  return (
    <div className="flex-column gap-xl">
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
        <div className="flex-column gap-xl">
          
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
            handleGenerateHandoff={() => setIsHandoffModalOpen(true)}
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
              handleLogOcvObservation={handleLogOcvObservation}
              ocvSuccessMsg={ocvSuccessMsg}
              handleUndoWin={handleUndoWin}
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
            />
          )}

          {leaderTab === 'scheduler' && (
            /* Interactive Floor Zone & Break Scheduler Tab content */
            <div className="flex-column gap-xl">
              <div className="flex-end" style={{ marginBottom: '-1rem' }}>
                <button 
                  className="btn btn-primary flex-center gap-sm"
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

      {/* Handoff Modal */}
      {isHandoffModalOpen && (
        <HandoffReportModal
          activeShift={activeShift}
          activeSummary={activeSummary}
          apiKey={apiKey}
          onClose={() => setIsHandoffModalOpen(false)}
        />
      )}

      {/* HISTORICAL SHIFTS LIST */}
      <HistoricalShiftsArchive shifts={shifts} onDeleteShift={onDeleteShift} />

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
