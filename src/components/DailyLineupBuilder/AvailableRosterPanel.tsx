import React from 'react';
import { Users, Search } from 'lucide-react';
import { Employee } from '../../types';

interface AvailableRosterPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  availableRoster: Employee[];
  zones: string[];
  handleAssign: (empId: string, zone: string) => void;
}

export default function AvailableRosterPanel({ 
  searchTerm, 
  setSearchTerm, 
  availableRoster, 
  zones, 
  handleAssign 
}: AvailableRosterPanelProps) {
  return (
    <div className="glass-card flex-column gap-md p-lg h-full">
      <h3 className="flex-row align-center gap-sm m-0 text-1-1rem text-white">
        <Users size={18} /> Available Roster
      </h3>
      
      <div className="search-bar mb-xs">
        <Search className="search-icon" size={16} />
        <input 
          type="text" 
          data-testid="roster-search-input"
          placeholder="Find associate..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>
      
      <div className="flex-column gap-sm overflow-y-auto flex-1 pr-sm">
        {availableRoster.length === 0 ? (
          <p className="text-muted text-sm text-center">No available associates</p>
        ) : (
          availableRoster.map(emp => (
            <div 
              key={emp.id} 
              data-testid={`available-emp-${emp.id}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', emp.id)}
              className="p-sm rounded-lg cursor-pointer border-glass"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="font-semibold text-white text-0-9rem mb-xxs">{emp.name}</div>
              <div className="text-xs text-secondary mb-sm">{emp.dept}</div>
              <div className="flex-row flex-wrap gap-xs">
                {zones.map(zone => (
                  <button 
                    key={zone}
                    data-testid={`assign-btn-${emp.id}-${zone.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => handleAssign(emp.id, zone)}
                    className="cursor-pointer rounded border-none text-white text-0-7rem px-xs py-xxs"
                    style={{ 
                      background: 'rgba(0, 70, 190, 0.2)', 
                      border: '1px solid rgba(0, 70, 190, 0.4)', 
                    }}
                  >
                    +{zone.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
