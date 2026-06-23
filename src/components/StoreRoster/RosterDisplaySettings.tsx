import React from 'react';
import { Sliders } from 'lucide-react';

export default function RosterDisplaySettings({
  showViewSettings,
  isDense, setIsDense,
  visibleCols, setVisibleCols
}: any) {
  if (!showViewSettings) return null;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 2rem', border: '1px solid rgba(255, 255, 255, 0.08)', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
          <Sliders size={16} color="var(--bby-blue)" /> Roster Display Settings
        </h4>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <input 
            type="checkbox" 
            checked={isDense} 
            onChange={(e) => setIsDense(e.target.checked)} 
            style={{ cursor: 'pointer' }}
          />
          <span>Enable Dense Grid Layout</span>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
        {Object.keys(visibleCols).map(col => {
          const label = 
            col === 'hours' ? 'Hours' :
            col === 'dept' ? 'Department' :
            col === 'memberships' ? 'Memberships' :
            col === 'creditCards' ? 'BBY Cards' :
            col === 'warranty' ? 'GSP/Warranty' :
            col === 'surveys' ? '5 Star Surveys' :
            col === 'rph' ? 'RPH Index' :
            col === 'basket' ? 'Basket' :
            col === 'attach' ? 'Dept Attach' :
            col === 'status' ? 'Status' : col;

          return (
            <label key={col} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#fff' }}>
              <input 
                type="checkbox" 
                checked={visibleCols[col]} 
                onChange={(e) => setVisibleCols({ ...visibleCols, [col]: e.target.checked })} 
                style={{ cursor: 'pointer' }}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
