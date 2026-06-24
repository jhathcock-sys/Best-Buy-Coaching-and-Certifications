import React from 'react';
import { Plus, Minus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function ShiftTrackerHourlyRow({ 
  hour, 
  idx, 
  activeShift, 
  checkHourStatus, 
  handleUpdateMetric, 
  handleUpdateStartRevenue, 
  handleUpdateEndRevenue, 
  handleRemoveHour 
}: any) {
  const onTrack = checkHourStatus(hour.pms, hour.apps, activeShift.isWeekend);
  const pmGoal = activeShift.isWeekend ? 3 : 2;
  const appGoal = activeShift.isWeekend ? 3 : 2;

  return (
    <tr className={`border-b border-glass ${onTrack ? 'bg-success-alpha-15' : 'bg-error-alpha'}`}>
      <td className="p-md font-semibold">
        Hour {hour.hourNumber} <span className="text-xs text-muted font-normal">(Interval #{idx + 1})</span>
      </td>
      
      {/* PMs Stepper */}
      <td className="p-md">
        <div className="flex-center gap-md">
          <button 
            type="button"
            className="btn btn-secondary rounded-full flex-center p-0 w-7 h-7" 
            onClick={() => handleUpdateMetric(idx, 'pms', -1)}
          >
            <Minus size={14} />
          </button>
          <span className={`text-lg font-bold w-6 text-center ${hour.pms >= pmGoal ? 'text-success' : 'text-white'}`}>
            {hour.pms}
          </span>
          <button 
            type="button"
            className="btn btn-secondary rounded-full flex-center p-0 w-7 h-7" 
            onClick={() => handleUpdateMetric(idx, 'pms', 1)}
          >
            <Plus size={14} />
          </button>
        </div>
      </td>

      {/* Apps Stepper */}
      <td className="p-md">
        <div className="flex-center gap-md">
          <button 
            type="button"
            className="btn btn-secondary rounded-full flex-center p-0 w-7 h-7" 
            onClick={() => handleUpdateMetric(idx, 'apps', -1)}
          >
            <Minus size={14} />
          </button>
          <span className={`text-lg font-bold w-6 text-center ${hour.apps >= appGoal ? 'text-success' : 'text-white'}`}>
            {hour.apps}
          </span>
          <button 
            type="button"
            className="btn btn-secondary rounded-full flex-center p-0 w-7 h-7" 
            onClick={() => handleUpdateMetric(idx, 'apps', 1)}
          >
            <Plus size={14} />
          </button>
        </div>
      </td>

      {/* Hourly Revenue Input */}
      <td className="p-md">
        <div className="flex-column align-center gap-xs">
          <div className="dashboard-grid gap-sm w-32" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <span className="text-xs text-muted block mb-xs text-center">Start ($)</span>
              <input 
                type="number"
                className="form-control text-center p-xs text-sm bg-obsidian border-glass rounded color-white m-0"
                value={hour.startRevenue !== undefined ? hour.startRevenue : ''}
                onChange={(e) => handleUpdateStartRevenue(idx, e.target.value)}
                placeholder="Start"
              />
            </div>
            <div>
              <span className="text-xs text-muted block mb-xs text-center">End ($)</span>
              <input 
                type="number"
                className="form-control text-center p-xs text-sm bg-obsidian border-glass rounded color-white m-0"
                value={hour.endRevenue !== undefined ? hour.endRevenue : ''}
                onChange={(e) => handleUpdateEndRevenue(idx, e.target.value)}
                placeholder="End"
              />
            </div>
          </div>
          
          <div className="flex-between w-32 text-xs py-xs px-sm bg-white-alpha-05 rounded border-glass mt-xs">
            <span className="text-secondary">Net:</span>
            <span className="font-bold text-success">
              ${(parseFloat(hour.revenue) || 0).toLocaleString([], { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-xs mt-xs">
            {['+500', '+1k', '+2k'].map(preset => {
              const val = preset === '+500' ? 500 : preset === '+1k' ? 1000 : 2000;
              return (
                <button
                  key={preset}
                  type="button"
                  className="px-sm py-xs text-xs bg-white-alpha-05 border-glass rounded text-secondary hover-scale transition-normal cursor-pointer hover:bg-white-alpha-10 hover:text-white"
                  onClick={() => {
                    const currentStart = parseFloat(hour.startRevenue) || 0;
                    const currentEnd = parseFloat(hour.endRevenue) || currentStart || 0;
                    handleUpdateEndRevenue(idx, currentEnd + val);
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>
      </td>

      {/* Status Check Badge */}
      <td className="p-md text-center">
        <div className="inline-flex align-center gap-xs">
          {onTrack ? (
            <span className="px-md py-xs bg-success-alpha-15 border border-success text-success rounded-xl text-xs font-bold inline-flex align-center gap-xs shadow-success-glow">
              <CheckCircle2 size={12} /> ON TRACK
            </span>
          ) : (
            <span className="px-md py-xs bg-error-alpha border border-error text-error rounded-xl text-xs font-bold inline-flex align-center gap-xs">
              <XCircle size={12} /> OFF TRACK
            </span>
          )}
        </div>
      </td>

      <td className="p-md text-right">
        <button 
          type="button"
          className="btn-trash bg-transparent border-none text-muted transition-normal"
          style={{ 
            cursor: activeShift.hours.length > 1 ? 'pointer' : 'not-allowed',
            opacity: activeShift.hours.length > 1 ? 1 : 0.3,
          }}
          onClick={() => handleRemoveHour(idx)}
          disabled={activeShift.hours.length <= 1}
          title="Delete Hour Record"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
