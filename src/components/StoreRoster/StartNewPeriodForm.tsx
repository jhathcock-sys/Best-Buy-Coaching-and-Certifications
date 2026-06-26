import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

interface StartNewPeriodFormProps {
  onClose: () => void;
  onCreatePeriod: (name: string, copyOption: string) => void;
}

export default function StartNewPeriodForm({
  onClose,
  onCreatePeriod
}: StartNewPeriodFormProps) {
  const [newPeriodName, setNewPeriodName] = useState('');
  const [copyOption, setCopyOption] = useState('roster-only');
  const [errorMsg, setErrorMsg] = useState('');
  
  const rosterHistory = useStore((state) => state.rosterHistory);

  const handleSubmit = () => {
    setErrorMsg('');
    const trimmedName = newPeriodName.trim();
    
    if (!trimmedName) {
      setErrorMsg('Please enter a valid period name!');
      return;
    }
    
    if (rosterHistory && rosterHistory[trimmedName]) {
      if (!window.confirm(`A period named "${trimmedName}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }
    
    onCreatePeriod(trimmedName, copyOption);
    setNewPeriodName('');
    onClose();
  };

  return (
    <div className="glass-card flex-column gap-md p-lg mb-lg border-bby-yellow" data-testid="start-new-period-form">
      <h3 className="font-heading text-lg text-white border-b border-white-10 pb-sm">
        Start New Performance Period / Month Archive
      </h3>
      
      <p className="text-sm text-secondary">
        Create a fresh performance tracker for a new month or week. The existing month's data will be safely archived and accessible anytime using the period switcher.
      </p>
      
      <div className="flex-row gap-lg flex-wrap align-end">
        <div className="form-group flex-1 min-w-[250px]">
          <label className="form-label text-xs">New Period Name:</label>
          <input 
            type="text" 
            className="form-control text-sm p-sm" 
            placeholder="e.g. June 2026, Week 23"
            value={newPeriodName}
            onChange={(e) => setNewPeriodName(e.target.value)}
            data-testid="new-period-name-input"
          />
        </div>
        
        <div className="form-group flex-1 min-w-[250px]">
          <label className="form-label text-xs">Data Cloning Option:</label>
          <select 
            className="form-control text-sm p-sm"
            value={copyOption}
            onChange={(e) => setCopyOption(e.target.value)}
            data-testid="data-cloning-select"
          >
            <option value="roster-only">Carry over associates only (Metrics set to 0 - Recommended)</option>
            <option value="roster-and-metrics">Carry over associates AND all current performance metrics</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="text-danger text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="flex-row gap-md justify-end mt-sm">
        <button 
          className="btn btn-secondary cursor-pointer p-sm px-md" 
          onClick={onClose}
          data-testid="cancel-new-period-btn"
        >
          Cancel
        </button>
        <button 
          className="btn cursor-pointer p-sm px-md bg-bby-yellow text-black font-medium" 
          onClick={handleSubmit}
          data-testid="submit-new-period-btn"
        >
          Start New Period & Switch
        </button>
      </div>
    </div>
  );
}
