// @ts-nocheck
import React from 'react';
import { Clock } from 'lucide-react';

export default function HistoricalShiftsArchive({ shifts }: any) {
  return (
    <>
      {/* HISTORICAL SHIFTS LIST */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--info)" /> Past Floor Leading Shifts Archive
        </h3>
        
        {shifts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1.5px dashed var(--border-glass)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No archived floor-leading shifts logged yet. Complete your first shift above.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                  <th style={{ padding: '0.75rem 1rem' }}>FLOOR LEADER</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TYPE</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>HOURS</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TOTAL REVENUE</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TOTAL PMs</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>TOTAL APPs</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ON-TRACK RATE</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>{shift.date}</td>
                    <td style={{ padding: '1rem', color: '#fff' }}>{shift.leaderName}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {shift.isWeekend ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--bby-yellow)', background: 'rgba(253, 216, 53, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(253, 216, 53, 0.15)' }}>Weekend</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--bby-blue)', background: 'rgba(0, 70, 190, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(0, 70, 190, 0.15)' }}>Weekday</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#fff' }}>{shift.totalHours} hrs</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--info)', fontWeight: 700 }}>
                      ${shift.totalRevenue ? shift.totalRevenue.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$0.00'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#fff', fontWeight: 700 }}>{shift.totalPms}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#fff', fontWeight: 700 }}>{shift.totalApps}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        fontWeight: 700,
                        color: shift.onTrackRatio >= 70 ? 'var(--success)' : shift.onTrackRatio >= 40 ? 'var(--bby-yellow)' : 'var(--error)' 
                      }}>
                        {shift.onTrackRatio}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this archived shift?')) {
                            onDeleteShift(shift.id);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
                        title="Delete Shift History"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
