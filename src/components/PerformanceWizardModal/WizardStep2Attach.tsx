import React from 'react';
import { X } from 'lucide-react';

export default function WizardStep2Attach({ 
  editForm,
  setEditForm,
  departmentGoals
 }) {
  return (
    <>
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
    </>
  );
}
