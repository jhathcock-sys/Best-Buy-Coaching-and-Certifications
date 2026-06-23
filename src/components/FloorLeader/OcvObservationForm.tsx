import React from 'react';

export default function OcvObservationForm({
  ocvEmpId, setOcvEmpId,
  getEmployeesOnShift, roster,
  ocvConnect, setOcvConnect,
  ocvRecommend, setOcvRecommend,
  ocvProtect, setOcvProtect,
  ocvClose, setOcvClose,
  ocvNotes, setOcvNotes,
  handleLogOcvObservation,
  ocvSuccessMsg
}: any) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
        ⏱️ 30-Second OCV Floor Observation
      </h3>
      <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Observe behavior on the fly. Score out of 4 benchmarks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Associate:</label>
          <select 
            className="form-control"
            style={{ background: '#0e1220', fontSize: '0.85rem', height: '38px', width: '100%' }}
            value={ocvEmpId}
            onChange={(e) => setOcvEmpId(e.target.value)}
          >
            <option value="">-- Select Associate --</option>
            {(() => {
              const onShift = getEmployeesOnShift();
              const offShift = roster.filter((emp: any) => !onShift.some((os: any) => os.id === emp.id));
              return (
                <>
                  {onShift.length > 0 && (
                    <optgroup label="Associates On Shift">
                      {onShift.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other Roster Associates">
                    {offShift.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                    ))}
                  </optgroup>
                </>
              );
            })()}
          </select>
        </div>

        {/* Checkbox Benchmarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
            <input 
              type="checkbox" 
              checked={ocvConnect} 
              onChange={(e) => setOcvConnect(e.target.checked)} 
              style={{ accentColor: 'var(--bby-blue)' }}
            />
            <span><strong>Connect</strong> (Greeting & discovery)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
            <input 
              type="checkbox" 
              checked={ocvRecommend} 
              onChange={(e) => setOcvRecommend(e.target.checked)} 
              style={{ accentColor: 'var(--bby-blue)' }}
            />
            <span><strong>Recommend</strong> (Solution matching)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
            <input 
              type="checkbox" 
              checked={ocvProtect} 
              onChange={(e) => setOcvProtect(e.target.checked)} 
              style={{ accentColor: 'var(--bby-blue)' }}
            />
            <span><strong>Protect</strong> (Membership & GSP attach)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', color: '#fff' }}>
            <input 
              type="checkbox" 
              checked={ocvClose} 
              onChange={(e) => setOcvClose(e.target.checked)} 
              style={{ accentColor: 'var(--bby-blue)' }}
            />
            <span><strong>Close</strong> (Financing card & survey ask)</span>
          </label>
        </div>

        <div className="form-group" style={{ marginBottom: '0.25rem' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Micro Observations / Notes:</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Quick coaching feedback note..."
            value={ocvNotes}
            onChange={(e) => setOcvNotes(e.target.value)}
            style={{ fontSize: '0.775rem', background: '#0e1220' }}
          />
        </div>

        <button 
          className="btn btn-primary"
          style={{ padding: '0.6rem', fontSize: '0.825rem', fontWeight: 700, width: '100%' }}
          onClick={handleLogOcvObservation}
          disabled={!ocvEmpId}
        >
          Log Floor Observation
        </button>

        {ocvSuccessMsg && (
          <div style={{ color: 'var(--success)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.25rem', fontWeight: 600 }}>
            ✅ OCV Observation logged successfully!
          </div>
        )}
      </div>
    </div>
  );
}
