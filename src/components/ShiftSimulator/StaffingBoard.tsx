import React from 'react';
import { Users, Play, RefreshCw } from 'lucide-react';
import { Employee } from '../../types';

interface StaffingBoardProps {
  roster: Employee[];
  placements: Record<string, string>;
  handleSelectEmployee: (zone: string, id: string) => void;
  handleRunSimulation: () => void;
  isSimulating: boolean;
  isAnyAssigned: boolean;
}

const ZONES = ['Computing', 'Home Theatre', 'Mobile', 'Front End'];

export default function StaffingBoard({
  roster,
  placements,
  handleSelectEmployee,
  handleRunSimulation,
  isSimulating,
  isAnyAssigned
}: StaffingBoardProps) {
  return (
    <div className="glass-card flex flex-col gap-lg">
      <div>
        <h2 className="text-lg flex items-center gap-sm mb-sm">
          <Users color="var(--bby-blue)" size={22} /> Shift Staffing Board
        </h2>
        <p className="text-secondary text-sm">
          Assign your roster blue shirts to floor zones. Running the shift will simulate customer traffic and score your placement decisions.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        {ZONES.map(zone => {
          const assignedEmpId = placements[zone];
          const assignedEmp = roster.find(e => e.id === assignedEmpId);

          return (
            <div 
              key={zone} 
              className="p-md bg-white/5 border border-glass rounded-xl flex justify-between items-center flex-wrap gap-md"
            >
              <div>
                <span className="text-xs text-muted uppercase font-bold">{zone} Zone</span>
                <div className={`text-sm font-bold mt-xs ${assignedEmp ? 'text-white' : 'text-secondary'}`}>
                  {assignedEmp ? assignedEmp.name : 'Unassigned (General)'}
                </div>
                {assignedEmp && (
                  <span className="text-xs text-muted">
                    Focus Gap: {assignedEmp.gap || 'None'}
                  </span>
                )}
              </div>

              <select 
                className="form-control w-[150px] h-[34px] px-sm text-xs cursor-pointer"
                value={assignedEmpId || ''}
                onChange={(e) => handleSelectEmployee(zone, e.target.value)}
                data-testid={`staffing-select-${zone.replace(/\s+/g, '-')}`}
              >
                <option value="">Select Employee</option>
                {roster.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <button 
        className="btn btn-accent w-full text-black cursor-pointer" 
        onClick={handleRunSimulation} 
        disabled={isSimulating || !isAnyAssigned}
        data-testid="start-simulation-btn"
      >
        {isSimulating ? (
          <div className="flex items-center justify-center gap-sm">
            <RefreshCw size={14} className="typing-dots animate-spin" /> Simulating 8-Hour Shift...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-sm">
            <Play size={16} fill="#000" /> Start Shift Simulation
          </div>
        )}
      </button>
    </div>
  );
}
