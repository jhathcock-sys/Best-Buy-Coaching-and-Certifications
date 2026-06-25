import React from 'react';

export default function ZoneTimeline({
  timeSlots,
  assignedEmpIds,
  roster,
  zoneAssignments,
  activeBreaks
}) {
  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '16px', overflowX: 'auto' }}>
      <div style={{ minWidth: '800px' }}>
        {/* Timeline Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(9, 1fr)', borderBottom: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Associate</div>
          {timeSlots.map(time => (
            <div key={time} style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              {time}
            </div>
          ))}
        </div>
        
        {/* Timeline Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {assignedEmpIds.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No associates currently scheduled in zones.</div>
          ) : (
            assignedEmpIds.map(empId => {
              const emp = (roster || []).find(e => e.id === empId);
              if (!emp) return null;
              
              // Find what zone they are in
              let currentZone = 'Unassigned';
              const safeZoneAssignments = zoneAssignments || {};
              Object.keys(safeZoneAssignments).forEach(z => {
                if ((safeZoneAssignments[z] || []).includes(empId)) currentZone = z;
              });

              const isOnBreak = (activeBreaks || {})[empId]; // '15m', '30m', or null
              
              return (
                <div key={empId} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRight: '1px solid var(--border-glass)' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{emp.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--bby-blue)' }}>{currentZone}</span>
                  </div>
                  
                  {/* Shift Block Area */}
                  <div style={{ position: 'relative', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    {/* Background Grid Lines */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', pointerEvents: 'none' }}>
                      {timeSlots.map((_, i) => (
                        <div key={i} style={{ borderLeft: '1px dashed rgba(255,255,255,0.05)' }} />
                      ))}
                    </div>
                    
                    {/* Mock Shift Block (Spanning entire 10-6 range for demo) */}
                    <div style={{ 
                      width: '100%', 
                      height: '36px', 
                      background: isOnBreak ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 70, 190, 0.2)', 
                      border: `1px solid ${isOnBreak ? 'var(--error)' : 'var(--bby-blue)'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 1rem',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {isOnBreak ? (
                        <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {isOnBreak === '15m' ? '☕ 15m Break Active' : '🍔 30m Lunch Active'}
                        </span>
                      ) : (
                        <span style={{ color: '#fff', fontSize: '0.75rem' }}>Active Shift • {emp.dept}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
