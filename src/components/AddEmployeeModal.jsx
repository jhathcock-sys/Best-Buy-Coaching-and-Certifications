import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [form, setForm] = useState({
    name: '',
    dept: 'Front End',
    hours: '',
    memberships: '',
    creditCards: '',
    warranty: '',
    surveys: '',
    rph: '',
    basket: '',
    m365: '',
    audio: '',
    focus5: false,
    gap: 'None'
  });

  if (!isOpen) return null;

  const DEPARTMENTS = ['Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Please enter the associate's name!");
      return;
    }
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: form.name.trim(),
      dept: form.dept,
      hours: parseFloat(form.hours) || 0,
      memberships: parseInt(form.memberships) || 0,
      creditCards: parseInt(form.creditCards) || 0,
      warranty: parseFloat(form.warranty) || 0.0,
      surveys: form.surveys === 'Failing' || form.surveys === 'failing' ? 0.2 : parseFloat(form.surveys) || 0.0,
      rph: parseInt(form.rph) || 0,
      basket: (form.dept === 'Computing' || form.dept === 'Home Theatre') ? (parseFloat(form.basket) || 0) : 0,
      m365: form.dept === 'Computing' ? (parseFloat(form.m365) || 0) : 0,
      audio: form.dept === 'Home Theatre' ? (parseFloat(form.audio) || 0) : 0,
      focus5: form.focus5 || false,
      gap: form.gap || 'None'
    };
    onAddEmployee(newEmp);
    setForm({
      name: '',
      dept: 'Front End',
      hours: '',
      memberships: '',
      creditCards: '',
      warranty: '',
      surveys: '',
      rph: '',
      basket: '',
      m365: '',
      audio: '',
      focus5: false,
      gap: 'None'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '2px solid var(--bby-blue)', maxWidth: '650px', width: '90%' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--bby-yellow)" /> Add New Associate to Roster
          </h3>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Associate Name:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Sarah Jennings"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Department:</label>
              <select 
                className="form-control"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Monthly Hours Worked:</label>
              <input 
                type="number" 
                step="0.1"
                className="form-control" 
                placeholder="e.g. 45.5"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Memberships Attach:</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 6"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.memberships}
                onChange={(e) => setForm({ ...form, memberships: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Credit Card Apps:</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 3"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.creditCards}
                onChange={(e) => setForm({ ...form, creditCards: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>GSP/Warranty Attach %:</label>
              <input 
                type="number" 
                step="0.1"
                className="form-control" 
                placeholder="e.g. 10.5"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.warranty}
                onChange={(e) => setForm({ ...form, warranty: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>5 Star Surveys:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. 4 or Failing"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.surveys}
                onChange={(e) => setForm({ ...form, surveys: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>RPH ($ index):</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 950"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={form.rph}
                onChange={(e) => setForm({ ...form, rph: e.target.value })}
              />
            </div>

            {/* Conditional Department Metrics */}
            {(form.dept === 'Computing' || form.dept === 'Home Theatre') && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Basket Size ($):</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="e.g. 165.50"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={form.basket}
                  onChange={(e) => setForm({ ...form, basket: e.target.value })}
                />
              </div>
            )}
            
            {form.dept === 'Computing' && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Microsoft 365 Attach %:</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-control" 
                  placeholder="e.g. 62.5"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={form.m365}
                  onChange={(e) => setForm({ ...form, m365: e.target.value })}
                />
              </div>
            )}

            {form.dept === 'Home Theatre' && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Audio Attach %:</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-control" 
                  placeholder="e.g. 38.0"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={form.audio}
                  onChange={(e) => setForm({ ...form, audio: e.target.value })}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Opportunity Gap Description (or None):</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. GSP Attach (4.0% vs 12.0%) or None"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              value={form.gap}
              onChange={(e) => setForm({ ...form, gap: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="add-focus5"
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              checked={form.focus5}
              onChange={(e) => setForm({ ...form, focus5: e.target.checked })}
            />
            <label htmlFor="add-focus5" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              🔥 Add to Focus 5 List (Supervisor Observation Plan)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-yellow)', color: '#000', fontWeight: 600 }}>
              Add Associate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
