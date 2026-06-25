import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './ActionSheet.css';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ActionSheet({ isOpen, onClose, title, children }: ActionSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="action-sheet-overlay" onClick={onClose}>
      <div 
        className="action-sheet-content glass-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="action-sheet-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="icon-btn clickable bg-white-alpha-10 border-none text-white rounded-full p-xs flex-center">
            <X size={18} />
          </button>
        </div>
        <div className="action-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
}
