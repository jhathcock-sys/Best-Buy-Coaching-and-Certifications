import React from 'react';
import { X } from 'lucide-react';
import { calculateCVI } from '../../store/cviHelper';
import { Employee } from '../../types';

interface AssociateProfileHeaderProps {
  employee: Employee;
  rosterHistory: Record<string, Record<string, Employee>>;
  activePeriod: string;
  onClose: () => void;
}

export default function AssociateProfileHeader({
  employee,
  rosterHistory,
  activePeriod,
  onClose
}: AssociateProfileHeaderProps) {
  if (!employee) return <div data-testid="profile-header-loading" className="p-lg text-center text-muted">Loading...</div>;

  return (
    <div data-testid="associate-profile-header" className="flex-between align-center border-bottom profile-header-bg p-lg">
      <div>
        <div className="flex-row align-center gap-sm flex-wrap">
          <h3 className="text-xl text-white font-heading m-0">
            {employee.name}
          </h3>
          <span className="tag-pill tag-pill-active text-xs bg-bby-blue">
            {employee.dept}
          </span>
          {employee.focus5 && (
            <span data-testid="profile-header-focus5-badge" className="text-xxs text-white focus5-badge font-extrabold flex-row align-center gap-xs rounded-sm p-xs">
              🔥 FOCUS 5
            </span>
          )}
        </div>
        <div className="flex-row align-center gap-sm mt-xs flex-wrap">
          <p className="text-xs text-secondary m-0">
            Associate Profile & Coaching Dashboard
          </p>
          {employee.employeeNumber && (
            <>
              <span className="text-xs text-muted">•</span>
              <span className="text-xs text-secondary font-mono tracking-wider">
                ID: {employee.employeeNumber}
              </span>
            </>
          )}
          <span className="text-xs text-muted">•</span>
          {(() => {
            const rawCvi = calculateCVI(employee, rosterHistory, activePeriod);
            const cvi = String(rawCvi || '');
            let badgeClasses = 'bg-white-alpha-05 text-secondary border-glass-strong';
            let cviIcon = '▶';
            if (cvi.includes('Accelerating')) {
              badgeClasses = 'bg-success-alpha-15 text-success border-success-alpha-20';
              cviIcon = '▲';
            } else if (cvi.includes('Needs Review')) {
              badgeClasses = 'bg-error-alpha-20 text-error border-error-alpha-20';
              cviIcon = '▼';
            } else if (cvi.includes('Neutral')) {
              badgeClasses = 'bg-warning-alpha text-warning border-warning-alpha-20';
              cviIcon = '▶';
            }
            return (
              <span 
                data-testid="profile-header-cvi-badge"
                title="Coaching Velocity Index (Month over Month growth velocity)"
                className={`text-xxs font-bold flex-row align-center gap-xs rounded-lg p-xs ${badgeClasses}`}
              >
                {cviIcon} CVI: {cvi}
              </span>
            );
          })()}
        </div>
      </div>
      <button 
        type="button"
        data-testid="profile-header-close-btn"
        className="btn-link text-muted bg-transparent border-none cursor-pointer p-xs"
        onClick={onClose}
      >
        <X size={22} />
      </button>
    </div>
  );
}
