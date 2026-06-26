import React from 'react';
import { RefreshCw, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scenario } from './RoleplayConfiguration';

export interface EvaluationBreakdown {
  connect: number;
  discover: number;
  recommend: number;
  protect: number;
  close: number;
}

export interface EvaluationValues {
  beHuman: number;
  makeItEasy: number;
  showWhatPossible: number;
}

export interface GrowReport {
  goal: string;
  reality: string;
  options: string[];
  will: string;
}

export interface RoleplayEvaluation {
  passed: boolean;
  overallScore: number;
  breakdown: EvaluationBreakdown;
  values: EvaluationValues;
  growReport: GrowReport;
}

export interface RoleplayResultsProps {
  selectedScenario: Scenario;
  evaluation: RoleplayEvaluation;
  onRestart: (scenario: Scenario) => void;
  onExit: () => void;
}

export default function RoleplayResults({ 
  selectedScenario,
  evaluation,
  onRestart,
  onExit
}: RoleplayResultsProps) {
  const navigate = useNavigate();

  if (!evaluation) {
    return (
      <div className="flex-center p-xl">
        <Loader2 className="animate-spin text-bby-blue" size={32} />
      </div>
    );
  }

  const handleReturnToDashboard = () => {
    onExit();
    navigate('/');
  };

  return (
    <>
        <div className="flex-column gap-xl">
          
          {/* Header Bar */}
          <div className="glass-card flex justify-between items-center flex-wrap gap-md p-lg">
            <div>
              <h2 className="text-2xl mb-xs">Roleplay Performance Report</h2>
              <p className="text-secondary">Evaluated using Best Buy Consultative Sales Rubrics.</p>
            </div>
            <div className="flex gap-md">
              <button 
                className="btn btn-secondary cursor-pointer" 
                onClick={() => onRestart(selectedScenario)}
                data-testid="practice-again-btn"
              >
                <RefreshCw size={14} /> Practice Again
              </button>
              <button 
                className="btn btn-primary cursor-pointer" 
                onClick={handleReturnToDashboard}
                data-testid="return-dashboard-btn"
              >
                Return to Dashboard
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-xl">
            
            {/* Left Box: Score Dial & Passed Status */}
            <div className="glass-card flex-column items-center justify-center text-center p-2xl" data-testid="overall-score-container">
              <div className="relative w-[160px] h-[160px] flex items-center justify-center mb-xl">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    stroke={evaluation.passed ? "var(--success)" : "var(--error)"} 
                    strokeWidth="12" 
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={2 * Math.PI * 70 - (evaluation.overallScore / 100) * (2 * Math.PI * 70)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex-column items-center justify-center">
                  <span className="text-4xl font-extrabold font-heading">{evaluation.overallScore}%</span>
                  <span className="text-xs text-secondary">Score Rating</span>
                </div>
              </div>

              {evaluation.passed ? (
                <div className="flex-column items-center gap-xs">
                  <div className="flex items-center gap-xs text-bby-yellow font-bold text-xl font-heading">
                    <Sparkles size={24} fill="var(--bby-yellow)" /> PRACTICE TARGET MET!
                  </div>
                  <p className="text-sm text-secondary max-w-[280px]">
                    Congratulations! You scored 80% or higher and demonstrated full competency in consultative selling.
                  </p>
                </div>
              ) : (
                <div className="flex-column items-center gap-xs">
                  <div className="flex items-center gap-xs text-error font-bold text-xl font-heading">
                    <CheckCircle size={24} /> PRACTICE APPROVED
                  </div>
                  <p className="text-sm text-secondary max-w-[280px]">
                    Solid effort! Review the GROW options below and retry to improve your score. Goal is 80%+.
                  </p>
                </div>
              )}
            </div>

            {/* Middle Box: Sales Flow Stage Checklist Breakdown */}
            <div className="glass-card flex-column gap-lg">
              <h3 className="text-lg">Sales Flow Stage Breakdown</h3>
              
              <div className="gauge-row">
                <span>Connect (Greeting & Welcome)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill bg-bby-blue" style={{ width: `${evaluation.breakdown?.connect || 0}%` }} />
                </div>
                <span>{evaluation.breakdown?.connect || 0}%</span>
              </div>
              <div className="gauge-row">
                <span>Discover (Open-ended Questions)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill bg-info" style={{ width: `${evaluation.breakdown?.discover || 0}%` }} />
                </div>
                <span>{evaluation.breakdown?.discover || 0}%</span>
              </div>
              <div className="gauge-row">
                <span>Recommend (Product & Support Match)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill bg-bby-yellow" style={{ width: `${evaluation.breakdown?.recommend || 0}%` }} />
                </div>
                <span>{evaluation.breakdown?.recommend || 0}%</span>
              </div>
              <div className="gauge-row">
                <span>Protect (Geek Squad Protection / AppleCare)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill bg-success" style={{ width: `${evaluation.breakdown?.protect || 0}%` }} />
                </div>
                <span>{evaluation.breakdown?.protect || 0}%</span>
              </div>
              <div className="gauge-row">
                <span>Close (BBY Card Financing Pitch)</span>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill bg-error" style={{ width: `${evaluation.breakdown?.close || 0}%` }} />
                </div>
                <span>{evaluation.breakdown?.close || 0}%</span>
              </div>
            </div>

            {/* Right Box: Best Buy Core Values */}
            <div className="glass-card flex-column gap-xl">
              <h3 className="text-lg">Best Buy Human-Centric Values</h3>
              
              <div className="flex gap-md flex-wrap">
                <div className="flex-1 p-md bg-[#0046be]/5 border border-[#0046be]/15 rounded-xl text-center">
                  <div className="text-2xl font-extrabold text-white font-heading">{evaluation.values?.beHuman || 0}</div>
                  <div className="text-xs text-secondary font-semibold mt-1">Be Human</div>
                </div>
                <div className="flex-1 p-md bg-[#ffe600]/5 border border-[#ffe600]/15 rounded-xl text-center">
                  <div className="text-2xl font-extrabold text-white font-heading">{evaluation.values?.makeItEasy || 0}</div>
                  <div className="text-xs text-secondary font-semibold mt-1">Make it Easy</div>
                </div>
              </div>
              
              <div className="p-md bg-[#10b981]/5 border border-[#10b981]/15 rounded-xl text-center">
                <div className="text-2xl font-extrabold text-white font-heading">{evaluation.values?.showWhatPossible || 0}</div>
                <div className="text-xs text-secondary font-semibold mt-1">Show What's Possible</div>
              </div>
            </div>

          </div>

          {/* GROW Feedback Report Card */}
          <div className="glass-card flex-column gap-xl" data-testid="grow-report-container">
            <h3 className="text-xl flex items-center gap-sm text-bby-yellow">
              <Sparkles size={20} /> Actionable GROW Coaching Plan
            </h3>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2xl">
              <div>
                <h4 className="text-base mb-sm text-white">G - Coaching Goal</h4>
                <p className="text-sm text-secondary leading-relaxed">
                  {evaluation.growReport?.goal || 'No goal provided.'}
                </p>
              </div>
              <div>
                <h4 className="text-base mb-sm text-white">R - Current Reality</h4>
                <p className="text-sm text-secondary leading-relaxed">
                  {evaluation.growReport?.reality || 'No reality provided.'}
                </p>
              </div>
            </div>

            <div className="border-t border-border-glass pt-xl grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2xl">
              <div>
                <h4 className="text-base mb-md text-white">O - Options for Practice</h4>
                <ul className="text-sm text-secondary pl-5 flex-column gap-sm leading-relaxed">
                  {evaluation.growReport?.options?.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  )) || <li>No options provided.</li>}
                </ul>
              </div>
              <div>
                <h4 className="text-base mb-sm text-white">W - Advisor Will / Commitment</h4>
                <p className="text-sm text-secondary leading-relaxed italic">
                  {evaluation.growReport?.will || 'No commitment provided.'}
                </p>
              </div>
            </div>
          </div>

        </div>
    </>
  );
}
