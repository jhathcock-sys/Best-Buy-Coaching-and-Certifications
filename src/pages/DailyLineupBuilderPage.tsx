import React, { useState } from 'react';
import { CalendarDays, Wand2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Employee } from '../types';
import ZoneCard from '../components/DailyLineupBuilder/ZoneCard';
import AvailableRosterPanel from '../components/DailyLineupBuilder/AvailableRosterPanel';

const EMPTY_OBJ = {};

export default function DailyLineupBuilder() {
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster: Employee[] = React.useMemo(
    () => (Object.values(_rawroster) as Employee[]).sort((a, b) => (a?.name || '').localeCompare(b?.name || '')), 
    [_rawroster]
  );
  
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
  const playbookSettings = useStore(state => state.playbookSettings);

  const handleSmartAssign = async () => {
    if (!apiKey) {
      alert("Please configure your Gemini API key in Settings first.");
      return;
    }
    if (roster.length === 0) {
      alert("Roster is empty or still loading.");
      return;
    }
    
    setIsSmartAssigning(true);
    try {
      const { generateSmartZoning } = await import('../services/ai/geminiSmartZoning');
      const newAssignments = await generateSmartZoning(roster, zones, apiKey, playbookSettings);
      
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
      return (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleAssign = (empId: string, targetZone: string) => {
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

  const handleUnassign = (empId: string, zone: string) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      newAssignments[zone] = newAssignments[zone].filter(id => id !== empId);
      return newAssignments;
    });
  };

  return (
    <div className="flex-column gap-xl h-full min-h-[600px] animate-fade-in">
      
      {/* Header */}
      <div className="flex-between flex-wrap gap-md align-center">
        <div>
          <h2 className="flex-row align-center gap-sm font-heading text-bby-blue m-0 text-1-75rem">
            <CalendarDays size={28} /> Daily Lineup Builder
          </h2>
          <p className="text-secondary text-sm mt-xs m-0">
            Assign associates to zones and identify coverage gaps for the day.
          </p>
        </div>
        <div className="flex-row gap-md">
          <input 
            type="date" 
            data-testid="lineup-date-input"
            className="form-control w-auto" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button 
            data-testid="smart-assign-btn"
            className="btn cursor-pointer flex-row align-center gap-xs" 
            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            onClick={handleSmartAssign}
            disabled={isSmartAssigning || roster.length === 0}
          >
            <Wand2 size={16} />
            {isSmartAssigning ? 'Thinking...' : 'AI Smart Assign'}
          </button>
          <button data-testid="save-lineup-btn" className="btn btn-primary cursor-pointer">Save Lineup</button>
        </div>
      </div>

      <div className="grid gap-xl" style={{ gridTemplateColumns: '1fr 300px' }}>
        
        {/* Floor Zones Layout */}
        <div className="grid gap-lg" style={{ gridTemplateColumns: '1fr 1fr', alignContent: 'start' }}>
          {zones.map(zone => (
            <ZoneCard 
              key={zone}
              zone={zone}
              assignments={assignments[zone]}
              roster={roster}
              handleAssign={handleAssign}
              handleUnassign={handleUnassign}
            />
          ))}
        </div>

        {/* Available Roster Sidebar */}
        <AvailableRosterPanel 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          availableRoster={availableRoster}
          zones={zones}
          handleAssign={handleAssign}
        />
      </div>
    </div>
  );
}
