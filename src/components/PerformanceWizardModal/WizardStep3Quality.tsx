// @ts-nocheck
import React from 'react';
import { X } from 'lucide-react';

export default function WizardStep3Quality({ 
  editForm,
  handleFormChange,
  departmentGoals
 }) {
  return (
    <>
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
    </>
  );
}
