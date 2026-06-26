import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  title: string;
  children: React.ReactNode;
  activeCount: number;
}

export default function DroppableZone({ id, title, children, activeCount }: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`zone-card transition-all min-h-[200px] ${
        isOver 
          ? 'border-2 border-dashed border-[var(--bby-blue)] bg-[var(--bby-blue-alpha-10)] shadow-[0_0_20px_var(--bby-blue-alpha-20),inset_0_0_15px_var(--bby-blue-alpha-10)] scale-[1.02]' 
          : 'border-2 border-transparent shadow-none scale-100'
      }`} 
      data-testid={`droppable-zone-${String(id || '').replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="zone-card-header">
        <h4 className="zone-card-title">{title}</h4>
        <span className="tag-pill zone-tag" data-testid="zone-active-count">{activeCount} active</span>
      </div>
      <div className="zone-emp-list min-h-100">
        {children}
        {activeCount === 0 && !isOver && (
          <div className="zone-unstaffed" data-testid="zone-unstaffed-message">Zone unstaffed</div>
        )}
      </div>
    </div>
  );
}
