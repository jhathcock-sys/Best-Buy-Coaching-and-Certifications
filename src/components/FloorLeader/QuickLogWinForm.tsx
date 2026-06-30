import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { Employee } from '../../types';

export interface QuickLogWinFormProps {
  selectedEmpId: string;
  setSelectedEmpId: (id: string) => void;
  getEmployeesOnShift: () => Employee[];
  roster: Employee[];
  winType: 'pm' | 'app';
  setWinType: (type: 'pm' | 'app') => void;
  handleLogFloorWin: () => Promise<void> | void;
}

export default function QuickLogWinForm({
  selectedEmpId, setSelectedEmpId,
  getEmployeesOnShift, roster,
  winType, setWinType,
  handleLogFloorWin
}: QuickLogWinFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeRoster = roster || [];
  const safeOnShift = getEmployeesOnShift() || [];

  const handleLogClick = async () => {
    if (!selectedEmpId) return;
    setIsSubmitting(true);
    try {
      await handleLogFloorWin();
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="glass-card p-lg" data-testid="win-form-container">
      <h3 className="font-bold mb-md flex-center justify-start gap-xs text-white text-lg">
        <Trophy size={18} color="var(--bby-yellow)" /> Quick Log Floor Win
      </h3>
      <div className="flex-column gap-md">
        <div className="form-group">
          <label className="form-label text-sm text-secondary">Select Associate:</label>
          <select 
            className="form-control"
            style={{ background: 'var(--bg-obsidian)', fontSize: '0.85rem', height: '38px' }}
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            data-testid="win-form-select"
            disabled={isSubmitting}
          >
            <option value="">-- Select Associate --</option>
            {(() => {
              const offShift = safeRoster.filter((emp: Employee) => !safeOnShift.some((os: Employee) => os.id === emp.id));
              return (
                <>
                  {safeOnShift.length > 0 && (
                    <optgroup label="Associates On Shift">
                      {safeOnShift.map((emp: Employee) => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                      ))}
                    </optgroup>
                  )}
                  {offShift.length > 0 && (
                    <optgroup label="Other Roster Associates">
                      {offShift.map((emp: Employee) => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                      ))}
                    </optgroup>
                  )}
                </>
              );
            })()}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label text-sm text-secondary">Win Type:</label>
          <div className="flex-center gap-sm mt-xs w-full">
            <button
              type="button"
              className="btn flex-1 cursor-pointer font-semibold"
              style={{
                padding: '0.55rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: `1px solid ${winType === 'pm' ? 'var(--success)' : 'var(--border-glass)'}`,
                background: winType === 'pm' ? 'var(--success-alpha-15)' : 'var(--white-alpha-05)',
                color: winType === 'pm' ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => setWinType('pm')}
              data-testid="win-form-pm"
              disabled={isSubmitting}
            >
              Membership (PM) 🚀
            </button>
            <button
              type="button"
              className="btn flex-1 cursor-pointer font-semibold"
              style={{
                padding: '0.55rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: `1px solid ${winType === 'app' ? 'var(--bby-yellow)' : 'var(--border-glass)'}`,
                background: winType === 'app' ? 'rgba(242, 169, 0, 0.15)' : 'var(--white-alpha-05)',
                color: winType === 'app' ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => setWinType('app')}
              data-testid="win-form-app"
              disabled={isSubmitting}
            >
              Best Buy Card 💳
            </button>
          </div>
        </div>

        <button 
          className="btn btn-primary mt-xs w-full font-bold"
          style={{ padding: '0.65rem', fontSize: '0.85rem' }}
          onClick={handleLogClick}
          disabled={!selectedEmpId || isSubmitting}
          data-testid="win-form-submit"
        >
          {isSubmitting ? 'Logging...' : 'Log Floor Win! 🚀'}
        </button>
      </div>
    </div>
  );
}
