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
  strengths,
  setStrengths,
  gapDetails,
  setGapDetails,
  followUpAction,
  setFollowUpAction,
  followUpDate,
  setFollowUpDate,
  handleComplete
 }) {
  return (
    <>
      <div className="flex-column gap-lg animate-fade-in">
        <h3 className="text-xl flex-center gap-sm justify-start">
          <Calendar size={20} color="var(--bby-blue)" /> Action Plan & Follow-Up Commitments
        </h3>

        <div className="grid-cols-2 gap-lg">
          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Observed Strengths Summary
            </label>
            <textarea 
              value={strengths} 
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="e.g. Great pace, professional tone, avoided pushiness"
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-80px resize-none p-sm"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Performance Gap Details
            </label>
            <textarea 
              value={gapDetails} 
              onChange={(e) => setGapDetails(e.target.value)}
              placeholder="e.g. Missed survey pitch, didn't write name on receipt sleeve"
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-80px resize-none p-sm"
            />
          </div>
        </div>

        <div className="grid-cols-2-1 gap-lg">
          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Follow-up Observation Commitment Action
            </label>
            <input 
              type="text"
              value={followUpAction} 
              onChange={(e) => setFollowUpAction(e.target.value)}
              placeholder="e.g. Shadow 3 customer checkouts to verify survey ask"
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-44px"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Follow-up Date
            </label>
            <input 
              type="date"
              value={followUpDate} 
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-44px"
            />
          </div>
        </div>
      </div>
    </>
  );
}
