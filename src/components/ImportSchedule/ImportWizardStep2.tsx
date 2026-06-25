import React from 'react';
import ImportScheduleRow, { ParsedShiftRowData } from './ImportScheduleRow';
import { Employee } from '../../types';

export interface ImportWizardStep2Props {
  reviews?: ParsedShiftRowData[];
  setReviews: (val: ParsedShiftRowData[]) => void;
  setParsedItems: (val: any[]) => void;
  roster?: Employee[];
  handleMatchChange: (id: string, value: string) => void;
  handleZoneChange: (id: string, value: string) => void;
  handleShiftTimeChange: (id: string, value: string) => void;
  isProcessing?: boolean;
}

export default function ImportWizardStep2({
  reviews = [],
  setReviews,
  setParsedItems,
  roster = [],
  handleMatchChange,
  handleZoneChange,
  handleShiftTimeChange,
  isProcessing = false
}: ImportWizardStep2Props) {
  return (
    <div>
      <div className="flex-between align-center mb-xl">
        <div>
          <h4 className="text-md m-0 text-white">Validate & Map Floor Schedule</h4>
          <p className="text-secondary text-xs mt-xs mb-0">Verify fuzzy matches to your roster. Red highlights indicate unmatched names that will be ignored unless overridden.</p>
        </div>
        <button 
          className="btn btn-secondary py-xs px-sm text-xs cursor-pointer"
          onClick={() => { setParsedItems([]); setReviews([]); }}
          disabled={isProcessing}
          data-testid="clear-import-btn"
        >
          Clear Import
        </button>
      </div>

      <div className="overflow-x-auto border-glass rounded-xl bg-black-alpha-20">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-obsidian-alpha-90 border-b-glass text-secondary">
              <th className="p-md">EXTRACTED NAME</th>
              <th className="p-md">SHIFT TIME</th>
              <th className="p-md">ROSTER MATCH</th>
              <th className="p-md">ZONE ASSIGNMENT</th>
              <th className="p-md">AUTO BREAKS</th>
            </tr>
          </thead>
          <tbody>
            {reviews?.map((rev) => {
              return (
                <ImportScheduleRow 
                  key={rev.id}
                  rev={rev}
                  roster={roster}
                  handleShiftTimeChange={handleShiftTimeChange}
                  handleMatchChange={handleMatchChange}
                  handleZoneChange={handleZoneChange}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
