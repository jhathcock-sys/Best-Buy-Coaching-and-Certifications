import React from 'react';
import { Clock, Trash2 } from 'lucide-react';

export default function HistoricalShiftsArchive({ shifts, onDeleteShift }: any) {
  return (
    <>
      {/* HISTORICAL SHIFTS LIST */}
      <div className="glass-card p-2xl">
        <h3 className="text-xl mb-xl flex-center gap-sm justify-start">
          <Clock size={20} color="var(--info)" /> Past Floor Leading Shifts Archive
        </h3>
        
        {shifts.length === 0 ? (
          <div className="text-center p-3rem border-1-5-dashed-glass rounded-16 text-muted text-sm">
            No archived floor-leading shifts logged yet. Complete your first shift above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-glass text-secondary">
                  <th className="py-md-sm px-md">DATE</th>
                  <th className="py-md-sm px-md">FLOOR LEADER</th>
                  <th className="py-md-sm px-md text-center">TYPE</th>
                  <th className="py-md-sm px-md text-center">HOURS</th>
                  <th className="py-md-sm px-md text-center">TOTAL REVENUE</th>
                  <th className="py-md-sm px-md text-center">TOTAL PMs</th>
                  <th className="py-md-sm px-md text-center">TOTAL APPs</th>
                  <th className="py-md-sm px-md text-center">ON-TRACK RATE</th>
                  <th className="py-md-sm px-md text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift: any) => (
                  <tr key={shift.id} className="border-b-glass text-secondary">
                    <td className="p-md text-white font-semibold">{shift.date}</td>
                    <td className="p-md text-white">{shift.leaderName}</td>
                    <td className="p-md text-center">
                      {shift.isWeekend ? (
                        <span className="text-xs text-bby-yellow bg-bby-yellow-alpha-05 py-xs px-sm rounded-sm border-bby-yellow-alpha-15">Weekend</span>
                      ) : (
                        <span className="text-xs text-bby-blue bg-bby-blue-alpha-08 py-xs px-sm rounded-sm border-bby-blue-alpha-15">Weekday</span>
                      )}
                    </td>
                    <td className="p-md text-center text-white">{shift.totalHours} hrs</td>
                    <td className="p-md text-center text-info font-bold">
                      ${shift.totalRevenue ? shift.totalRevenue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$0.00'}
                    </td>
                    <td className="p-md text-center text-white font-bold">{shift.totalPms}</td>
                    <td className="p-md text-center text-white font-bold">{shift.totalApps}</td>
                    <td className="p-md text-center">
                      <span className="font-bold" style={{ 
                        color: shift.onTrackRatio >= 70 ? 'var(--success)' : shift.onTrackRatio >= 40 ? 'var(--bby-yellow)' : 'var(--error)' 
                      }}>
                        {shift.onTrackRatio}%
                      </span>
                    </td>
                    <td className="p-md text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this archived shift?')) {
                            onDeleteShift(shift.id);
                          }
                        }}
                        className="bg-transparent border-none text-error cursor-pointer p-0 transition-color-2s hover-opacity-80"
                        title="Delete Shift History"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
