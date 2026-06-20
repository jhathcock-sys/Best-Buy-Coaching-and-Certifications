import React from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ShadowStep1Employee({ 
  roster,
  selectedEmpId,
  setSelectedEmpId,
  department,
  setDepartment,
  setCurrentStep,
  checklist,
  setChecklist,
  customerPersona,
  setCustomerPersona,
  customPersona,
  setCustomPersona,
  notes,
  setNotes,
  isGenerating,
  setIsGenerating,
  handleGenerateCoaching,
  coachingInsight,
  setCoachingInsight,
  handleComplete,
  handleSelectEmployee,
  activeEmployee
 }) {
  return (
    <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="var(--bby-blue)" /> Select Advisor for Observation
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Associate Name
                    </label>
                    <select 
                      value={selectedEmpId} 
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px', padding: '0.55rem 1.25rem' }}
                    >
                      <option value="">-- Choose Associate --</option>
                      {roster.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.dept})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Department Focus
                    </label>
                    <select 
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)}
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px', padding: '0.55rem 1.25rem' }}
                    >
                      <option value="Front End">Front End</option>
                      <option value="General Sales">General Sales</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Computing">Computing</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Home Theatre">Home Theatre</option>
                      <option value="Geek Squad">Geek Squad</option>
                    </select>
                  </div>
                </div>

                {activeEmployee && (
                  <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,70,190,0.06)', border: '1px solid rgba(0,70,190,0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{activeEmployee.name}</span>
                      <span className="tag-pill tag-pill-active">{activeEmployee.dept}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>Hours: <strong style={{ color: '#fff' }}>{activeEmployee.hours}</strong></div>
                      <div>Memberships: <strong style={{ color: '#fff' }}>{activeEmployee.memberships}</strong></div>
                      <div>BBY Cards: <strong style={{ color: '#fff' }}>{activeEmployee.creditCards}</strong></div>
                      <div>GSP Attach: <strong style={{ color: '#fff' }}>{activeEmployee.warranty}%</strong></div>
                    </div>
                    {activeEmployee.gap && activeEmployee.gap !== 'None' && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#ffe600' }}>
                        <AlertCircle size={14} /> Gap focus: {activeEmployee.gap}
                      </div>
                    )}
                  </div>
                )}
              </div>
    </>
  );
}
