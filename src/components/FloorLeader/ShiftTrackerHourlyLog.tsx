import React from 'react';
import { Plus } from 'lucide-react';
import ShiftTrackerHourlyRow from './ShiftTrackerHourlyRow';
import { useStore } from '../../store/useStore';

export interface ShiftTrackerHourlyLogProps {
  checkHourStatus: (pms: number, apps: number, isWeekendShift: boolean) => boolean;
  handleAddHour: () => void;
  handleUpdateMetric: (hourIndex: number, metric: 'pms' | 'apps', increment: number) => void;
  handleUpdateStartRevenue: (hourIndex: number, val: string) => void;
  handleUpdateEndRevenue: (hourIndex: number, val: string) => void;
  handleRemoveHour: (index: number) => void;
}

export default function ShiftTrackerHourlyLog({
  checkHourStatus,
  handleAddHour,
  handleUpdateMetric,
  handleUpdateStartRevenue,
  handleUpdateEndRevenue,
  handleRemoveHour
}: ShiftTrackerHourlyLogProps) {
  const activeShift = useStore((state) => state.activeShift);

  if (!activeShift) return null;

  return (
    <div className="flex-column gap-xl" data-testid="shift-tracker-hourly-log">
      <div className="glass-card p-xl">
        <div className="flex-center justify-between mb-xl flex-wrap gap-md">
          <div>
            <h3 className="text-xl font-bold">Hourly Floor Performance Log</h3>
            <p className="text-sm text-secondary mt-xs">Increment Apps, PMs, and Revenue at the end of each hourly check.</p>
          </div>
          <div className="flex gap-md">
            <button className="btn btn-secondary px-md py-sm text-sm cursor-pointer" onClick={handleAddHour} data-testid="btn-add-hour-top">
              + Add Next Hour
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-glass text-secondary text-sm">
                <th className="p-md">TIME INTERVAL</th>
                <th className="p-md text-center">PMs (MEMBERSHIPS)</th>
                <th className="p-md text-center">APPs (CREDIT CARDS)</th>
                <th className="p-md text-center">REVENUE GENERATED</th>
                <th className="p-md text-center">STATUS</th>
                <th className="p-md text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {(activeShift?.hours || []).map((hour, idx) => {
                return (
                  <ShiftTrackerHourlyRow
                    key={idx}
                    idx={idx}
                    hour={hour}
                    actions={{
                      checkHourStatus,
                      handleUpdateMetric,
                      handleUpdateStartRevenue,
                      handleUpdateEndRevenue,
                      handleRemoveHour
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex-center mt-sm">
        <button className="btn btn-secondary flex-center gap-xs text-sm border-dashed cursor-pointer" onClick={handleAddHour} data-testid="btn-add-hour-bottom">
          <Plus size={16} /> Add Hour {(activeShift?.hours?.length || 0) + 1}
        </button>
      </div>
    </div>
  );
}
