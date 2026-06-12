import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, BarChart3, AlertCircle, FileText, CheckCircle2, Star, DollarSign, Award, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { runStoreShiftSimulationGemini } from '../services/ai';

export default function ShiftSimulator({ roster }) {
  const { apiKey, playbookSettings } = useApp();
  
  // Placement State
  const [placements, setPlacements] = useState({
    'Computing': '',
    'Mobile': '',
    'Home Theatre': '',
    'Front End': ''
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSelectEmployee = (zone, id) => {
    setPlacements(prev => ({
      ...prev,
      [zone]: id
    }));
  };

  const handleRunSimulation = async () => {
    // Collect roster profiles that are selected
    const selectedRosterData = roster.map(emp => ({
      name: emp.name,
      rph: emp.rph,
      memberships: emp.memberships,
      creditCards: emp.creditCards,
      warranty: emp.warranty,
      surveys: emp.surveys,
      dept: emp.dept
    }));

    // Construct placement name mappings
    const placementMappings = {};
    Object.keys(placements).forEach(zone => {
      const emp = roster.find(e => e.id === placements[zone]);
      placementMappings[zone] = emp ? emp.name : 'Unassigned (General Staff)';
    });

    setIsSimulating(true);

    try {
      const result = await runStoreShiftSimulationGemini(apiKey, selectedRosterData, placementMappings, playbookSettings);
      setSimulationResult(result);
    } catch (e) {
      console.error(e);
      alert('An error occurred during shift simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  const isAnyAssigned = Object.values(placements).some(v => !!v);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
      
      {/* Left Column: Staff Assignments Board */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users color="var(--bby-blue)" size={22} /> Shift Staffing Board
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            Assign your roster blue shirts to floor zones. Running the shift will simulate customer traffic and score your placement decisions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {['Computing', 'Home Theatre', 'Mobile', 'Front End'].map(zone => {
            const assignedEmpId = placements[zone];
            const assignedEmp = roster.find(e => e.id === assignedEmpId);

            return (
              <div 
                key={zone} 
                style={{ 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{zone} Zone</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: assignedEmp ? '#fff' : 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {assignedEmp ? assignedEmp.name : 'Unassigned (General)'}
                  </div>
                  {assignedEmp && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Focus Gap: {assignedEmp.gap || 'None'}
                    </span>
                  )}
                </div>

                <select 
                  className="form-control" 
                  style={{ width: '150px', height: '34px', padding: '0 0.5rem', fontSize: '0.8rem' }}
                  value={assignedEmpId}
                  onChange={(e) => handleSelectEmployee(zone, e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {roster.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <button 
          className="btn btn-accent" 
          style={{ width: '100%', color: '#000' }} 
          onClick={handleRunSimulation} 
          disabled={isSimulating || !isAnyAssigned}
        >
          {isSimulating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Simulating 8-Hour Shift...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Play size={16} fill="#000" /> Start Shift Simulation
            </div>
          )}
        </button>
      </div>

      {/* Right Column: Timeline Events & Scorecard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {isSimulating && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem', justifyContent: 'center' }}>
            <div className="skeleton-pulse" style={{ height: '24px', width: '40%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={24} className="typing-dots" style={{ color: 'var(--bby-yellow)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Simulating employee selling interactions hour-by-hour...</span>
            </div>
          </div>
        )}

        {!isSimulating && !simulationResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Position your team members on the Staffing Board and launch the simulation to generate shift results.</p>
          </div>
        )}

        {!isSimulating && simulationResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Scorecard Card */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--bby-yellow)" /> Shift Scorecard
                </h3>
                <span className="tag-pill" style={{
                  background: simulationResult.scorecard.placementScore >= 80 ? 'var(--success-glow)' : 'var(--warning-glow)',
                  color: simulationResult.scorecard.placementScore >= 80 ? 'var(--success)' : 'var(--warning)',
                  borderColor: simulationResult.scorecard.placementScore >= 80 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  Placement Score: {simulationResult.scorecard.placementScore}%
                </span>
              </div>

              {/* Grid Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Estimated Revenue</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success)' }}>
                    ${simulationResult.scorecard.revenue.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Goal: ${simulationResult.scorecard.revenueGoal.toLocaleString()}</span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>CSAT Survey Rating</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--bby-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    {simulationResult.scorecard.csat} <Star size={14} fill="var(--bby-yellow)" color="var(--bby-yellow)" />
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Target: 4.8★</span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Paid Memberships</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    {simulationResult.scorecard.memberships}
                  </span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Best Buy Cards</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    {simulationResult.scorecard.creditCards}
                  </span>
                </div>
              </div>

              {/* Placement Review Text */}
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>GM Placement Audit:</strong> {simulationResult.scorecard.placementReview}
              </div>
            </div>

            {/* Shift Timeline Logs */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--info)" /> Shift Chronological Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {simulationResult.shiftLogs.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--border-glass)', paddingLeft: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bby-yellow)' }}>{log.hour} — {log.zone}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.impact}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#fff', margin: '0.15rem 0' }}>{log.event}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        <strong>Staffing Impact:</strong> {log.advisorResponse}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
