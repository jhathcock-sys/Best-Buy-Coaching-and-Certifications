import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableAssociateProps {
  emp: any;
  isOnBreak: '15m' | '30m' | null;
  onUnassignZone?: (empId: string) => void;
  onToggleBreakState?: (empId: string, state: '15m' | '30m' | null) => void;
}

export default function DraggableAssociate({ emp, isOnBreak, onUnassignZone, onToggleBreakState }: DraggableAssociateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: emp.id,
    data: { emp }
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : undefined,
    position: 'relative'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`zone-emp-card ${isOnBreak ? 'zone-emp-card-break' : 'zone-emp-card-active'}`}
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
              <span className="zone-break-text">
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
