import React from 'react';
import { X } from 'lucide-react';
import { calculateCVI } from '../../store/cviHelper';

export default function AssociateProfileHeader({
  employee,
  rosterHistory,
  activePeriod,
  onClose
}: any) {
  return (
    <div style={{ 
      padding: '1.25rem 1.5rem', 
      borderBottom: '1px solid var(--border-glass)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: 'linear-gradient(90deg, rgba(0, 70, 190, 0.15), transparent)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.35rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            {employee.name}
          </h3>
          <span className="tag-pill tag-pill-active" style={{ fontSize: '0.75rem', background: 'var(--bby-blue)' }}>
            {employee.dept}
          </span>
          {employee.focus5 && (
            <span style={{ 
              fontSize: '0.7rem', 
              color: '#fff', 
              background: 'var(--error)', 
              fontWeight: 800, 
              padding: '0.15rem 0.4rem', 
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              🔥 FOCUS 5
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Associate Profile & Coaching Dashboard
          </p>
          {employee.employeeNumber && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                ID: {employee.employeeNumber}
              </span>
            </>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
          {(() => {
            const cvi = calculateCVI(employee, rosterHistory, activePeriod);
            let badgeBg = 'rgba(255, 255, 255, 0.05)';
            let badgeColor = 'var(--text-secondary)';
            let badgeBorder = 'rgba(255, 255, 255, 0.1)';
            let cviIcon = '▶';
            if (cvi.includes('Accelerating')) {
              badgeBg = 'rgba(16, 185, 129, 0.15)';
              badgeColor = 'var(--success)';
              badgeBorder = 'rgba(16, 185, 129, 0.3)';
              cviIcon = '▲';
            } else if (cvi.includes('Needs Review')) {
              badgeBg = 'rgba(239, 68, 68, 0.15)';
              badgeColor = 'var(--error)';
              badgeBorder = 'rgba(239, 68, 68, 0.3)';
              cviIcon = '▼';
            } else if (cvi.includes('Neutral')) {
              badgeBg = 'rgba(245, 158, 11, 0.15)';
              badgeColor = 'var(--warning)';
              badgeBorder = 'rgba(245, 158, 11, 0.3)';
              cviIcon = '▶';
            }
            return (
              <span 
                title="Coaching Velocity Index (Month over Month growth velocity)"
                style={{ 
                  fontSize: '0.7rem', 
                  background: badgeBg, 
                  border: `1px solid ${badgeBorder}`, 
                  color: badgeColor, 
                  padding: '0.15rem 0.45rem', 
                  borderRadius: '6px', 
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                {cviIcon} CVI: {cvi}
              </span>
            );
          })()}
        </div>
      </div>
      <button 
        type="button"
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }} 
        onClick={onClose}
      >
        <X size={22} />
      </button>
    </div>
  );
}
