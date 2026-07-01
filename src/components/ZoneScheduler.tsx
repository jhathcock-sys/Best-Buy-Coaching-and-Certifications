import React, { useState, useRef, useEffect } from 'react';
import { Users, Clock, LayoutGrid, Zap } from 'lucide-react';
import ZoneGrid from './ZoneScheduler/ZoneGrid';
import ZoneTimeline from './ZoneScheduler/ZoneTimeline';
import { useStore } from '../store/useStore';
import { generateSmartZoning } from '../services/ai/geminiSmartZoning';
import toast from 'react-hot-toast';
import { Employee, BreakEntry } from '../types';
import { Skeleton } from './ui/Skeleton';

const EMPTY_OBJ: any = {};
const EMPTY_ARR: any[] = [];
const ZONES = ['Computing', 'Mobile', 'Home Theatre', 'Front End', 'Geek Squad', 'Appliances'];
const TIME_SLOTS = ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];

interface ZoneSchedulerProps {
  zoneAssignments?: Record<string, string[]>;
  roster?: Employee[];
  onAssignZone: (zone: string, empId: string) => void;
  onUnassignZone: (zone: string, empId: string) => void;
  activeBreaks?: Record<string, string>;
  onToggleBreakState: (empId: string, state: string) => void;
  onImportSchedule: (schedule: { zoneAssignments: Record<string, string[]>, breakSchedule: BreakEntry[] }) => void;
}

export default function ZoneScheduler({ 
  zoneAssignments = EMPTY_OBJ, 
  onAssignZone, 
  onUnassignZone,
  activeBreaks = EMPTY_OBJ,
  onToggleBreakState,
  onImportSchedule
}: ZoneSchedulerProps) {
  // Use stable constants for fallbacks to prevent unnecessary re-renders
  const safeZoneAssignments = zoneAssignments || EMPTY_OBJ;
  
  // Pull roster globally instead of prop drilling
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => {
    const rawArr = Object.values(_rawroster) as Employee[];
    return rawArr.sort((a, b) => a.name.localeCompare(b.name));
  }, [_rawroster]);

  const assignedEmpIds = (Object.values(safeZoneAssignments) as string[][]).flat();
  const unassignedEmps = roster.filter(emp => !assignedEmpIds.includes(emp.id));
  const apiKey = useStore(state => state.apiKey);
  const playbookSettings = useStore(state => state.playbookSettings);

  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isDeploying, setIsDeploying] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAutoDeploy = async () => {
    if (!apiKey) {
      toast.error('API Key missing. Cannot Auto-Deploy.');
      return;
    }

    let toastId;
    try {
      setIsDeploying(true);
      toastId = toast.loading('Gemini is analyzing floor traffic and optimizing roster...');
      const assignments = await generateSmartZoning(roster, ZONES, apiKey, playbookSettings);
      
      if (!isMounted.current) return;

      if (onImportSchedule) {
        onImportSchedule({ zoneAssignments: assignments, breakSchedule: EMPTY_ARR });
      }
      toast.success('Roster optimized and Auto-Deployed!', { id: toastId });
    } catch (err) {
      if (!isMounted.current) return;
      toast.error('Auto-Deploy failed. Check API key and network.', { id: toastId });
      console.error(err);
    } finally {
      if (isMounted.current) {
        setIsDeploying(false);
      }
    }
  };

  if (!playbookSettings) {
    return (
      <div className="glass-card p-xl" data-testid="zone-scheduler-container">
        <Skeleton width="100%" height="256px" className="rounded-md" />
      </div>
    );
  }

  return (
    <div className="glass-card p-xl" data-testid="zone-scheduler-container">
      <div className="flex-between align-start mb-xl gap-lg">
        <div>
          <h3 className="text-xl mb-sm flex-row align-center gap-sm text-bby-yellow font-bold">
            <Users size={20} /> Sales Floor Zone Assignments
          </h3>
          <p className="text-secondary text-sm m-0">
            Zoning sheet scheduler: visually drag and drop associates or auto-deploy.
          </p>
        </div>
        
        <div className="flex-row align-center gap-sm flex-wrap">
          <button
            data-testid="auto-deploy-btn"
            onClick={handleAutoDeploy}
            disabled={isDeploying}
            className={`btn bg-bby-blue-alpha-20 text-bby-blue border-bby-blue py-sm px-md rounded-xl text-sm flex-row align-center gap-xs transition-normal shadow-bby-blue-glow mr-md ${isDeploying ? 'cursor-wait opacity-70' : 'cursor-pointer hover:bg-bby-blue hover:text-white'}`}
          >
            <Zap size={16} /> {isDeploying ? 'Optimizing...' : 'Auto-Deploy (AI)'}
          </button>

          <div className="flex-row gap-xs bg-black-alpha-20 p-xs rounded-xl border-glass">
            <button
              onClick={() => setViewMode('grid')}
              data-testid="view-mode-grid"
              className={`py-sm px-md rounded-xl text-sm flex-row align-center gap-xs transition-normal cursor-pointer border-none ${viewMode === 'grid' ? 'bg-bby-blue text-white shadow-none' : 'bg-transparent text-secondary hover:text-white'}`}
            >
              <LayoutGrid size={16} /> Zones
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              data-testid="view-mode-timeline"
              className={`py-sm px-md rounded-xl text-sm flex-row align-center gap-xs transition-normal cursor-pointer border-none ${viewMode === 'timeline' ? 'bg-bby-blue text-white shadow-none' : 'bg-transparent text-secondary hover:text-white'}`}
            >
              <Clock size={16} /> Timeline
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <ZoneGrid 
          zones={ZONES}
          unassignedEmps={unassignedEmps}
          roster={roster}
          onAssignZone={onAssignZone}
          onUnassignZone={onUnassignZone}
          onToggleBreakState={onToggleBreakState}
        />
      ) : (
        <ZoneTimeline 
          timeSlots={TIME_SLOTS}
        />
      )}
    </div>
  );
}
