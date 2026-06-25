import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableAssociateProps {
  emp: any;
  isOnBreak: '15m' | '30m' | null;
  onUnassignZone?: (empId: string) => void;
  onToggleBreakState?: (empId: string, state: '15m' | '30m' | null) => void;
  isOverlay?: boolean;
}

export default function DraggableAssociate({ emp, isOnBreak, onUnassignZone, onToggleBreakState, isOverlay }: DraggableAssociateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: emp.id,
    data: { emp }
  });

  const style: React.CSSProperties = {
    transform: transform 
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) ${isOverlay ? 'scale(1.05)' : ''}` 
      : (isOverlay ? 'scale(1.05)' : undefined),
    zIndex: isOverlay ? 999 : (isDragging ? 0 : 1),
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    cursor: isOverlay || isDragging ? 'grabbing' : 'grab',
    boxShadow: isOverlay ? '0 12px 40px var(--black-alpha-50), 0 0 20px var(--bby-blue-alpha-20)' : undefined,
    border: isOverlay ? '1px solid var(--bby-blue)' : undefined,
    background: isOverlay ? 'var(--bg-card-hover)' : undefined,
    backdropFilter: isOverlay ? 'blur(16px)' : undefined,
    position: 'relative',
    transition: isDragging ? 'none' : 'var(--transition-normal)'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`zone-emp-card ${isOnBreak ? 'zone-emp-card-break' : 'zone-emp-card-active'}`}
      data-testid={`draggable-associate-${emp.id}`}
    >
      <div className="zone-emp-header">
        <span className={`zone-emp-name ${isOnBreak ? 'zone-emp-name-break' : ''}`}>{emp.name}</span>
        {onUnassignZone && (
          <button 
            className="zone-emp-remove"
            onPointerDown={(e) => {
              e.stopPropagation(); // prevent drag when clicking remove
              onUnassignZone(emp.id);
            }}
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="zone-emp-metrics">
        <span>Membs: {emp.memberships}</span>
        <span>CCs: {emp.creditCards}</span>
        <span>GSP: {emp.warranty}%</span>
      </div>

      <div className="zone-emp-tags">
        {emp.focus5 && (
          <span className="zone-emp-focus">
            🔥 FOCUS 5
          </span>
        )}
        {emp.gap && emp.gap !== 'None' && (
          <span className="zone-emp-gap">
            ⚠️ Gap: {emp.gap.split(' & ')[0]}
          </span>
        )}
      </div>

      {/* Manual Break Controls */}
      {onToggleBreakState && (
        <div className="zone-break-controls">
          {isOnBreak ? (
            <div className="zone-break-active">
              <span className="zone-break-text" data-testid={`break-status-${emp.id}`}>
                {isOnBreak === '15m' ? '☕ On 15m Break' : '🍔 On 30m Lunch'}
              </span>
              <button
                className="zone-break-end-btn"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onToggleBreakState(emp.id, null);
                }}
              >
                End Break
              </button>
            </div>
          ) : (
            <div className="zone-break-inactive">
              <span className="zone-break-label">Send on:</span>
              <div className="zone-break-btns">
                <button
                  type="button"
                  className="zone-break-btn"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onToggleBreakState(emp.id, '15m');
                  }}
                >
                  ☕ 15m
                </button>
                <button
                  type="button"
                  className="zone-break-btn"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onToggleBreakState(emp.id, '30m');
                  }}
                >
                  🍔 30m
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
