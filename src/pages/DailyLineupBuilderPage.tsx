import React, { useState } from 'react';
import { CalendarDays, Users, MapPin, Search, AlertTriangle, CheckCircle, Clock, Wand2 } from 'lucide-react';

import { useStore } from '../store/useStore';

const EMPTY_OBJ = {};

export default function DailyLineupBuilder() {
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hardcoded zones for now. Later can be pulled from settings.
  const zones = ['Mobile', 'Computing', 'Home Theater', 'Connected Home', 'Front End', 'Geek Squad'];
  
  // State to hold assignments: { zoneName: [employeeId, ...] }
  const [assignments, setAssignments] = useState<Record<string, string[]>>({
    'Mobile': [],
    'Computing': [],
    'Home Theater': [],
    'Connected Home': [],
    'Front End': [],
    'Geek Squad': []
  });
  const [isSmartAssigning, setIsSmartAssigning] = useState(false);
  const apiKey = useStore((state) => state.apiKey);

  const handleSmartAssign = async () => {
    if (!apiKey) {
      alert("Please configure your Gemini API key in Settings first.");
      return;
    }
    setIsSmartAssigning(true);
    try {
      const { generateSmartZoning } = await import('../services/ai/geminiSmartZoning');
      const newAssignments = await generateSmartZoning(roster, zones, apiKey);
      
      // Ensure all zones exist in the result, even if empty
      const normalizedAssignments: Record<string, string[]> = {};
      zones.forEach(z => {
        normalizedAssignments[z] = newAssignments[z] || [];
      });
      
      setAssignments(normalizedAssignments);
    } catch (err) {
      console.error(err);
      alert("Smart Assign failed. Check console for details.");
    } finally {
      setIsSmartAssigning(false);
    }
  };

  const availableRoster = roster.filter(emp => {
    // Filter out employees already assigned
    const isAssigned = Object.values(assignments).some(assignedList => assignedList.includes(emp.id));
    if (isAssigned) return false;
    if (searchTerm) {
      return emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleAssign = (empId, targetZone) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      // Remove from any existing zone first to support moving between zones
      Object.keys(newAssignments).forEach(z => {
        newAssignments[z] = newAssignments[z].filter(id => id !== empId);
      });
      // Add to target zone
      newAssignments[targetZone] = [...newAssignments[targetZone], empId];
      return newAssignments;
    });
  };

  const handleUnassign = (empId, zone) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      newAssignments[zone] = newAssignments[zone].filter(id => id !== empId);
      return newAssignments;
    });
  };

  const getCoverageStatus = (zone) => {
    const count = assignments[zone].length;
    if (count === 0) return { color: 'var(--error)', text: 'Critical Gap', icon: <AlertTriangle size={14} /> };
    if (count === 1) return { color: 'var(--warning)', text: 'Minimal', icon: <Clock size={14} /> };
    return { color: 'var(--success)', text: 'Covered', icon: <CheckCircle size={14} /> };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', minHeight: '600px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--bby-blue)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <CalendarDays size={28} /> Daily Lineup Builder
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Assign associates to zones and identify coverage gaps for the day.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="date" 
            className="form-control" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 'auto' }}
          />
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            onClick={handleSmartAssign}
            disabled={isSmartAssigning}
          >
            <Wand2 size={16} />
            {isSmartAssigning ? 'Thinking...' : 'AI Smart Assign'}
          </button>
          <button className="btn btn-primary">Save Lineup</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Floor Zones Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignContent: 'start' }}>
          {zones.map(zone => {
            const status = getCoverageStatus(zone);
            return (
              <div key={zone} className="glass-card" style={{ padding: '1.25rem', borderTop: `4px solid ${status.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.05rem', color: '#fff' }}>
                    <MapPin size={18} color="var(--bby-blue)" /> {zone}
                  </h4>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: status.color, fontWeight: 700 }}>
                    {status.icon} {status.text}
                  </span>
                </div>
                
                <div 
                  style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const empId = e.dataTransfer.getData('text/plain');
                    if (empId) {
                      handleAssign(empId, zone);
                    }
                  }}
                >
                  {assignments[zone].length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
                      Drag here or click assign
                    </div>
                  ) : (
                    assignments[zone].map(empId => {
                      const emp = roster.find(e => e.id === empId);
                      if (!emp) return null;
                      return (
                        <div 
                          key={empId} 
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', empId)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'grab' }}
                        >
                          <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{emp.name}</span>
                          <button 
                            onClick={() => handleUnassign(empId, zone)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.75rem' }}
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
          })}
        </div>

        {/* Available Roster Sidebar */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={18} /> Available Roster
          </h3>
          <div className="search-bar" style={{ marginBottom: '0.5rem' }}>
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Find associate..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {availableRoster.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No available associates</p>
            ) : (
              availableRoster.map(emp => (
                <div 
                  key={emp.id} 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', emp.id)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem', cursor: 'grab' }}
                >
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{emp.dept}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {zones.map(zone => (
                      <button 
                        key={zone}
                        onClick={() => handleAssign(emp.id, zone)}
                        style={{ 
                          background: 'rgba(0, 70, 190, 0.2)', 
                          border: '1px solid rgba(0, 70, 190, 0.4)', 
                          color: '#fff', 
                          fontSize: '0.7rem', 
                          padding: '0.2rem 0.4rem', 
                          borderRadius: '4px',
                          cursor: 'pointer'
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

      </div>
    </div>
  );
}
