import React from 'react';
import { X } from 'lucide-react';

interface StandardModalTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function StandardModalTemplate({ isOpen, onClose, title, children, icon }: StandardModalTemplateProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay flex-center" onClick={onClose}>
      <div 
        className="modal-content bg-surface rounded-xl p-lg" 
        onClick={(e) => e.stopPropagation()} 
        style={{ border: '1px solid var(--border-glass)', maxWidth: '500px', width: '90%' }}
      >
        <div className="flex-row justify-between align-center mb-md pb-sm" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <h3 className="text-lg flex-row align-center gap-sm" style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>
            {icon && <span className="text-bby-yellow">{icon}</span>}
            {title}
          </h3>
          <button 
            className="btn btn-icon text-error hover-scale" 
            onClick={onClose}
            aria-label="Close Modal"
            style={{ transition: 'var(--transition-normal)' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body text-base" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </div>
        
        <div className="flex-row justify-end gap-md mt-lg pt-md" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ transition: 'var(--transition-normal)' }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => alert('Action confirmed!')} style={{ transition: 'var(--transition-normal)' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
