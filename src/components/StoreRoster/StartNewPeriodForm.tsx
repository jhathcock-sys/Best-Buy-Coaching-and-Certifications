import React from 'react';

export default function StartNewPeriodForm({
  showNewPeriodForm, setShowNewPeriodForm,
  newPeriodName, setNewPeriodName,
  copyOption, setCopyOption,
  rosterHistory, onCreatePeriod
}: any) {
  if (!showNewPeriodForm) return null;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1.5px solid var(--bby-yellow)', padding: '1.5rem 2rem', animation: 'fadeIn 0.3s ease' }}>
      <h3 style={{ fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
        Start New Performance Period / Month Archive
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
        Create a fresh performance tracker for a new month or week. The existing month's data will be safely archived and accessible anytime using the period switcher.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>New Period Name:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. June 2026, Week 23"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            value={newPeriodName}
            onChange={(e) => setNewPeriodName(e.target.value)}
          />
        </div>
        
        <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Data Cloning Option:</label>
          <select 
            className="form-control"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            value={copyOption}
            onChange={(e) => setCopyOption(e.target.value)}
          >
            <option value="roster-only">Carry over associates only (Metrics set to 0 - Recommended for new months)</option>
            <option value="roster-and-metrics">Carry over associates AND all current performance metrics</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowNewPeriodForm(false)}>
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-yellow)', color: '#000' }} 
          onClick={() => {
            if (!newPeriodName.trim()) {
              alert("Please enter a valid period name!");
              return;
            }
            if (rosterHistory && rosterHistory[newPeriodName.trim()]) {
              if (!window.confirm(`A period named "${newPeriodName.trim()}" already exists. Do you want to overwrite it?`)) {
                return;
              }
            }
            if (onCreatePeriod) {
              onCreatePeriod(newPeriodName.trim(), copyOption);
            }
            setNewPeriodName('');
            setShowNewPeriodForm(false);
          }}
        >
          Start New Period & Switch
        </button>
      </div>
    </div>
  );
}
