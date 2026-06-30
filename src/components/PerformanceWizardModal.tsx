import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import WizardStep1General from './PerformanceWizardModal/WizardStep1General';
import WizardStep2Attach from './PerformanceWizardModal/WizardStep2Attach';
import WizardStep3Quality from './PerformanceWizardModal/WizardStep3Quality';
import { Employee } from '../types';

export interface PerformanceWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (updated: Partial<Employee>) => void;
  activePeriod: string;
  deptGoals: any;
}

export default function PerformanceWizardModal({ 
  isOpen, 
  onClose, 
  employee, 
  onSave, 
  activePeriod,
  deptGoals
}: PerformanceWizardModalProps) {
  const [currentEditStep, setCurrentEditStep] = useState(1);
  const [editForm, setEditForm] = useState({
    name: '',
    dept: 'Front End',
    hours: 0,
    memberships: 0,
    creditCards: 0,
    warranty: 0,
    surveys: '5.0',
    rph: 0,
    transactions: 0,
    basket: 0,
    m365: 0,
    audio: 0,
    focus5: false,
    gap: 'None'
  });

  const DEPARTMENTS = ['Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  useEffect(() => {
    if (employee) {
      setCurrentEditStep(1);
      setEditForm({
        name: employee.name || '',
        dept: employee.dept || 'Front End',
        hours: employee.hours || 0,
        memberships: employee.memberships || 0,
        creditCards: employee.creditCards || 0,
        warranty: employee.warranty || 0,
        surveys: employee.surveys === 0.2 ? 'Failing' : (employee.surveys !== undefined ? employee.surveys.toString() : '5.0'),
        rph: employee.rph || 0,
        transactions: employee.transactions || 0,
        basket: employee.basket || 0,
        m365: employee.m365 || 0,
        audio: employee.audio || 0,
        focus5: employee.focus5 || false,
        gap: employee.gap || 'None'
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSave = () => {
    if (!editForm.name.trim()) {
      alert("Name is required!");
      return;
    }
    const updated: Partial<Employee> = {
      name: editForm.name.trim(),
      dept: editForm.dept,
      hours: Number(editForm.hours) || 0,
      memberships: Number(editForm.memberships) || 0,
      creditCards: Number(editForm.creditCards) || 0,
      warranty: Number(editForm.warranty) || 0,
      surveys: editForm.surveys === 'Failing' || editForm.surveys === 'failing' ? 0.2 : Number(editForm.surveys) || 0,
      rph: Number(editForm.rph) || 0,
      transactions: Number(editForm.transactions) || 0,
      basket: (editForm.dept === 'Computing' || editForm.dept === 'Home Theatre') ? (Number(editForm.basket) || 0) : 0,
      m365: editForm.dept === 'Computing' ? (Number(editForm.m365) || 0) : 0,
      audio: editForm.dept === 'Home Theatre' ? (Number(editForm.audio) || 0) : 0,
      focus5: editForm.focus5 || false,
      gap: editForm.gap || 'None'
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay cursor-pointer" onClick={onClose} data-testid="performance-wizard-modal">
      <div 
        className="modal-content border-[2.5px] border-bby-blue w-[90%] max-w-[650px]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="text-xl text-white m-0 font-heading">
            Update Weekly Performance: {employee.name}
          </h3>
          <button 
            type="button"
            className="flex-center cursor-pointer border-none bg-transparent text-muted"
            onClick={onClose}
            data-testid="wizard-close-btn"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body flex-column gap-xl max-h-[80vh] overflow-y-auto">
          
          {/* Wizard Step Progress Indicator */}
          <div className="flex-row align-center p-md justify-between bg-bby-blue/10 border border-[var(--border-glass)] rounded-xl mb-sm">
            <div className={`flex-row align-center gap-sm ${currentEditStep === 1 ? 'opacity-100' : 'opacity-50'}`}>
              <span className={`flex-center text-xs font-bold text-white w-5 h-5 rounded-full ${currentEditStep === 1 ? 'bg-bby-blue' : 'bg-white/10'}`}>1</span>
              <span className="text-xs font-semibold">Profile</span>
            </div>
            <div className="w-5 h-px bg-white/10" />
            <div className={`flex-row align-center gap-sm ${currentEditStep === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <span className={`flex-center text-xs font-bold text-white w-5 h-5 rounded-full ${currentEditStep === 2 ? 'bg-bby-blue' : 'bg-white/10'}`}>2</span>
              <span className="text-xs font-semibold">Targets</span>
            </div>
            <div className="w-5 h-px bg-white/10" />
            <div className={`flex-row align-center gap-sm ${currentEditStep === 3 ? 'opacity-100' : 'opacity-50'}`}>
              <span className={`flex-center text-xs font-bold text-white w-5 h-5 rounded-full ${currentEditStep === 3 ? 'bg-bby-blue' : 'bg-white/10'}`}>3</span>
              <span className="text-xs font-semibold">Ratings</span>
            </div>
          </div>

          <p className="text-sm text-secondary -mt-1">
            Period: <strong>{activePeriod}</strong> | Audited against <strong>{editForm.dept}</strong> goals.
          </p>
          
          {/* STEP 1: General Info */}
          {currentEditStep === 1 && (
            <WizardStep1General 
              editForm={editForm}
              setEditForm={setEditForm}
              DEPARTMENTS={DEPARTMENTS}
            />
          )}

          {currentEditStep === 2 && (
            <WizardStep2Attach 
              editForm={editForm}
              setEditForm={setEditForm}
            />
          )}

          {currentEditStep === 3 && (
            <WizardStep3Quality 
              editForm={editForm}
              setEditForm={setEditForm}
              departmentGoals={deptGoals}
              employee={employee}
            />
          )}
          
          <div className="flex-row p-md gap-4 justify-between mt-4 border-t border-white/5">
            <button 
              type="button"
              className="btn btn-secondary cursor-pointer px-5 py-2" 
              onClick={() => {
                if (currentEditStep > 1) {
                  setCurrentEditStep(currentEditStep - 1);
                } else {
                  onClose();
                }
              }}
              data-testid="wizard-back-btn"
            >
              {currentEditStep > 1 ? 'Back' : 'Discard'}
            </button>
            
            {currentEditStep < 3 ? (
              <button 
                type="button"
                className="btn btn-primary cursor-pointer px-5 py-2 bg-bby-blue" 
                onClick={() => setCurrentEditStep(currentEditStep + 1)}
                data-testid="wizard-next-btn"
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                className="btn btn-primary cursor-pointer px-5 py-2 bg-success-glow" 
                onClick={handleSave}
                data-testid="wizard-save-btn"
              >
                Save Metrics
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

