import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import DroppableZone from './DroppableZone';
import DraggableAssociate from './DraggableAssociate';
import './ZoneGrid.css';

export default function ZoneGrid({
  zones,
  zoneAssignments,
  unassignedEmps,
  roster,
  activeBreaks,
  onAssignZone,
  onUnassignZone,
  onToggleBreakState
}) {
  const [activeDragEmp, setActiveDragEmp] = useState<any>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const emp = active.data.current?.emp;
    if (emp) setActiveDragEmp(emp);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragEmp(null);

    if (over && over.id) {
      const empId = active.id;
      const targetZone = over.id as string;
      
      if (targetZone === 'unassigned') {
        // Find which zone they were in and unassign them
        const currentZone = zones.find(z => ((zoneAssignments || {})[z] || []).includes(empId));
        if (currentZone) {
          onUnassignZone(currentZone, empId);
        }
      } else {
        // Assign to new zone (this will remove from old zone via zustand action)
        onAssignZone(targetZone, empId);
      }
    }
  };

  const safeZoneAssignments = zoneAssignments || {};
  const safeRoster = roster || [];
  const safeActiveBreaks = activeBreaks || {};
  const safeUnassignedEmps = unassignedEmps || [];

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="zone-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', minHeight: '500px' }}>
        
        {/* Unassigned Pool (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DroppableZone id="unassigned" title="Unassigned (Roster)" activeCount={safeUnassignedEmps.length}>
            {safeUnassignedEmps.map((emp: any) => (
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
        <div className="store-map-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'auto',
          gap: '1rem'
        }}>
          {zones.map(zone => {
            const zoneEmps = safeZoneAssignments[zone] || [];
            
            return (
              <DroppableZone key={zone} id={zone} title={zone} activeCount={zoneEmps.length}>
                {zoneEmps.map((empId: string) => {
                  const emp = safeRoster.find((e: any) => e.id === empId);
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
