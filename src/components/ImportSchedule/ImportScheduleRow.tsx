import React from 'react';
import { Employee } from '../../types';

export interface ParsedShiftRowData {
  id: string;
  matchedEmpId: string;
  originalName: string;
  originalShift: string;
  assignedZone: string;
  breaks?: { type: string; time: string; }[];
  startTimeStr: string;
  durationHours: number;
}

export interface ImportScheduleRowProps {
  rev: ParsedShiftRowData;
  roster?: Employee[];
  handleShiftTimeChange: (id: string, value: string) => void;
  handleMatchChange: (id: string, value: string) => void;
  handleZoneChange: (id: string, value: string) => void;
}

export default function ImportScheduleRow({
  rev,
  roster = [],
  handleShiftTimeChange,
  handleMatchChange,
  handleZoneChange
}: ImportScheduleRowProps) {
  const matched = roster?.find(r => r.id === rev.matchedEmpId);
  const isCreateNew = rev.matchedEmpId === 'create_new';

  return (
    <tr 
      key={rev.id} 
      className={`border-b-glass ${isCreateNew ? 'bg-bby-blue-alpha-05' : !matched ? 'bg-error-alpha-05' : 'bg-transparent'}`}
      data-testid={`schedule-row-${rev.id}`}
    >
      {/* Raw Name */}
      <td className="p-md text-white font-semibold">
        {rev.originalName}
      </td>

      {/* Raw Shift */}
      <td className="p-md">
        <input 
          type="text" 
          className="form-control text-xs p-xs-sm bg-obsidian m-0 w-150px"
          value={rev.originalShift || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShiftTimeChange(rev.id, e.target.value)}
          data-testid="shift-time-input"
        />
      </td>

      {/* Roster Match Selector */}
      <td className="p-md">
        <select
          className={`form-control text-xs p-xs-sm m-0 h-30px ${isCreateNew ? 'bg-bby-blue-alpha-15 border-info text-info' : matched ? 'bg-obsidian border-glass text-white' : 'bg-error-alpha-10 border-error text-error'}`}
          value={rev.matchedEmpId || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleMatchChange(rev.id, e.target.value)}
          data-testid="roster-match-select"
        >
          <option value="">-- Unmatched (Ignore) --</option>
          <option value="create_new" className="text-info font-bold">[+] Add as New Associate</option>
          {roster?.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
          ))}
        </select>
      </td>

      {/* Zone Assignment Override */}
      <td className="p-md">
        <select
          className="form-control text-xs p-xs-sm bg-obsidian m-0 h-30px"
          value={rev.assignedZone || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleZoneChange(rev.id, e.target.value)}
          data-testid="zone-assignment-select"
        >
          {['Computing', 'Mobile', 'Home Theatre', 'Front End', 'Geek Squad', 'Appliances'].map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </td>

      {/* Auto Break Math Info */}
      <td className="p-md text-secondary">
        {matched ? (
          !rev.breaks || rev.breaks.length === 0 ? (
            <span className="text-xs text-muted">No breaks (&lt;4h)</span>
          ) : (
            <div className="flex flex-wrap gap-xs">
              {rev.breaks?.map((b, i) => (
                <span 
                  key={i} 
                  className="py-xs px-sm bg-white-alpha-05 rounded-sm text-2xs border-glass" 
                  title={b?.type || ''}
                >
                  {b?.time} ({b?.type?.includes('15') ? '15m' : '30m'})
                </span>
              ))}
            </div>
          )
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
    </tr>
  );
}
