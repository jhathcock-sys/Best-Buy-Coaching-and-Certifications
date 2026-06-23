import React from 'react';
import ImportScheduleRow from './ImportScheduleRow';

export default function ImportWizardStep2({
  reviews,
  setReviews,
  setParsedItems,
  roster,
  handleMatchChange,
  handleZoneChange,
  handleShiftTimeChange
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Validate & Map Floor Schedule</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', margin: '0.15rem 0 0 0' }}>Verify fuzzy matches to your roster. Red highlights indicate unmatched names that will be ignored unless overridden.</p>
        </div>
        <button 
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          onClick={() => { setParsedItems([]); setReviews([]); }}
        >
          Clear Import
        </button>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(16, 24, 48, 0.9)', borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>EXTRACTED NAME</th>
              <th style={{ padding: '0.75rem 1rem' }}>SHIFT TIME</th>
              <th style={{ padding: '0.75rem 1rem' }}>ROSTER MATCH</th>
              <th style={{ padding: '0.75rem 1rem' }}>ZONE ASSIGNMENT</th>
              <th style={{ padding: '0.75rem 1rem' }}>AUTO BREAKS</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => {
              return (
                <ImportScheduleRow 
                  key={rev.id}
                  rev={rev}
                  roster={roster}
                  handleShiftTimeChange={handleShiftTimeChange}
                  handleMatchChange={handleMatchChange}
                  handleZoneChange={handleZoneChange}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
