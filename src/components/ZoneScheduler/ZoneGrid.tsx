import React from 'react';
import './ZoneGrid.css';

export default function ZoneGrid({
  zones,
  zoneAssignments,
  unassignedEmps,
  roster,
  activeBreaks,
  onAssignZone,
  onUnassignZone,
  onToggleBreakState
}) {
  return (
    <div className="zone-grid-container">
      {zones.map(zone => {
        const zoneEmps = zoneAssignments[zone] || [];

        return (
          <div key={zone} className="zone-card">
            <div className="zone-card-header">
              <h4 className="zone-card-title">{zone}</h4>
              <span className="tag-pill zone-tag">{zoneEmps.length} active</span>
            </div>

            {/* Assign Select */}
            <div className="form-group" style={{ margin: 0 }}>
              <select 
                className="form-control zone-select"
                value=""
                onChange={(e) => onAssignZone(zone, e.target.value)}
              >
                <option value="">+ Assign Associate...</option>
                {unassignedEmps.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                ))}
              </select>
            </div>

            {/* Assigned List */}
            <div className="zone-emp-list">
              {zoneEmps.length === 0 ? (
                <div className="zone-unstaffed">
                  Zone unstaffed
                </div>
              ) : (
                zoneEmps.map(empId => {
                  const emp = roster.find(e => e.id === empId);
                  if (!emp) return null;
                  
                  const isOnBreak = activeBreaks[empId]; // '15m' or '30m' or undefined

                  return (
                    <div 
                      key={empId} 
                      className={`zone-emp-card ${isOnBreak ? 'zone-emp-card-break' : 'zone-emp-card-active'}`}
                    >
                      <div className="zone-emp-header">
                        <span className={`zone-emp-name ${isOnBreak ? 'zone-emp-name-break' : ''}`}>{emp.name}</span>
                        <button 
                          className="zone-emp-remove"
                          onClick={() => onUnassignZone(zone, empId)}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="zone-emp-metrics">
                        <span>Membs: {emp.memberships}</span>
                        <span>CCs: {emp.creditCards}</span>
                        <span>GSP: {emp.warranty}%</span>
                      </div>

                      <div className="zone-emp-tags">
                        {emp.focus5 && (
                          <span className="zone-emp-focus">
                            🔥 FOCUS 5
                          </span>
                        )}
                        {emp.gap && emp.gap !== 'None' && (
                          <span className="zone-emp-gap">
                            ⚠️ Gap: {emp.gap.split(' & ')[0]}
                          </span>
                        )}
                      </div>

                      {/* Manual Break Controls */}
                      <div className="zone-break-controls">
                        {isOnBreak ? (
                          <div className="zone-break-active">
                            <span className="zone-break-text">
                              {isOnBreak === '15m' ? '☕ On 15m Break' : '🍔 On 30m Lunch'}
                            </span>
                            <button
                              className="zone-break-end-btn"
                              onClick={() => onToggleBreakState(empId, null)}
                            >
                              End Break
                            </button>
                          </div>
                        ) : (
                          <div className="zone-break-inactive">
                            <span className="zone-break-label">Send on:</span>
                            <div className="zone-break-btns">
                              <button
                                type="button"
                                className="zone-break-btn"
                                onClick={() => onToggleBreakState(empId, '15m')}
                              >
                                ☕ 15m
                              </button>
                              <button
                                type="button"
                                className="zone-break-btn"
                                onClick={() => onToggleBreakState(empId, '30m')}
                              >
                                🍔 30m
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
