import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { Employee } from '../../types';

const EMPTY_OBJ: any = {};
const EMPTY_ARR: any[] = [];

interface ZoneTimelineProps {
  timeSlots: string[];
}

export default function ZoneTimeline({ timeSlots }: ZoneTimelineProps) {
  const activeShift = useStore(useShallow((state) => state.activeShift));
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;

  const safeTimeSlots = timeSlots || EMPTY_ARR;

  const timelineData = useMemo(() => {
    const rawRoster = rosterHistory[activePeriod] || EMPTY_OBJ;
    const roster = Object.values(rawRoster) as Employee[];
    
    const zoneAssignments = activeShift?.zoneAssignments || EMPTY_OBJ;
    const activeBreaks = activeShift?.activeBreaks || EMPTY_OBJ;

    const assignedEmpIds = Object.values(zoneAssignments).flat() as string[];
    const safeAssignedEmpIds = assignedEmpIds || EMPTY_ARR;

    // Pre-calculate zone mapping
    const empZoneMap: Record<string, string> = {};
    Object.entries(zoneAssignments).forEach(([zone, ids]) => {
      if (Array.isArray(ids)) {
        ids.forEach((id: string) => {
          empZoneMap[id] = zone;
        });
      }
    });

    return safeAssignedEmpIds.map(empId => {
      const emp = roster.find(e => e.id === empId);
      if (!emp) return null;
      
      const currentZone = empZoneMap[empId] || 'Unassigned';
      const isOnBreak = activeBreaks[empId] || null;

      return {
        empId,
        emp,
        currentZone,
        isOnBreak
      };
    }).filter(Boolean) as Array<{
      empId: string;
      emp: Employee;
      currentZone: string;
      isOnBreak: '15m' | '30m' | null;
    }>;
  }, [activeShift, activePeriod, rosterHistory]);

  return (
    <div className="bg-white-alpha-01 border-glass rounded-16 overflow-x-auto" data-testid="zone-timeline">
      <div className="min-w-800">
        {/* Timeline Header */}
        <div className="grid-timeline-header border-b-glass bg-black-alpha-20">
          <div className="p-md font-semibold text-secondary text-sm">Associate</div>
          {safeTimeSlots.map(time => (
            <div key={time} className="py-md text-center font-semibold text-secondary text-xs border-l-white-alpha-05">
              {time}
            </div>
          ))}
        </div>
        
        {/* Timeline Rows */}
        <div className="flex-column">
          {timelineData.length === 0 ? (
            <div className="p-3rem text-center text-muted">No associates currently scheduled in zones.</div>
          ) : (
            timelineData.map(({ empId, emp, currentZone, isOnBreak }) => (
              <div key={empId} className="grid-timeline-row border-b-white-alpha-03" data-testid={`timeline-row-${empId}`}>
                <div className="p-md flex-column gap-xs border-r-glass">
                  <span className="font-semibold text-white text-sm">{emp.name}</span>
                  <span className="text-xs text-bby-blue">{currentZone}</span>
                </div>
                
                {/* Shift Block Area */}
                <div className="relative p-sm flex-center justify-start">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 grid-cols-9 pointer-events-none">
                    {safeTimeSlots.map((_, i) => (
                      <div key={i} className="border-l-dashed-white-alpha-05" />
                    ))}
                  </div>
                  
                  {/* Mock Shift Block (Spanning entire 10-6 range for demo) */}
                  <div 
                    className={`w-full h-36px rounded-8 flex-center justify-start px-md relative z-1 border ${
                      isOnBreak ? 'bg-error-alpha-20 border-error' : 'bg-bby-blue-alpha-20 border-bby-blue'
                    }`}
                  >
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
