import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PerformanceWizardModal({ 
  isOpen, 
  onClose, 
  employee, 
  onSave, 
  activePeriod, 
  deptGoals 
}) {
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
    const updated = {
      name: editForm.name.trim(),
      dept: editForm.dept,
      hours: parseFloat(editForm.hours) || 0,
      memberships: parseInt(editForm.memberships) || 0,
      creditCards: parseInt(editForm.creditCards) || 0,
      warranty: parseFloat(editForm.warranty) || 0,
      surveys: editForm.surveys === 'Failing' || editForm.surveys === 'failing' ? 0.2 : parseFloat(editForm.surveys) || 0,
      rph: parseInt(editForm.rph) || 0,
      basket: (editForm.dept === 'Computing' || editForm.dept === 'Home Theatre') ? (parseFloat(editForm.basket) || 0) : 0,
      m365: editForm.dept === 'Computing' ? (parseFloat(editForm.m365) || 0) : 0,
      audio: editForm.dept === 'Home Theatre' ? (parseFloat(editForm.audio) || 0) : 0,
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Associate Name:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Department:</label>
                <select 
                  className="form-control"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={editForm.dept}
                  onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Hours Worked:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, hours: Math.max(0, parseFloat((parseFloat(prev.hours) - 1).toFixed(1))) }))}>-</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.hours}
                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, hours: parseFloat((parseFloat(prev.hours) + 1).toFixed(1)) }))}>+</button>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="edit-focus5"
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  checked={editForm.focus5}
                  onChange={(e) => setEditForm({ ...editForm, focus5: e.target.checked })}
                />
                <label htmlFor="edit-focus5" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  🔥 Supervisor Focus 5 List (Priority Shift Coaching)
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Attach Targets */}
          {currentEditStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Memberships Attach:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, memberships: Math.max(0, parseInt(prev.memberships) - 1) }))}>-</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.memberships}
                    onChange={(e) => setEditForm({ ...editForm, memberships: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, memberships: parseInt(prev.memberships) + 1 }))}>+</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>BBY Credit Card Apps:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, creditCards: Math.max(0, parseInt(prev.creditCards) - 1) }))}>-</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.creditCards}
                    onChange={(e) => setEditForm({ ...editForm, creditCards: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, creditCards: parseInt(prev.creditCards) + 1 }))}>+</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>GSP/Warranty Attach %:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, warranty: Math.max(0, parseFloat((parseFloat(prev.warranty) - 1).toFixed(1))) }))}>-</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.warranty}
                    onChange={(e) => setEditForm({ ...editForm, warranty: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, warranty: parseFloat((parseFloat(prev.warranty) + 1).toFixed(1)) }))}>+</button>
                </div>
              </div>

              {/* Conditional Department-Specific Metrics */}
              {(editForm.dept === 'Computing' || editForm.dept === 'Home Theatre') && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Basket Size ($):</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, basket: Math.max(0, parseFloat((parseFloat(prev.basket) - 10).toFixed(2))) }))}>-10</button>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control" 
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                      value={editForm.basket}
                      onChange={(e) => setEditForm({ ...editForm, basket: e.target.value })}
                    />
                    <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, basket: parseFloat((parseFloat(prev.basket) + 10).toFixed(2)) }))}>+10</button>
                  </div>
                </div>
              )}
              
              {editForm.dept === 'Computing' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Microsoft 365 Attach %:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, m365: Math.max(0, parseFloat((parseFloat(prev.m365) - 5).toFixed(1))) }))}>-5</button>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control" 
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                      value={editForm.m365}
                      onChange={(e) => setEditForm({ ...editForm, m365: e.target.value })}
                    />
                    <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, m365: parseFloat((parseFloat(prev.m365) + 5).toFixed(1)) }))}>+5</button>
                  </div>
                </div>
              )}

              {editForm.dept === 'Home Theatre' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Audio Attach %:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, audio: Math.max(0, parseFloat((parseFloat(prev.audio) - 5).toFixed(1))) }))}>-5</button>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control" 
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                      value={editForm.audio}
                      onChange={(e) => setEditForm({ ...editForm, audio: e.target.value })}
                    />
                    <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, audio: parseFloat((parseFloat(prev.audio) + 5).toFixed(1)) }))}>+5</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Quality & Gap */}
          {currentEditStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>5 Star Surveys:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="stepper-btn" 
                    onClick={() => {
                      setEditForm(prev => {
                        if (prev.surveys === 'Failing') {
                          return { ...prev, surveys: '0' };
                        }
                        const val = parseInt(prev.surveys) || 0;
                        if (val <= 0) {
                          return { ...prev, surveys: 'Failing' };
                        }
                        return { ...prev, surveys: (val - 1).toString() };
                      });
                    }}
                  >-</button>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.surveys}
                    onChange={(e) => setEditForm({ ...editForm, surveys: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className="stepper-btn" 
                    onClick={() => {
                      setEditForm(prev => {
                        if (prev.surveys === 'Failing') {
                          return { ...prev, surveys: '1' };
                        }
                        const val = parseInt(prev.surveys) || 0;
                        return { ...prev, surveys: (val + 1).toString() };
                      });
                    }}
                  >+</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>RPH index ($):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, rph: Math.max(0, parseInt(prev.rph) - 50) }))}>-50</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.rph}
                    onChange={(e) => setEditForm({ ...editForm, rph: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, rph: parseInt(prev.rph) + 50 }))}>+50</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Opportunity Gap Description:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={editForm.gap}
                  onChange={(e) => setEditForm({ ...editForm, gap: e.target.value })}
                />
              </div>
            </div>
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
