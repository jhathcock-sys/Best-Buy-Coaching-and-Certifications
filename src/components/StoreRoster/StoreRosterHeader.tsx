import React from 'react';
import { Sliders, Search } from 'lucide-react';

interface StoreRosterHeaderProps {
  DEPARTMENTS: string[];
  activeDept: string;
  setActiveDept: (dept: string) => void;
  tempSearch: string;
  setTempSearch: (search: string) => void;
  toggles: {
    showNewPeriodForm: boolean;
    showAddForm: boolean;
    showViewSettings: boolean;
  };
  actions: {
    onToggleNewPeriod: () => void;
    onToggleAdd: () => void;
    onToggleImport: () => void;
    onToggleSettings: () => void;
  };
}

export default function StoreRosterHeader({
  DEPARTMENTS = [],
  activeDept,
  setActiveDept,
  tempSearch,
  setTempSearch,
  toggles,
  actions
}: StoreRosterHeaderProps) {
  return (
    <div className="glass-card flex-between align-center flex-wrap gap-xl px-lg py-md" data-testid="store-roster-header">
      {/* Department Filters */}
      <div className="flex gap-xs flex-wrap">
        {DEPARTMENTS.map(dept => (
          <button 
            key={dept} 
            className={`tag-pill cursor-pointer px-md py-sm text-xs ${activeDept === dept ? 'tag-pill-active' : ''}`}
            onClick={() => setActiveDept(dept)}
            data-testid={`dept-filter-${dept.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Action block with Toggle and Search */}
      <div className="flex-center gap-md flex-wrap justify-start">
        <button 
          className={`btn btn-secondary cursor-pointer px-md py-sm text-xs h-10 border-bby-yellow text-bby-yellow ${toggles.showNewPeriodForm ? 'bg-bby-yellow-alpha-05' : 'bg-transparent'}`} 
          onClick={actions.onToggleNewPeriod}
          data-testid="toggle-new-period-btn"
        >
          {toggles.showNewPeriodForm ? 'Close Archive Form' : '+ New Month Archive'}
        </button>
        
        <button 
          className="btn btn-accent cursor-pointer px-md py-sm text-xs text-black h-10" 
          onClick={actions.onToggleAdd}
          data-testid="toggle-add-associate-btn"
        >
          {toggles.showAddForm ? 'Close Associate Form' : '+ Add Associate'}
        </button>

        <button 
          className="btn btn-secondary cursor-pointer px-md py-sm text-xs h-10 border-text-muted" 
          onClick={actions.onToggleImport}
          data-testid="toggle-import-btn"
        >
          Import CSV
        </button>

        <button 
          className={`btn btn-secondary cursor-pointer flex-center gap-xs px-md py-sm text-xs h-10 border-text-muted ${toggles.showViewSettings ? 'bg-white-alpha-05' : 'bg-transparent'}`} 
          onClick={actions.onToggleSettings}
          data-testid="toggle-view-settings-btn"
        >
          <Sliders size={14} /> View Options
        </button>

        <div className="relative w-48">
          <input 
            type="text" 
            className="form-control pl-10 pr-md h-10 text-sm w-full" 
            placeholder="Search by name..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            data-testid="roster-search-input"
          />
          <Search size={16} className="absolute top-3 left-3 text-secondary" />
        </div>
      </div>
    </div>
  );
}
