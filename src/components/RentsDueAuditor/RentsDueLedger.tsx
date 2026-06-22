// @ts-nocheck
import React from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function RentsDueLedger({ 
  selectedPeriod,
  setSelectedPeriod,
  showNewPeriodInput,
  setShowNewPeriodInput,
  customPeriodName,
  setCustomPeriodName,
  snapshotDate,
  setSnapshotDate,
  rosterHistory,
  activePeriod,
  todayStr,
  fileName,
  errorMsg,
  isParsing,
  textInput,
  setTextInput,
  handleFileChange,
  fileInputRef,
  handleTextSubmit,
  parsedEmployees,
  setParsedEmployees,
  syncSuccess,
  setSyncSuccess,
  handleSyncToRoster,
  comparisonRoster
 }) {
  return (
    <>
        /* AUDIT RESULTS VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Revenue Rent Owed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gaps.rev > 0 ? 'var(--error)' : 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                ${gaps.rev.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Outstanding salesperson gap</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Apps Owed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gaps.apps > 0 ? 'var(--bby-yellow)' : 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                {gaps.apps} Apps
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Credit Card apps to reach standard</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Memberships Owed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gaps.pms > 0 ? 'var(--info)' : 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                {gaps.pms} Plus/Total
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Memberships to reach standard</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Rent Payer Rate</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                {Math.round((parsedEmployees.filter(e => e.rphStatus === 'on-track' && e.revenueStatus === 'on-track').length / parsedEmployees.length) * 100)}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Associates meeting all baseline Rents</span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setParsedEmployees(null)}>
                ← Reset & Upload New File
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn btn-accent" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={handleSyncToRoster}
              >
                Sync Metrics to Active Roster
              </button>
            </div>
          </div>

          {syncSuccess && (
            <div style={{ padding: '0.75rem 1.25rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', fontSize: '0.825rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Roster ledger values updated. All performance evaluations and sparklines will reflect these parsed values immediately.
            </div>
          )}

          {/* Ledger Table */}
          <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '1rem' }}>SALESPERSON</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>RPH ($/hr)</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>REVENUE ($)</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>CREDIT CARDS</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>MEMBERSHIPS</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>WARRANTY GSP</th>
                </tr>
              </thead>
              <tbody>
                {parsedEmployees.map((emp, idx) => {
                  const isPaidAll = emp.rphStatus === 'on-track' && emp.revenueStatus === 'on-track' && emp.appsStatus === 'on-track' && emp.membershipsStatus === 'on-track';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)', background: isPaidAll ? 'rgba(16, 185, 129, 0.02)' : 'transparent' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{emp.name}</span>
                          <span style={{ fontSize: '0.7rem', color: isPaidAll ? 'var(--success)' : 'var(--text-muted)' }}>
                            {isPaidAll ? 'Paid Full Rent' : 'Owes Rent'}
                          </span>
                        </div>
                      </td>
                      
                      {/* RPH */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>${emp.rph}</span>
                          <span style={{ fontSize: '0.7rem', color: emp.rphStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.rphStatus === 'on-track' ? 'Paid' : `Owed: $${emp.rphOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* REVENUE */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>${emp.revenue.toLocaleString()}</span>
                          <span style={{ fontSize: '0.7rem', color: emp.revenueStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.revenueStatus === 'on-track' ? 'Paid' : `Owed: $${emp.revenueOwed.toLocaleString()}`}
                          </span>
                        </div>
                      </td>

                      {/* APPS */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.apps} Apps</span>
                          <span style={{ fontSize: '0.7rem', color: emp.appsStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.appsStatus === 'on-track' ? 'Paid' : `Owed: ${emp.appsOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* MEMBERSHIPS */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.memberships} PMs</span>
                          <span style={{ fontSize: '0.7rem', color: emp.membershipsStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.membershipsStatus === 'on-track' ? 'Paid' : `Owed: ${emp.membershipsOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* WARRANTY */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.warranty}%</span>
                          <span style={{ fontSize: '0.7rem', color: emp.warrantyStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            Goal: {emp.warrantyGoal}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
    </>
  );
}
