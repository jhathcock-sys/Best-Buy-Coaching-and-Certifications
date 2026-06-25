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

  const style: React.CSSProperties = {
    transition: 'var(--transition-normal)',
    border: isOver ? '2px dashed var(--bby-blue)' : '2px solid transparent',
    background: isOver ? 'var(--bby-blue-alpha-10)' : undefined,
    boxShadow: isOver ? '0 0 20px var(--bby-blue-alpha-20), inset 0 0 15px var(--bby-blue-alpha-10)' : 'none',
    transform: isOver ? 'scale(1.02)' : 'scale(1)',
    minHeight: '200px'
  };

  return (
    <div ref={setNodeRef} className="zone-card" style={style} data-testid={`droppable-zone-${id.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="zone-card-header">
        <h4 className="zone-card-title">{title}</h4>
        <span className="tag-pill zone-tag">{activeCount} active</span>
      </div>
      <div className="zone-emp-list min-h-100">
        {children}
        {activeCount === 0 && !isOver && (
          <div className="zone-unstaffed">Zone unstaffed</div>
        )}
      </div>
    </div>
  );
}
