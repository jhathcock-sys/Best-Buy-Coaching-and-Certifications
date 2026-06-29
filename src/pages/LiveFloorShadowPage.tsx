import React from 'react';
import { useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';
import ShadowStep1Employee from '../components/LiveFloorShadow/ShadowStep1Employee';
import ShadowStep2Observation from '../components/LiveFloorShadow/ShadowStep2Observation';
import ShadowStep3Coaching from '../components/LiveFloorShadow/ShadowStep3Coaching';
import { useLiveFloorShadow, UseLiveFloorShadowProps } from '../hooks/useLiveFloorShadow';

export default function LiveFloorShadow({ 
  onNavigate, 
  preselectedEmployee, 
  clearPreselectedEmployee
}: UseLiveFloorShadowProps) {
  const {
    currentStep, setCurrentStep,
    selectedEmpId, setSelectedEmpId,
    selectedEmployee,
    handleSelectEmployee,
    department, setDepartment,
    isGenerating, setIsGenerating,
    checklist, setChecklist,
    notes, setNotes,
    strengths, setStrengths,
    gapDetails, setGapDetails,
    followUpAction, setFollowUpAction,
    followUpDate, setFollowUpDate,
    handleComplete,
    toggleChecklistItem,
    showSuccessOverlay,
    roster
  } = useLiveFloorShadow({
    onNavigate,
    preselectedEmployee,
    clearPreselectedEmployee
  });
  return (
    <div className="flex-column gap-2xl h-full min-h-600">
      
      {/* Header */}
      <div className="flex-between align-center">
        <div>
          <h2 className="text-1-75rem font-heading text-bby-blue flex-center gap-sm m-0 justify-start">
            <ShieldCheck size={28} /> Live Floor Shadow
          </h2>
          <p className="text-secondary text-sm mt-sm">
            Follow an advisor, log their behaviors, and auto-generate coaching notes.
          </p>
        </div>
        <button onClick={() => onNavigate && onNavigate('dashboard')} className="btn-secondary flex-center gap-sm cursor-pointer" data-testid="live-shadow-back-btn">
          <Check size={16} /> Finish & Close
        </button>
      </div>

      {!isGenerating && showSuccessOverlay ? (
        <div className="glass-card p-3rem text-center animate-scale-in">
          {/* Success Overlay Screen */}
          <div className="flex-center mb-lg">
            <div className="bg-success-alpha text-success p-md rounded-full">
              <Check size={48} />
            </div>
          </div>
          <h3 className="text-2xl mb-md">Shadow Completed!</h3>
          <p className="text-secondary mb-2xl max-w-500 mx-auto">
            The AI has successfully compiled your observations into actionable coaching notes and logged them to the employee's history.
          </p>
          <div className="flex-center gap-md">
            <button onClick={() => onNavigate && onNavigate('dashboard')} className="btn-primary cursor-pointer" data-testid="live-shadow-finish-btn">
              Return to Profile
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stepper Wizard Indicator */}
          <div className="flex-center gap-md mb-md">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-center gap-md">
                <div 
                  className={`w-8 h-8 rounded-full flex-center font-bold transition-normal ${currentStep >= step ? 'bg-bby-blue text-black' : 'bg-white/10 text-secondary'}`}
                >
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-10 h-0-5 ${currentStep > step ? 'bg-bby-blue' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Wizard Content Panels */}
          <div className="glass-card p-xl min-h-350">
            
            {/* Step 1: Selection */}
            {currentStep === 1 && (
              <ShadowStep1Employee 
                roster={roster}
                selectedEmpId={selectedEmpId}
                department={department}
                setDepartment={setDepartment}
                handleSelectEmployee={handleSelectEmployee}
                activeEmployee={selectedEmployee}
              />
            )}

            {/* Step 2: Observation Checklist */}
            {currentStep === 2 && (
              <ShadowStep2Observation 
                checklist={checklist}
                toggleChecklistItem={toggleChecklistItem}
                notes={notes}
                setNotes={setNotes}
              />
            )}

            {/* Step 3: Coaching Action Plan */}
            {currentStep === 3 && (
              <ShadowStep3Coaching 
                strengths={strengths}
                setStrengths={setStrengths}
                gapDetails={gapDetails}
                setGapDetails={setGapDetails}
                followUpAction={followUpAction}
                setFollowUpAction={setFollowUpAction}
                followUpDate={followUpDate}
                setFollowUpDate={setFollowUpDate}
              />
            )}
            
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex-between align-center mt-auto">
            <button 
              className="btn-secondary flex-center gap-sm" 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isGenerating}
              data-testid="back-button"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 3 ? (
              <button 
                className="btn-primary flex-center gap-sm" 
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={currentStep === 1 && !selectedEmpId}
                data-testid="next-button"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="btn-primary flex-center gap-sm" 
                onClick={handleComplete}
                disabled={isGenerating}
                data-testid="compile-button"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner w-4 h-4 border-2" />
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
