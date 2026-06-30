import React from 'react';
import { Award, Star } from 'lucide-react';
import { SimulationResult } from './types';

interface ShiftScorecardProps {
  scorecard: SimulationResult['scorecard'];
}

export default function ShiftScorecard({ scorecard }: ShiftScorecardProps) {
  const isPassing = (scorecard?.placementScore ?? 0) >= 80;

  return (
    <div className="glass-card flex flex-col gap-md" data-testid="shift-scorecard">
      <div className="flex justify-between items-center">
        <h3 className="text-lg flex items-center gap-sm">
          <Award size={18} color="var(--bby-yellow)" /> Shift Scorecard
        </h3>
        <span 
          className={`tag-pill text-xs font-bold border ${
            isPassing 
              ? 'bg-[var(--success-glow)] text-success border-[var(--success-glow)]' 
              : 'bg-[var(--warning-glow)] text-warning border-[var(--warning-glow)]'
          }`}
          data-testid="placement-score-tag"
        >
          Placement Score: {scorecard?.placementScore ?? 0}%
        </span>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 gap-sm">
        <div className="p-sm bg-white/5 border border-glass rounded-lg text-center flex flex-col items-center justify-center">
          <span className="text-[0.65rem] text-secondary uppercase block mb-xs">Estimated Revenue</span>
          <span className="text-lg font-extrabold text-success" data-testid="scorecard-revenue">
            ${(scorecard?.revenue ?? 0).toLocaleString()}
          </span>
          <span className="text-[0.65rem] text-muted block mt-xs">Goal: ${(scorecard?.revenueGoal ?? 0).toLocaleString()}</span>
        </div>
        
        <div className="p-sm bg-white/5 border border-glass rounded-lg text-center flex flex-col items-center justify-center">
          <span className="text-[0.65rem] text-secondary uppercase block mb-xs">CSAT Survey Rating</span>
          <span className="text-lg font-extrabold text-bby-yellow flex items-center justify-center gap-1" data-testid="scorecard-csat">
            {scorecard?.csat ?? 0} <Star size={14} fill="var(--bby-yellow)" color="var(--bby-yellow)" />
          </span>
          <span className="text-[0.65rem] text-muted block mt-xs">Target: 4.8★</span>
        </div>
        
        <div className="p-sm bg-white/5 border border-glass rounded-lg text-center flex flex-col items-center justify-center">
          <span className="text-[0.65rem] text-secondary uppercase block mb-xs">Paid Memberships</span>
          <span className="text-lg font-extrabold text-white" data-testid="scorecard-memberships">
            {scorecard?.memberships ?? 0}
          </span>
        </div>
        
        <div className="p-sm bg-white/5 border border-glass rounded-lg text-center flex flex-col items-center justify-center">
          <span className="text-[0.65rem] text-secondary uppercase block mb-xs">Best Buy Cards</span>
          <span className="text-lg font-extrabold text-white" data-testid="scorecard-cards">
            {scorecard?.creditCards ?? 0}
          </span>
        </div>
      </div>

      {/* Placement Review Text */}
      <div className="py-sm px-md bg-white/5 border border-glass rounded-lg text-sm text-secondary leading-relaxed mt-xs" data-testid="scorecard-review">
        <strong className="text-white">GM Placement Audit:</strong> {scorecard?.placementReview || 'No review generated.'}
      </div>
    </div>
  );
}
