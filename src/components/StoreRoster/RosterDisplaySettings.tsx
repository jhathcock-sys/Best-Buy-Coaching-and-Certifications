import React from 'react';
import { Sliders } from 'lucide-react';

export interface VisibleCols {
  hours: boolean;
  dept: boolean;
  memberships: boolean;
  creditCards: boolean;
  warranty: boolean;
  surveys: boolean;
  rph: boolean;
  basket: boolean;
  attach: boolean;
  status: boolean;
}

export interface RosterDisplaySettingsProps {
  showViewSettings: boolean;
  isDense: boolean;
  setIsDense: (isDense: boolean) => void;
  visibleCols: VisibleCols;
  setVisibleCols: React.Dispatch<React.SetStateAction<VisibleCols>>;
}

export default function RosterDisplaySettings({
  showViewSettings,
  isDense,
  setIsDense,
  visibleCols,
  setVisibleCols
}: RosterDisplaySettingsProps) {
  if (!showViewSettings) return null;

  return (
    <div 
      className="glass-card flex flex-col gap-4 py-5 px-8 border border-white/10 animate-fade-in"
      data-testid="roster-display-settings"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h4 className="m-0 text-[0.95rem] text-white flex items-center gap-[0.4rem] font-bold">
          <Sliders size={16} className="text-bby-blue" /> Roster Display Settings
        </h4>
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
          <input 
            type="checkbox" 
            checked={isDense} 
            onChange={(e) => setIsDense(e.target.checked)} 
            className="cursor-pointer"
            data-testid="dense-mode-toggle"
          />
          <span>Enable Dense Grid Layout</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-y-3 gap-x-5 p-3 bg-black/15 rounded-lg border border-white/5">
        {(Object.keys(visibleCols || {}) as Array<keyof VisibleCols>).map(col => {
          const label = 
            col === 'hours' ? 'Hours' :
            col === 'dept' ? 'Department' :
            col === 'memberships' ? 'Memberships' :
            col === 'creditCards' ? 'BBY Cards' :
            col === 'warranty' ? 'GSP/Warranty' :
            col === 'surveys' ? '5 Star Surveys' :
            col === 'rph' ? 'RPH Index' :
            col === 'basket' ? 'Basket' :
            col === 'attach' ? 'Dept Attach' :
            col === 'status' ? 'Status' : col;

          return (
            <label key={col} className="inline-flex items-center gap-[0.4rem] cursor-pointer text-sm text-white">
              <input 
                type="checkbox" 
                checked={visibleCols[col]} 
                onChange={(e) => setVisibleCols({ ...visibleCols, [col]: e.target.checked })} 
                className="cursor-pointer"
                data-testid={`toggle-col-${col}`}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
