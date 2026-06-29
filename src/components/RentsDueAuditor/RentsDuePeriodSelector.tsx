import React, { useState } from 'react';
import { Employee } from '../../types';

interface RentsDuePeriodSelectorProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  activePeriod: string;
  rosterHistoryKeys: string[];
  comparisonRosterLength: number;
  snapshotDate: string;
  setSnapshotDate: (date: string) => void;
}

export default function RentsDuePeriodSelector({
  selectedPeriod,
  setSelectedPeriod,
  activePeriod,
  rosterHistoryKeys,
  comparisonRosterLength,
  snapshotDate,
  setSnapshotDate
}: RentsDuePeriodSelectorProps) {
  const [showNewPeriodInput, setShowNewPeriodInput] = useState(false);
  const [customPeriodName, setCustomPeriodName] = useState('');

  return (
    <>
      <div className="glass-card flex-row align-center gap-md flex-wrap p-lg bg-[rgba(255,255,255,0.015)]">
        <div className="flex-column gap-xs">
          <label className="text-xs font-bold text-secondary">Target Ledger Period (Month):</label>
          {!showNewPeriodInput ? (
            <div className="flex-row align-center gap-sm">
              <select
                className="form-control cursor-pointer bg-obsidian border border-glass rounded-md px-md py-[0.45rem] text-[0.85rem] text-white w-[210px]"
                value={selectedPeriod}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewPeriodInput(true);
                  } else {
                    setSelectedPeriod(e.target.value);
                  }
                }}
                data-testid="target-period-select"
              >
                {rosterHistoryKeys.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__new__">+ Create New Month...</option>
              </select>
            </div>
          ) : (
            <div className="flex-row align-center gap-sm">
              <input
                type="text"
                className="form-control bg-obsidian border border-glass rounded-md px-md py-[0.45rem] text-[0.85rem] text-white w-[210px]"
                placeholder="e.g. April 2026"
                value={customPeriodName}
                onChange={(e) => setCustomPeriodName(e.target.value)}
                data-testid="custom-period-input"
              />
              <button
                type="button"
                className="btn btn-primary cursor-pointer text-xs px-[0.85rem] py-[0.45rem]"
                onClick={() => {
                  if (customPeriodName.trim()) {
                    const cleaned = customPeriodName.trim();
                    setSelectedPeriod(cleaned);
                    setShowNewPeriodInput(false);
                  } else {
                    alert("Please enter a valid period name.");
                  }
                }}
                data-testid="use-custom-period-btn"
              >
                Use
              </button>
              <button
                type="button"
                className="btn btn-secondary cursor-pointer text-xs px-[0.85rem] py-[0.45rem]"
                onClick={() => {
                  setShowNewPeriodInput(false);
                  setSelectedPeriod(activePeriod);
                }}
                data-testid="cancel-custom-period-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-muted flex-1 leading-relaxed">
          Uploading and parsing will apply to the performance ledger of <strong className="text-bby-yellow">{selectedPeriod}</strong>. 
          {comparisonRosterLength > 0 ? (
            <span> This period has <strong>{comparisonRosterLength}</strong> existing team members. Syncing will merge the parsed metrics.</span>
          ) : (
            <span> This is a new period. Syncing will automatically initialize this month's roster in the database with the parsed data.</span>
          )}
        </div>
      </div>
      
      {/* Snapshot Date Config */}
      <div className="glass-card flex-row align-center gap-md p-md mb-xl">
        <span className="text-sm font-semibold text-secondary">Log Snapshot As:</span>
        <input 
          type="date"
          className="form-input px-sm py-[0.4rem] text-[0.85rem] max-w-[200px]"
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
          data-testid="snapshot-date-input"
        />
        <span className="text-xs text-muted">This sets the date for Trend Reporting aggregation.</span>
      </div>
    </>
  );
}
