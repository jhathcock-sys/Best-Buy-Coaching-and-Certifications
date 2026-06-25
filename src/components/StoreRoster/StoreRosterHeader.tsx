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
    <div className="glass-card flex-between align-center flex-wrap gap-xl px-2rem py-1-25rem">
      {/* Department Filters */}
      <div className="flex gap-xs flex-wrap">
        {DEPARTMENTS.map(dept => (
          <button 
            key={dept} 
            className={`tag-pill cursor-pointer px-md py-sm-md text-xs ${activeDept === dept ? 'tag-pill-active' : ''}`}
            onClick={() => setActiveDept(dept)}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Action block with Toggle and Search */}
      <div className="flex-center gap-md flex-wrap justify-start">
        <button 
          className={`btn btn-secondary px-md py-sm-md text-xs h-38px border-bby-yellow text-bby-yellow ${showNewPeriodForm ? 'bg-bby-yellow-alpha-05' : 'bg-transparent'}`} 
          onClick={() => {
            setShowNewPeriodForm(!showNewPeriodForm);
            setShowAddForm(false);
          }}
        >
          {showNewPeriodForm ? 'Close Archive Form' : '+ New Month Archive'}
        </button>
        
        <button 
          className="btn btn-accent px-md py-sm-md text-xs text-black h-38px" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowNewPeriodForm(false);
          }}
        >
          {showAddForm ? 'Close Associate Form' : '+ Add Associate'}
        </button>

        <button 
          className="btn btn-secondary px-md py-sm-md text-xs h-38px border-text-muted" 
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
          className={`btn btn-secondary flex-center gap-xs px-md py-sm-md text-xs h-38px border-text-muted ${showViewSettings ? 'bg-white-alpha-05' : 'bg-transparent'}`} 
          onClick={() => {
            setShowViewSettings(!showViewSettings);
            setShowAddForm(false);
            setShowNewPeriodForm(false);
          }}
        >
          <Sliders size={14} /> View Options
        </button>

        <div className="relative w-200px">
          <input 
            type="text" 
            className="form-control pl-2-5rem pr-md h-38px text-sm" 
            placeholder="Search by name..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" className="absolute top-11px left-0-85rem" />
        </div>
      </div>
    </div>
  );
}
