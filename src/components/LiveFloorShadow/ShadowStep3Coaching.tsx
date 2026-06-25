import React from 'react';
import { Calendar } from 'lucide-react';

export interface ShadowStep3CoachingProps {
  strengths: string;
  setStrengths: React.Dispatch<React.SetStateAction<string>>;
  gapDetails: string;
  setGapDetails: React.Dispatch<React.SetStateAction<string>>;
  followUpAction: string;
  setFollowUpAction: React.Dispatch<React.SetStateAction<string>>;
  followUpDate: string;
  setFollowUpDate: React.Dispatch<React.SetStateAction<string>>;
}

export default function ShadowStep3Coaching({ 
  strengths,
  setStrengths,
  gapDetails,
  setGapDetails,
  followUpAction,
  setFollowUpAction,
  followUpDate,
  setFollowUpDate
 }: ShadowStep3CoachingProps) {
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
              value={strengths || ''} 
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="e.g. Great pace, professional tone, avoided pushiness"
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-20 resize-none p-sm"
              data-testid="shadow-coaching-strengths"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Performance Gap Details
            </label>
            <textarea 
              value={gapDetails || ''} 
              onChange={(e) => setGapDetails(e.target.value)}
              placeholder="e.g. Missed survey pitch, didn't write name on receipt sleeve"
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-20 resize-none p-sm"
              data-testid="shadow-coaching-gapDetails"
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
              value={followUpAction || ''} 
              onChange={(e) => setFollowUpAction(e.target.value)}
              placeholder="e.g. Shadow 3 customer checkouts to verify survey ask"
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-11"
              data-testid="shadow-coaching-followUpAction"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Follow-up Date
            </label>
            <input 
              type="date"
              value={followUpDate || ''} 
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-11"
              data-testid="shadow-coaching-followUpDate"
            />
          </div>
        </div>
      </div>
    </>
  );
}
