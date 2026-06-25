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
        const currentZone = zones.find(z => (zoneAssignments[z] || []).includes(empId));
        if (currentZone) {
          onUnassignZone(currentZone, empId);
        }
      } else {
        // Assign to new zone (this will remove from old zone via zustand action)
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', minHeight: '500px' }}>
        
        {/* Unassigned Pool (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DroppableZone id="unassigned" title="Unassigned (Roster)" activeCount={unassignedEmps.length}>
            {unassignedEmps.map(emp => (
              <DraggableAssociate 
                key={emp.id} 
                emp={emp} 
                isOnBreak={activeBreaks[emp.id]} 
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
            const zoneEmps = zoneAssignments[zone] || [];
            
            return (
              <DroppableZone key={zone} id={zone} title={zone} activeCount={zoneEmps.length}>
                {zoneEmps.map(empId => {
                  const emp = roster.find(e => e.id === empId);
                  if (!emp) return null;
                  
                  return (
                    <DraggableAssociate 
                      key={empId} 
                      emp={emp} 
                      isOnBreak={activeBreaks[empId]} 
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
            isOnBreak={activeBreaks[activeDragEmp.id]} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
