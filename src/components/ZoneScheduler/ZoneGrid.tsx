import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import DroppableZone from './DroppableZone';
import DraggableAssociate from './DraggableAssociate';
import { useStore } from '../../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { Employee } from '../../types';
import './ZoneGrid.css';

const EMPTY_ARR: any[] = [];
const EMPTY_OBJ: any = {};

interface ZoneGridProps {
  zones: string[];
  unassignedEmps: Employee[];
  roster: Employee[];
  onAssignZone: (zone: string, empId: string) => void;
  onUnassignZone: (zone: string, empId: string) => void;
  onToggleBreakState: (empId: string, state: '15m' | '30m' | null) => void;
}

export default function ZoneGrid({
  zones,
  unassignedEmps,
  roster,
  onAssignZone,
  onUnassignZone,
  onToggleBreakState
}: ZoneGridProps) {
  const activeShift = useStore(useShallow((state) => state.activeShift));
  const safeZoneAssignments = activeShift?.zoneAssignments || EMPTY_OBJ;
  const safeActiveBreaks = activeShift?.activeBreaks || EMPTY_OBJ;
  const safeZones = zones || EMPTY_ARR;
  const safeUnassignedEmps = unassignedEmps || EMPTY_ARR;
  const safeRoster = roster || EMPTY_ARR;

  const [activeDragEmp, setActiveDragEmp] = useState<Employee | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const emp = active?.data?.current?.emp as Employee | undefined;
    if (emp) setActiveDragEmp(emp);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragEmp(null);

    if (over && over.id) {
      const empId = String(active.id);
      const targetZone = String(over.id);
      
      if (targetZone === 'unassigned') {
        const currentZone = safeZones.find(z => (safeZoneAssignments[z] || []).includes(empId));
        if (currentZone) {
          onUnassignZone(currentZone, empId);
        }
      } else {
        onAssignZone(targetZone, empId);
      }
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="zone-grid-layout grid-cols-1-3 gap-md min-h-500" data-testid="zone-grid-layout">
        
        {/* Unassigned Pool (Sidebar) */}
        <div className="flex-column">
          <DroppableZone id="unassigned" title="Unassigned (Roster)" activeCount={safeUnassignedEmps.length}>
            {safeUnassignedEmps.map((emp: Employee) => (
              <DraggableAssociate 
                key={emp.id} 
                emp={emp} 
                isOnBreak={safeActiveBreaks[emp.id]}
                onToggleBreakState={onToggleBreakState}
              />
            ))}
          </DroppableZone>
        </div>

        {/* Main Store Map */}
        <div className="store-map-grid grid-cols-2 grid-rows-auto gap-md" data-testid="store-map-grid">
          {safeZones.map(zone => {
            const zoneEmps = safeZoneAssignments[zone] || [];
            
            return (
              <DroppableZone key={zone} id={zone} title={zone} activeCount={zoneEmps.length}>
                {zoneEmps.map((empId: string) => {
                  const emp = safeRoster.find((e: Employee) => e.id === empId);
                  if (!emp) return null;
                  
                  return (
                    <DraggableAssociate 
                      key={empId} 
                      emp={emp} 
                      isOnBreak={safeActiveBreaks[empId]} 
                      onUnassignZone={() => onUnassignZone(zone, empId)}
                      onToggleBreakState={onToggleBreakState}
                    />
                  );
                })}
              </DroppableZone>
            );
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragEmp ? (
          <DraggableAssociate 
            emp={activeDragEmp} 
            isOnBreak={safeActiveBreaks[activeDragEmp.id]} 
            isOverlay={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
