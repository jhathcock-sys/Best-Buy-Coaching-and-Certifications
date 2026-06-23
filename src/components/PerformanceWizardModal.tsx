import { useState } from 'react';
import { X } from 'lucide-react';
import WizardStep1General from './PerformanceWizardModal/WizardStep1General';
import WizardStep2Attach from './PerformanceWizardModal/WizardStep2Attach';
import WizardStep3Quality from './PerformanceWizardModal/WizardStep3Quality';

export default function PerformanceWizardModal({ 
  isOpen, 
  onClose, 
  employee, 
  onSave, 
  activePeriod,
  deptGoals
}: any) {
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

  const [prevEmployee, setPrevEmployee] = useState(employee);

  if (employee !== prevEmployee) {
    setPrevEmployee(employee);
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
  }

  if (!isOpen || !employee) return null;

  const handleSave = () => {
    if (!editForm.name.trim()) {
      alert("Name is required!");
      return;
    }
    const updated = {
      name: editForm.name.trim(),
      dept: editForm.dept,
      hours: Number(editForm.hours as any) || 0,
      memberships: Number(editForm.memberships as any) || 0,
      creditCards: Number(editForm.creditCards as any) || 0,
      warranty: Number(editForm.warranty as any) || 0,
      surveys: editForm.surveys === 'Failing' || editForm.surveys === 'failing' ? 0.2 : Number(editForm.surveys as any) || 0,
      rph: Number(editForm.rph as any) || 0,
      transactions: Number(editForm.transactions as any) || 0,
      basket: (editForm.dept === 'Computing' || editForm.dept === 'Home Theatre') ? (Number(editForm.basket as any) || 0) : 0,
      m365: editForm.dept === 'Computing' ? (Number(editForm.m365 as any) || 0) : 0,
      audio: editForm.dept === 'Home Theatre' ? (Number(editForm.audio as any) || 0) : 0,
      focus5: editForm.focus5 || false,
      gap: editForm.gap || 'None'
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '2.5px solid var(--bby-blue)', maxWidth: '650px', width: '90%' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Update Weekly Performance: {employee.name}
          </h3>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Wizard Step Progress Indicator */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'rgba(0, 70, 190, 0.1)', 
            border: '1px solid var(--border-glass)', 
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: currentEditStep === 1 ? 1 : 0.5 }}>
              <span style={{ 
                background: currentEditStep === 1 ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>1</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Profile</span>
            </div>
            <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: currentEditStep === 2 ? 1 : 0.5 }}>
              <span style={{ 
                background: currentEditStep === 2 ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>2</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Targets</span>
            </div>
            <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: currentEditStep === 3 ? 1 : 0.5 }}>
              <span style={{ 
                background: currentEditStep === 3 ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>3</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ratings</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-0.25rem' }}>
            Period: <strong>{activePeriod}</strong> | Audited against <strong>{editForm.dept}</strong> goals.
          </p>
          
          {/* STEP 1: General Info */}
          {currentEditStep === 1 && (
            <WizardStep1General 
              editForm={editForm}
              setEditForm={setEditForm}
              departmentGoals={deptGoals}
              DEPARTMENTS={DEPARTMENTS}
            />
          )}

          {currentEditStep === 2 && (
            <WizardStep2Attach 
              editForm={editForm}
              setEditForm={setEditForm}
              departmentGoals={deptGoals}
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
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ padding: '0.55rem 1.25rem' }} 
              onClick={() => {
                if (currentEditStep > 1) {
                  setCurrentEditStep(currentEditStep - 1);
                } else {
                  onClose();
                }
              }}
            >
              {currentEditStep > 1 ? 'Back' : 'Discard'}
            </button>
            
            {currentEditStep < 3 ? (
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-blue)' }} 
                onClick={() => setCurrentEditStep(currentEditStep + 1)}
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ padding: '0.55rem 1.25rem', background: 'var(--success)' }} 
                onClick={handleSave}
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

