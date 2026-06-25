import React from 'react';

export default function ZoneTimeline({
  timeSlots,
  assignedEmpIds,
  roster,
  zoneAssignments,
  activeBreaks
}) {
  return (
    <div className="bg-white-alpha-01 border-glass rounded-16 overflow-x-auto">
      <div className="min-w-800">
        {/* Timeline Header */}
        <div className="grid-timeline-header border-b-glass bg-black-alpha-20">
          <div className="p-md font-semibold text-secondary text-sm">Associate</div>
          {timeSlots.map(time => (
            <div key={time} className="py-md text-center font-semibold text-secondary text-xs border-l-white-alpha-05">
              {time}
            </div>
          ))}
        </div>
        
        {/* Timeline Rows */}
        <div className="flex-column">
          {assignedEmpIds.length === 0 ? (
            <div className="p-3rem text-center text-muted">No associates currently scheduled in zones.</div>
          ) : (
            assignedEmpIds.map(empId => {
              const emp = (roster || []).find(e => e.id === empId);
              if (!emp) return null;
              
              // Find what zone they are in
              let currentZone = 'Unassigned';
              const safeZoneAssignments = zoneAssignments || {};
              Object.keys(safeZoneAssignments).forEach(z => {
                if ((safeZoneAssignments[z] || []).includes(empId)) currentZone = z;
              });

              const isOnBreak = (activeBreaks || {})[empId]; // '15m', '30m', or null
              
              return (
                <div key={empId} className="grid-timeline-row border-b-white-alpha-03">
                  <div className="p-md flex-column gap-xs border-r-glass">
                    <span className="font-semibold text-white text-sm">{emp.name}</span>
                    <span className="text-xs text-bby-blue">{currentZone}</span>
                  </div>
                  
                  {/* Shift Block Area */}
                  <div className="relative p-sm flex-center justify-start">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 grid-cols-9 pointer-events-none">
                      {timeSlots.map((_, i) => (
                        <div key={i} className="border-l-dashed-white-alpha-05" />
                      ))}
                    </div>
                    
                    {/* Mock Shift Block (Spanning entire 10-6 range for demo) */}
                    <div className="w-full h-36px rounded-8 flex-center justify-start px-md relative z-1" style={{ 
                      background: isOnBreak ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 70, 190, 0.2)', 
                      border: `1px solid ${isOnBreak ? 'var(--error)' : 'var(--bby-blue)'}`,
                    }}>
                      {isOnBreak ? (
                        <span className="text-error text-xs font-bold">
                          {isOnBreak === '15m' ? '☕ 15m Break Active' : '🍔 30m Lunch Active'}
                        </span>
                      ) : (
                        <span className="text-white text-xs">Active Shift • {emp.dept}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
