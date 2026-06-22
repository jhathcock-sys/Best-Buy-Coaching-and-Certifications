import React from 'react';
import { X } from 'lucide-react';

export default function WizardStep1General({ 
  editForm,
  setEditForm,
  departmentGoals,
  DEPARTMENTS
 }) {
  return (
    <>
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
    </>
  );
}
