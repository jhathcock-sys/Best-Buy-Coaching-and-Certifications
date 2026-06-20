import React from 'react';
import { Sliders, Search } from 'lucide-react';

export default function StoreRosterHeader({
  DEPARTMENTS,
  activeDept,
  setActiveDept,
  tempSearch,
  setTempSearch,
  showNewPeriodForm,
  setShowNewPeriodForm,
  showAddForm,
  setShowAddForm,
  showImporter,
  setShowImporter,
  showViewSettings,
  setShowViewSettings
}) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
      {/* Department Filters */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {DEPARTMENTS.map(dept => (
          <button 
            key={dept} 
            className={`tag-pill ${activeDept === dept ? 'tag-pill-active' : ''}`}
            style={{ cursor: 'pointer', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setActiveDept(dept)}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Action block with Toggle and Search */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-secondary" 
          style={{ 
            padding: '0.55rem 1rem', 
            fontSize: '0.8rem', 
            height: '38px', 
            borderColor: 'var(--bby-yellow)', 
            color: 'var(--bby-yellow)',
            background: showNewPeriodForm ? 'rgba(255, 230, 0, 0.05)' : 'transparent'
          }} 
          onClick={() => {
            setShowNewPeriodForm(!showNewPeriodForm);
            setShowAddForm(false);
          }}
        >
          {showNewPeriodForm ? 'Close Archive Form' : '+ New Month Archive'}
        </button>
        
        <button 
          className="btn btn-accent" 
          style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', color: '#000', height: '38px' }} 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowNewPeriodForm(false);
          }}
        >
          {showAddForm ? 'Close Associate Form' : '+ Add Associate'}
        </button>

        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', height: '38px', borderColor: 'var(--text-muted)' }} 
          onClick={() => {
            setShowImporter(true);
            setShowAddForm(false);
            setShowNewPeriodForm(false);
            setShowViewSettings(false);
          }}
        >
          Import CSV
        </button>

        <button 
          className="btn btn-secondary" 
          style={{ 
            padding: '0.55rem 1rem', 
            fontSize: '0.8rem', 
            height: '38px', 
            borderColor: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: showViewSettings ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
          }} 
          onClick={() => {
            setShowViewSettings(!showViewSettings);
            setShowAddForm(false);
            setShowNewPeriodForm(false);
          }}
        >
          <Sliders size={14} /> View Options
        </button>

        <div style={{ position: 'relative', width: '200px' }}>
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search by name..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '11px', left: '0.85rem' }} />
        </div>
      </div>
    </div>
  );
}
