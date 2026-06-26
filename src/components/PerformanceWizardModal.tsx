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
    <div className="modal-overlay" onClick={onClose} data-testid="performance-wizard-modal">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ border: '2.5px solid var(--bby-blue)', maxWidth: '650px', width: '90%' }}
      >
        <div className="modal-header">
          <h3 className="text-xl text-white m-0" style={{ fontFamily: 'var(--font-heading)' }}>
            Update Weekly Performance: {employee.name}
          </h3>
          <button 
            type="button"
            className="flex-center cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text-muted)' }}
            onClick={onClose}
            data-testid="wizard-close-btn"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body flex-column gap-xl" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Wizard Step Progress Indicator */}
          <div 
            className="flex-row align-center p-md"
            style={{ 
              justifyContent: 'space-between', 
              background: 'rgba(0, 70, 190, 0.1)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '12px',
              marginBottom: '0.5rem'
            }}
          >
            <div className="flex-row align-center gap-sm" style={{ opacity: currentEditStep === 1 ? 1 : 0.5 }}>
              <span className="flex-center text-xs font-bold" style={{ 
                background: currentEditStep === 1 ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%'
              }}>1</span>
              <span className="text-xs font-semibold">Profile</span>
            </div>
            <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex-row align-center gap-sm" style={{ opacity: currentEditStep === 2 ? 1 : 0.5 }}>
              <span className="flex-center text-xs font-bold" style={{ 
                background: currentEditStep === 2 ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%'
              }}>2</span>
              <span className="text-xs font-semibold">Targets</span>
            </div>
            <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex-row align-center gap-sm" style={{ opacity: currentEditStep === 3 ? 1 : 0.5 }}>
              <span className="flex-center text-xs font-bold" style={{ 
                background: currentEditStep === 3 ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%'
              }}>3</span>
              <span className="text-xs font-semibold">Ratings</span>
            </div>
          </div>

          <p className="text-sm text-secondary" style={{ marginTop: '-0.25rem' }}>
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
          
          <div className="flex-row p-md" style={{ gap: '1rem', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              type="button"
              className="btn btn-secondary cursor-pointer" 
              style={{ padding: '0.55rem 1.25rem' }} 
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
                className="btn btn-primary cursor-pointer" 
                style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-blue)' }} 
                onClick={() => setCurrentEditStep(currentEditStep + 1)}
                data-testid="wizard-next-btn"
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                className="btn btn-primary cursor-pointer" 
                style={{ padding: '0.55rem 1.25rem', background: 'var(--success-glow)' }} 
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

