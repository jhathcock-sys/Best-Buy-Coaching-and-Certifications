import React from 'react';
import { useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';
import ShadowStep1Employee from '../components/LiveFloorShadow/ShadowStep1Employee';
import ShadowStep2Observation from '../components/LiveFloorShadow/ShadowStep2Observation';
import ShadowStep3Coaching from '../components/LiveFloorShadow/ShadowStep3Coaching';
import { useLiveFloorShadow } from '../hooks/useLiveFloorShadow';
import { generateCoachingLogGemini } from '../services/ai';


import { useStore } from '../store/useStore';

export default function LiveFloorShadow({ 
  onNavigate, 
  preselectedEmployee, 
  clearPreselectedEmployee
}: any) {
  const apiKey = useStore((state) => state.apiKey);
  
  const playbookSettings = useStore((state) => state.playbookSettings);
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || {};
  const _rawroster = rosterHistory[activePeriod] || {};
  const roster = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);
  
  const onLogCoachingSession = useStore((state) => state.logCoachingSession);
  const onAddFollowUpTask = useStore((state) => state.addFollowUpTask);
  const {
    currentStep, setCurrentStep,
    selectedEmpId, setSelectedEmpId,
    selectedEmployee,
    handleSelectEmployee,
    department, setDepartment,
    isGenerating, setIsGenerating,
    checklist, setChecklist,
    customerPersona, setCustomerPersona,
    customPersona, setCustomPersona,
    notes, setNotes,
    coachingInsight, setCoachingInsight,
    strengths, setStrengths,
    gapDetails, setGapDetails,
    followUpAction, setFollowUpAction,
    followUpDate, setFollowUpDate,
    handleGenerateCoaching,
    handleComplete,
    toggleChecklistItem
  } = useLiveFloorShadow({
    roster,
    onLogCoachingSession,
    onAddFollowUpTask,
    onNavigate,
    preselectedEmployee,
    clearPreselectedEmployee,
    playbookSettings,
    apiKey
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', minHeight: '600px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--bby-blue)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <ShieldCheck size={28} /> Live Floor Shadow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Follow an advisor, log their behaviors, and auto-generate coaching notes.
          </p>
        </div>
        <button onClick={onNavigate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> Finish & Close
        </button>
      </div>

      {!isGenerating && coachingInsight ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          {/* Success Overlay Screen */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 203, 110, 0.15)', color: 'var(--success-green)', padding: '1rem', borderRadius: '50%' }}>
              <Check size={48} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Shadow Completed!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            The AI has successfully compiled your observations into actionable coaching notes and logged them to the employee's history.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={onNavigate} className="btn-primary">
              Return to Profile
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stepper Wizard Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {[1, 2, 3].map((step) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: currentStep >= step ? 'var(--bby-blue)' : 'rgba(255, 255, 255, 0.1)',
                  color: currentStep >= step ? '#000' : 'var(--text-secondary)',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}>
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 3 && (
                  <div style={{ width: '40px', height: '2px', background: currentStep > step ? 'var(--bby-blue)' : 'rgba(255, 255, 255, 0.1)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Wizard Content Panels */}
          <div className="glass-card" style={{ padding: '2.5rem', minHeight: '350px' }}>
            
            {/* Step 1: Selection */}
            {currentStep === 1 && (
              <ShadowStep1Employee 
                roster={roster}
                selectedEmpId={selectedEmpId}
                setSelectedEmpId={setSelectedEmpId}
                department={department}
                setDepartment={setDepartment}
                handleSelectEmployee={handleSelectEmployee}
                setCurrentStep={setCurrentStep}
                checklist={checklist}
                setChecklist={setChecklist}
                customerPersona={customerPersona}
                setCustomerPersona={setCustomerPersona}
                customPersona={customPersona}
                setCustomPersona={setCustomPersona}
                notes={notes}
                setNotes={setNotes}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                handleGenerateCoaching={handleGenerateCoaching}
                activeEmployee={selectedEmployee}
              />
            )}

            {/* Step 2: Observation Checklist */}
            {currentStep === 2 && (
              <ShadowStep2Observation 
                roster={roster}
                selectedEmpId={selectedEmpId}
                setSelectedEmpId={setSelectedEmpId}
                department={department}
                setDepartment={setDepartment}
                setCurrentStep={setCurrentStep}
                checklist={checklist}
                setChecklist={setChecklist}
                customerPersona={customerPersona}
                setCustomerPersona={setCustomerPersona}
                customPersona={customPersona}
                setCustomPersona={setCustomPersona}
                notes={notes}
                setNotes={setNotes}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                handleGenerateCoaching={handleGenerateCoaching}
                coachingInsight={coachingInsight}
                setCoachingInsight={setCoachingInsight}
                toggleChecklistItem={toggleChecklistItem}
              />
            )}

            {/* Step 3: Coaching Action Plan */}
            {currentStep === 3 && (
              <ShadowStep3Coaching 
                roster={roster}
                selectedEmpId={selectedEmpId}
                setSelectedEmpId={setSelectedEmpId}
                department={department}
                setDepartment={setDepartment}
                setCurrentStep={setCurrentStep}
                checklist={checklist}
                setChecklist={setChecklist}
                customerPersona={customerPersona}
                setCustomerPersona={setCustomerPersona}
                customPersona={customPersona}
                setCustomPersona={setCustomPersona}
                notes={notes}
                setNotes={setNotes}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                handleGenerateCoaching={handleGenerateCoaching}
                coachingInsight={coachingInsight}
                setCoachingInsight={setCoachingInsight}
                strengths={strengths}
                setStrengths={setStrengths}
                gapDetails={gapDetails}
                setGapDetails={setGapDetails}
                followUpAction={followUpAction}
                setFollowUpAction={setFollowUpAction}
                followUpDate={followUpDate}
                setFollowUpDate={setFollowUpDate}
                handleComplete={handleComplete}
              />
            )}
            
          </div>

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isGenerating}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 3 ? (
              <button 
                className="btn-primary" 
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={currentStep === 1 && !selectedEmpId}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleComplete}
                disabled={isGenerating}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Clipboard size={16} /> Compile & Log
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}

    </div>
  );
}
