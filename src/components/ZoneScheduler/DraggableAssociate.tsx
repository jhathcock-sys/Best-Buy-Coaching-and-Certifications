import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Employee } from '../../types';

interface DraggableAssociateProps {
  emp: Employee;
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
    position: 'relative'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`zone-emp-card ${isOnBreak ? 'zone-emp-card-break' : 'zone-emp-card-active'} ${isOverlay ? 'zone-emp-card-overlay' : ''} ${isDragging ? 'zone-emp-card-dragging' : ''}`}
      data-testid={`draggable-associate-${emp?.id}`}
    >
      <div className="zone-emp-header">
        <span className={`zone-emp-name ${isOnBreak ? 'zone-emp-name-break' : ''}`}>{emp?.name}</span>
        {onUnassignZone && (
          <button 
            className="zone-emp-remove cursor-pointer"
            onPointerDown={(e) => {
              e.stopPropagation(); // prevent drag when clicking remove
              onUnassignZone(emp?.id);
            }}
            data-testid={`btn-remove-${emp?.id}`}
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="zone-emp-metrics">
        <span>Membs: {emp?.memberships ?? 0}</span>
        <span>CCs: {emp?.creditCards ?? 0}</span>
        <span>GSP: {emp?.warranty ?? 0}%</span>
      </div>

      <div className="zone-emp-tags">
        {emp?.focus5 && (
          <span className="zone-emp-focus">
            🔥 FOCUS 5
          </span>
        )}
        {emp?.gap && emp.gap !== 'None' && (
          <span className="zone-emp-gap">
            ⚠️ Gap: {emp.gap.split(' & ')[0] || ''}
          </span>
        )}
      </div>

      {/* Manual Break Controls */}
      {onToggleBreakState && (
        <div className="zone-break-controls">
          {isOnBreak ? (
            <div className="zone-break-active">
              <span className="zone-break-text" data-testid={`break-status-${emp?.id}`}>
                {isOnBreak === '15m' ? '☕ On 15m Break' : '🍔 On 30m Lunch'}
              </span>
              <button
                className="zone-break-end-btn cursor-pointer"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onToggleBreakState(emp?.id, null);
                }}
                data-testid={`btn-end-break-${emp?.id}`}
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
                  className="zone-break-btn cursor-pointer"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onToggleBreakState(emp?.id, '15m');
                  }}
                  data-testid={`btn-start-15m-${emp?.id}`}
                >
                  ☕ 15m
                </button>
                <button
                  type="button"
                  className="zone-break-btn cursor-pointer"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onToggleBreakState(emp?.id, '30m');
                  }}
                  data-testid={`btn-start-30m-${emp?.id}`}
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
