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
import { Employee } from '../types';


const EMPTY_OBJ = {};
const EMPTY_ARR: any[] = [];

export default function FloorLeaderTracker() {
  const activeManager = useStore((state) => state.activeManager);
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => (Object.values(_rawroster) as Employee[]).sort((a: Employee, b: Employee) => a.name.localeCompare(b.name)), [_rawroster]);

  const onSaveShift = useStore((state) => state.saveFloorLeaderShift);

  const onAddEmployee = useStore((state) => state.addEmployee);
  const apiKey = useStore((state) => state.apiKey);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  
  const {
    activeShift, setActiveShift,
    activeSummary,
    leaderMetrics,
    leaderTab, setLeaderTab,
    isImportModalOpen, setIsImportModalOpen,
    handleEndShift,
    handleAssignZone,
    handleUnassignZone,
    handleAddBreak,
    handleToggleBreak,
    handleDeleteBreak,
    handleToggleBreakState,
    handleImportSchedule,
    getEmployeesOnShift
  } = useFloorLeaderTracker(activeManager, roster, onSaveShift);

  return (
    <div className="flex-column gap-xl">
      {/* Header Panel */}
      <div>
        <h1 className="text-3xl mb-sm">Floor Leader Tracker</h1>
        <p className="text-secondary">
          Track hourly credit cards (Apps) and memberships (PMs) targets in real-time during your floor-leading shift.
        </p>
      </div>

      {!activeShift ? (
        <ShiftSetupForm />
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
            <ShiftTrackerTab roster={roster} />
          )}

          {leaderTab === 'scheduler' && (
            /* Interactive Floor Zone & Break Scheduler Tab content */
            <div className="flex-column gap-xl">
              <div className="flex-end mb-neg-md">
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
                onImportSchedule={handleImportSchedule}
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
            <ShiftSimulator />
          )}

          {leaderTab === 'survey' && (
            <FiveStarAuditor />
          )}


        </div>
      )}

      {/* Handoff Modal */}
      {isHandoffModalOpen && (
        <HandoffReportModal
          onClose={() => setIsHandoffModalOpen(false)}
        />
      )}

      {/* HISTORICAL SHIFTS LIST */}
      <HistoricalShiftsArchive />

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
