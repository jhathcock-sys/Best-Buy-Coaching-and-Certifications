import React from 'react';
import { CompletedSteps } from './RoleplayActiveSession';

interface RoleplayProgressBarProps {
  completedSteps: CompletedSteps;
  currentActiveStep: string;
}

export default function RoleplayProgressBar({ completedSteps, currentActiveStep }: RoleplayProgressBarProps) {
  const getProgressWidth = () => {
    if (completedSteps?.close) return 100;
    if (completedSteps?.protect) return 80;
    if (completedSteps?.recommend) return 60;
    if (completedSteps?.discover) return 40;
    if (completedSteps?.connect) return 20;
    return 0;
  };

  return (
    <div className="glass-card p-xl">
      <div className="sales-flow-tracker">
        <div 
          className="sales-flow-progress-bar" 
          style={{ width: `${getProgressWidth()}%` }} 
        />
        <div className={`flow-step ${completedSteps?.connect ? 'completed' : currentActiveStep === 'connect' ? 'active' : 'pending'}`}>
          <div className="flow-node">1</div>
          <div className="flow-label">Connect</div>
        </div>
        <div className={`flow-step ${completedSteps?.discover ? 'completed' : currentActiveStep === 'discover' ? 'active' : 'pending'}`}>
          <div className="flow-node">2</div>
          <div className="flow-label">Discover</div>
        </div>
        <div className={`flow-step ${completedSteps?.recommend ? 'completed' : currentActiveStep === 'recommend' ? 'active' : 'pending'}`}>
          <div className="flow-node">3</div>
          <div className="flow-label">Recommend</div>
        </div>
        <div className={`flow-step ${completedSteps?.protect ? 'completed' : currentActiveStep === 'protect' ? 'active' : 'pending'}`}>
          <div className="flow-node">4</div>
          <div className="flow-label">Protect</div>
        </div>
        <div className={`flow-step ${completedSteps?.close ? 'completed' : currentActiveStep === 'close' ? 'active' : 'pending'}`}>
          <div className="flow-node">5</div>
          <div className="flow-label">Close</div>
        </div>
      </div>
    </div>
  );
}
