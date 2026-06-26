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
    <div className="action-sheet-overlay cursor-pointer" onClick={onClose} data-testid="action-sheet-overlay">
      <div 
        className="action-sheet-content glass-card cursor-default" 
        onClick={(e) => e.stopPropagation()}
        data-testid="action-sheet-content"
      >
        <div className="action-sheet-header">
          <h3 className="m-0 text-lg font-bold" data-testid="action-sheet-title">{title}</h3>
          <button onClick={onClose} className="icon-btn cursor-pointer bg-white-alpha-10 border-none text-white rounded-full p-xs flex-center" data-testid="action-sheet-close-btn">
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
