import React from 'react';
import { Trophy } from 'lucide-react';

export default function QuickLogWinForm({
  selectedEmpId, setSelectedEmpId,
  getEmployeesOnShift, roster,
  winType, setWinType,
  handleLogFloorWin
}: any) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
        <Trophy size={18} color="var(--bby-yellow)" /> Quick Log Floor Win
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Associate:</label>
          <select 
            className="form-control"
            style={{ background: '#0e1220', fontSize: '0.85rem', height: '38px' }}
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
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

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Win Type:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn"
              style={{
                padding: '0.55rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: winType === 'pm' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.01)',
                borderColor: winType === 'pm' ? 'var(--success)' : 'var(--border-glass)',
                color: winType === 'pm' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => setWinType('pm')}
            >
              Membership (PM) 🚀
            </button>
            <button
              type="button"
              className="btn"
              style={{
                padding: '0.55rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: winType === 'app' ? 'rgba(242, 169, 0, 0.15)' : 'rgba(255,255,255,0.01)',
                borderColor: winType === 'app' ? 'var(--bby-yellow)' : 'var(--border-glass)',
                color: winType === 'app' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => setWinType('app')}
            >
              Best Buy Card 💳
            </button>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          style={{ padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, width: '100%', marginTop: '0.25rem' }}
          onClick={handleLogFloorWin}
          disabled={!selectedEmpId}
        >
          Log Floor Win! 🚀
        </button>
      </div>
    </div>
  );
}
