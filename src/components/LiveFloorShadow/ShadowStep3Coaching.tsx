import React from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ShadowStep3Coaching({ 
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
  handleComplete
 }) {
  return (
    <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--bby-blue)" /> Action Plan & Follow-Up Commitments
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Observed Strengths Summary
                    </label>
                    <textarea 
                      value={strengths} 
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="e.g. Great pace, professional tone, avoided pushiness"
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '80px', resize: 'none', padding: '0.5rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Performance Gap Details
                    </label>
                    <textarea 
                      value={gapDetails} 
                      onChange={(e) => setGapDetails(e.target.value)}
                      placeholder="e.g. Missed survey pitch, didn't write name on receipt sleeve"
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '80px', resize: 'none', padding: '0.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Follow-up Observation Commitment Action
                    </label>
                    <input 
                      type="text"
                      value={followUpAction} 
                      onChange={(e) => setFollowUpAction(e.target.value)}
                      placeholder="e.g. Shadow 3 customer checkouts to verify survey ask"
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Follow-up Date
                    </label>
                    <input 
                      type="date"
                      value={followUpDate} 
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="form-control"
                      style={{ background: 'rgba(11, 15, 25, 0.8)', borderColor: 'var(--border-glass)', color: '#fff', width: '100%', height: '44px' }}
                    />
                  </div>
                </div>
              </div>
    </>
  );
}
