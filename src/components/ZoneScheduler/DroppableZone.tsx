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
    transition: 'all 0.2s ease',
    border: isOver ? '2px dashed var(--bby-blue)' : '2px solid transparent',
    background: isOver ? 'rgba(0, 70, 190, 0.1)' : 'var(--bg-space)',
    boxShadow: isOver ? '0 0 15px rgba(0, 70, 190, 0.3)' : 'none',
    minHeight: '200px'
  };

  return (
    <div ref={setNodeRef} className="zone-card" style={style}>
      <div className="zone-card-header">
        <h4 className="zone-card-title">{title}</h4>
        <span className="tag-pill zone-tag">{activeCount} active</span>
      </div>
      <div className="zone-emp-list" style={{ minHeight: '100px' }}>
        {children}
        {activeCount === 0 && !isOver && (
          <div className="zone-unstaffed">Zone unstaffed</div>
        )}
      </div>
    </div>
  );
}
