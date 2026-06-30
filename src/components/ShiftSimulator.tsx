import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { runStoreShiftSimulationGemini } from '../services/ai';
import { Employee } from '../types';
import { SimulationResult } from './ShiftSimulator/types';
import StaffingBoard from './ShiftSimulator/StaffingBoard';
import ShiftScorecard from './ShiftSimulator/ShiftScorecard';
import ShiftTimeline from './ShiftSimulator/ShiftTimeline';

const EMPTY_ARR: any[] = [];
const EMPTY_OBJ: any = {};

export default function ShiftSimulator() {
  const apiKey = useStore((state) => state.apiKey);
  const playbookSettings = useStore((state) => state.playbookSettings);
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  
  // Roster logic matches FloorLeaderTrackerPage / StoreRosterPage
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => {
    const rawArr = Object.values(_rawroster) as Employee[];
    return rawArr.sort((a, b) => a.name.localeCompare(b.name));
  }, [_rawroster]);
  
  // Placement State
  const [placements, setPlacements] = useState<Record<string, string>>({
    'Computing': '',
    'Mobile': '',
    'Home Theatre': '',
    'Front End': ''
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSelectEmployee = (zone: string, id: string) => {
    setPlacements(prev => ({
      ...prev,
      [zone]: id
    }));
  };

  const handleRunSimulation = async () => {
    if (!playbookSettings) {
      alert("Please configure playbook settings first.");
      return;
    }
    
    // Collect roster profiles that are selected
    const selectedRosterData = roster.map((emp: any) => ({
      name: emp.name,
      rph: emp.rph,
      memberships: emp.memberships,
      creditCards: emp.creditCards,
      warranty: emp.warranty,
      surveys: emp.surveys,
      dept: emp.dept
    }));

    // Construct placement name mappings
    const placementMappings: Record<string, string> = {};
    Object.keys(placements).forEach(zone => {
      const emp: any = roster.find((e: any) => e.id === placements[zone]);
      placementMappings[zone] = emp ? emp.name : 'Unassigned (General Staff)';
    });

    setIsSimulating(true);

    try {
      const result = await runStoreShiftSimulationGemini(apiKey, selectedRosterData, placementMappings, playbookSettings);
      if (!isMounted.current) return;
      setSimulationResult(result as SimulationResult);
    } catch (e) {
      if (!isMounted.current) return;
      console.error(e);
      alert('An error occurred during shift simulation. Check console logs.');
    } finally {
      if (isMounted.current) setIsSimulating(false);
    }
  };

  const isAnyAssigned = Object.values(placements).some(v => !!v);

  return (
    <div className="grid mt-lg gap-2xl grid-cols-[repeat(auto-fit,minmax(400px,1fr))]" data-testid="shift-simulator">
      
      {/* Left Column: Staff Assignments Board */}
      <StaffingBoard 
        roster={roster}
        placements={placements}
        handleSelectEmployee={handleSelectEmployee}
        handleRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
        isAnyAssigned={isAnyAssigned}
      />

      {/* Right Column: Timeline Events & Scorecard */}
      <div className="flex flex-col gap-lg">
        
        {isSimulating && (
          <div className="glass-card flex-1 flex flex-col gap-xl p-2xl justify-center">
            <div className="skeleton-pulse rounded-md h-[24px] w-2/5 bg-white-alpha-10"></div>
            <div className="skeleton-pulse rounded-sm h-[14px] w-[90%] bg-white-alpha-05"></div>
            <div className="skeleton-pulse rounded-sm h-[14px] w-[85%] bg-white-alpha-05"></div>
            <div className="flex flex-col items-center gap-sm mt-xl text-secondary">
              <Sparkles size={24} className="typing-dots text-bby-yellow" />
              <span className="text-xs font-semibold">Simulating employee selling interactions hour-by-hour...</span>
            </div>
          </div>
        )}

        {!isSimulating && !simulationResult && (
          <div className="glass-card flex-1 flex flex-col items-center justify-center p-3xl text-center text-muted">
            <AlertCircle size={36} className="mb-md" />
            <p className="text-sm leading-relaxed max-w-[80%]">Position your team members on the Staffing Board and launch the simulation to generate shift results.</p>
          </div>
        )}

        {!isSimulating && simulationResult && (
          <div className="flex flex-col gap-lg">
            <ShiftScorecard scorecard={simulationResult.scorecard} />
            <ShiftTimeline logs={simulationResult.shiftLogs} />
          </div>
        )}
      </div>

    </div>
  );
}
