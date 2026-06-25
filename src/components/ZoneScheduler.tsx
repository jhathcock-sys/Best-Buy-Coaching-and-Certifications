import React, { useState } from 'react';
import { Users, Clock, LayoutGrid, Zap } from 'lucide-react';
import ZoneGrid from './ZoneScheduler/ZoneGrid';
import ZoneTimeline from './ZoneScheduler/ZoneTimeline';
import { useStore } from '../store/useStore';
import { generateSmartZoning } from '../services/ai/geminiSmartZoning';
import toast from 'react-hot-toast';

export default function ZoneScheduler({ 
  zoneAssignments = {}, 
  roster = [], 
  onAssignZone, 
  onUnassignZone,
  activeBreaks = {},
  onToggleBreakState,
  onImportSchedule
}) {
  const zones = ['Computing', 'Mobile', 'Home Theatre', 'Front End', 'Geek Squad', 'Appliances'];
  const assignedEmpIds = Object.values(zoneAssignments).flat() as string[];
  const unassignedEmps = roster.filter(emp => !assignedEmpIds.includes(emp.id));
  const apiKey = useStore(state => state.apiKey);
  const playbookSettings = useStore(state => state.playbookSettings);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'
  const [isDeploying, setIsDeploying] = useState(false);
  const timeSlots = ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];

  const handleAutoDeploy = async () => {
    try {
      setIsDeploying(true);
      const toastId = toast.loading('Gemini is analyzing floor traffic and optimizing roster...');
      const assignments = await generateSmartZoning(roster, zones, apiKey, playbookSettings);
      
      if (onImportSchedule) {
        onImportSchedule({ zoneAssignments: assignments, breakSchedule: [] });
      }
      toast.success('Roster optimized and Auto-Deployed!', { id: toastId });
    } catch (err) {
      toast.error('Auto-Deploy failed. Check API key and network.');
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
            <Users size={20} /> Sales Floor Zone Assignments
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
            Zoning sheet scheduler: visually drag and drop associates or auto-deploy.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAutoDeploy}
            disabled={isDeploying}
            style={{
              background: 'rgba(0, 70, 190, 0.2)',
              color: 'var(--bby-blue)',
              border: '1px solid var(--bby-blue)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: isDeploying ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              marginRight: '1rem',
              boxShadow: '0 0 10px rgba(0, 70, 190, 0.3)'
            }}
          >
            <Zap size={16} /> {isDeploying ? 'Optimizing...' : 'Auto-Deploy (AI)'}
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--bby-blue)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <LayoutGrid size={16} /> Zones
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                background: viewMode === 'timeline' ? 'var(--bby-blue)' : 'transparent',
                color: viewMode === 'timeline' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <Clock size={16} /> Timeline
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <ZoneGrid 
          zones={zones}
          zoneAssignments={zoneAssignments}
          unassignedEmps={unassignedEmps}
          roster={roster}
          activeBreaks={activeBreaks}
          onAssignZone={onAssignZone}
          onUnassignZone={onUnassignZone}
          onToggleBreakState={onToggleBreakState}
        />
      ) : (
        <ZoneTimeline 
          timeSlots={timeSlots}
          assignedEmpIds={assignedEmpIds}
          roster={roster}
          zoneAssignments={zoneAssignments}
          activeBreaks={activeBreaks}
        />
      )}
    </div>
  );
}
