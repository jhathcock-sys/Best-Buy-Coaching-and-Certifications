import React from 'react';
import { X, Users } from 'lucide-react';
import { EmployeeSchema } from '../schemas';
import { z } from 'zod';
import AddEmployeeForm from './AddEmployeeForm';

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: z.infer<typeof EmployeeSchema>) => void | Promise<void>;
}

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee }: AddEmployeeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay cursor-pointer" onClick={onClose} data-testid="add-employee-modal-overlay">
      <div className="modal-content cursor-default" onClick={(e: React.MouseEvent) => e.stopPropagation()} data-testid="add-employee-modal">
        <div className="modal-header">
          <h3 className="text-xl text-white font-heading m-0 flex-row align-center gap-sm">
            <Users size={20} color="var(--bby-yellow)" /> Add New Associate to Roster
          </h3>
          <button 
            type="button"
            className="flex-center text-muted border-none bg-transparent cursor-pointer"
            onClick={onClose}
            data-testid="add-employee-close-btn"
          >
            <X size={20} />
          </button>
        </div>
        
        <AddEmployeeForm onAddEmployee={onAddEmployee} onCancel={onClose} />
      </div>
    </div>
  );
}
