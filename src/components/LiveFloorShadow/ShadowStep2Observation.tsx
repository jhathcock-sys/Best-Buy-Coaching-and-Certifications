import React from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ShadowStep2Observation({ 
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--bby-blue)" /> Behavior Checklist (DISC Model)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  
                  {/* Discover Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--bby-blue)', borderBottom: '1px solid rgba(0,70,190,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Discover
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.greeting} onChange={() => toggleChecklistItem('greeting')} />
                        Friendly welcome within 10s / 10ft
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.nameExchange} onChange={() => toggleChecklistItem('nameExchange')} />
                        Exchanged names / introduced self
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.setupProbe} onChange={() => toggleChecklistItem('setupProbe')} />
                        Probed customer environment setup
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.specQuestions} onChange={() => toggleChecklistItem('specQuestions')} />
                        Asked open-ended spec/usage questions
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.avoidedForbidden} onChange={() => toggleChecklistItem('avoidedForbidden')} />
                        Avoided forbidden retail vocabulary
                      </label>
                    </div>
                  </div>

                  {/* Inspire Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--info)', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Inspire
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.builtRapport} onChange={() => toggleChecklistItem('builtRapport')} />
                        Connected personally / built human rapport
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.emotionalDriver} onChange={() => toggleChecklistItem('emotionalDriver')} />
                        Uncovered customer emotional driver
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.demoProduct} onChange={() => toggleChecklistItem('demoProduct')} />
                        Demonstrated product/service features
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.membershipBenefits} onChange={() => toggleChecklistItem('membershipBenefits')} />
                        Shared membership benefits during demo
                      </label>
                    </div>
                  </div>

                  {/* Solve Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--success)', borderBottom: '1px solid rgba(16,185,129,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Solve
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.membershipPitched} onChange={() => toggleChecklistItem('membershipPitched')} />
                        Pitched Plus/Total support solution
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.warrantyAttached} onChange={() => toggleChecklistItem('warrantyAttached')} />
                        Attached protection (GSP/AppleCare+)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.solutionMatched} onChange={() => toggleChecklistItem('solutionMatched')} />
                        Matched the complete solution
                      </label>
                    </div>
                  </div>

                  {/* Close Section */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--warning)', borderBottom: '1px solid rgba(245,158,11,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      Close
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.creditCardPitched} onChange={() => toggleChecklistItem('creditCardPitched')} />
                        Pitched Credit Card rewards/financing
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.handledObjections} onChange={() => toggleChecklistItem('handledObjections')} />
                        Acknowledged and handled objections
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.surveyRequested} onChange={() => toggleChecklistItem('surveyRequested')} />
                        Requested feedback via 5-Star Survey
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={checklist.sleeveReceipt} onChange={() => toggleChecklistItem('sleeveReceipt')} />
                        Receipt in sleeve with written advisor name
                      </label>
                    </div>
                  </div>

                </div>
              </div>
    </>
  );
}
