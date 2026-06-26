import React from 'react';
import { MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Employee } from '../../types';

interface ZoneCardProps {
  zone: string;
  assignments: string[];
  roster: Employee[];
  handleAssign: (empId: string, targetZone: string) => void;
  handleUnassign: (empId: string, zone: string) => void;
}

export default function ZoneCard({ zone, assignments, roster, handleAssign, handleUnassign }: ZoneCardProps) {
  const getCoverageStatus = (zone: string) => {
    const count = assignments.length;
    if (count === 0) return { color: 'var(--error)', text: 'Critical Gap', icon: <AlertTriangle size={14} /> };
    if (count === 1) return { color: 'var(--warning)', text: 'Minimal', icon: <Clock size={14} /> };
    return { color: 'var(--success)', text: 'Covered', icon: <CheckCircle size={14} /> };
  };

  const status = getCoverageStatus(zone);

  return (
    <div data-testid={`zone-card-${zone.replace(/\s+/g, '-').toLowerCase()}`} className="glass-card p-md" style={{ borderTop: `4px solid ${status.color}` }}>
      <div className="flex-between align-center mb-md">
        <h4 className="flex-row align-center gap-xs m-0 text-1-05rem text-white">
          <MapPin size={18} color="var(--bby-blue)" /> {zone}
        </h4>
        <span className="flex-row align-center gap-xs text-xs font-bold" style={{ color: status.color }}>
          {status.icon} {status.text}
        </span>
      </div>
      
      <div 
        data-testid={`drop-zone-${zone.replace(/\s+/g, '-').toLowerCase()}`}
        className="flex-column gap-sm p-sm rounded-lg"
        style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const empId = e.dataTransfer.getData('text/plain');
          if (empId) {
            handleAssign(empId, zone);
          }
        }}
      >
        {assignments.length === 0 ? (
          <div className="text-muted text-sm text-center m-auto">
            Drag here or click assign
          </div>
        ) : (
          assignments.map(empId => {
            const emp = roster.find(e => e.id === empId);
            if (!emp) return null;
            return (
              <div 
                key={empId} 
                data-testid={`assigned-emp-${empId}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', empId)}
                className="flex-between align-center px-sm py-xs rounded-md cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-sm text-white font-semibold">{emp.name}</span>
                <button 
                  data-testid={`remove-btn-${empId}`}
                  onClick={() => handleUnassign(empId, zone)}
                  className="btn-icon btn-icon-transparent text-error cursor-pointer text-xs p-0"
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
