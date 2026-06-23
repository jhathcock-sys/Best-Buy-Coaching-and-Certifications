import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Plus, Minus, Power, Trash2, Calendar, User, CheckCircle2, XCircle, Upload, Flame, Trophy, Undo } from 'lucide-react';
import { useFloorLeaderTracker } from '../hooks/useFloorLeaderTracker';
import FloorLeaderHeader from './FloorLeaderTracker/FloorLeaderHeader';
import FloorLeaderTabs from './FloorLeaderTracker/FloorLeaderTabs';
import HistoricalShiftsArchive from './FloorLeaderTracker/HistoricalShiftsArchive';
import { useStore } from '../store/useStore';
import ZoneScheduler from './ZoneScheduler';
import BreakRunSheet from './BreakRunSheet';
import ImportScheduleModal from './ImportScheduleModal';
import FloorAudit from './FloorAudit';
import ShiftSimulator from './ShiftSimulator';
import FiveStarAuditor from './FiveStarAuditor';
import ShiftSetupForm from './FloorLeader/ShiftSetupForm';
import ShiftTrackerTab from './FloorLeader/ShiftTrackerTab';
import HandoffReportModal from './FloorLeaderTracker/HandoffReportModal';


export default function FloorLeaderTracker() {
  const activeManager = useStore((state) => state.activeManager);
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || {};
  const roster = rosterHistory[activePeriod] || [];
  const shifts = useStore((state) => state.floorLeaderShifts) || [];
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
