import React from 'react';
import { Target } from 'lucide-react';

interface MetricGoal {
  actual: number;
  goal: number;
}

interface GoalsSlideProps {
  storeGoals: {
    pms?: MetricGoal;
    apps?: MetricGoal;
  } | null;
}

export default function GoalsSlide({ storeGoals }: GoalsSlideProps) {
  if (!storeGoals) return null;

  const pmsActual = storeGoals.pms?.actual || 0;
  const pmsGoal = storeGoals.pms?.goal || 1; // Prevent division by zero
  const appsActual = storeGoals.apps?.actual || 0;
  const appsGoal = storeGoals.apps?.goal || 1;

  const pmsPercent = Math.min(100, (pmsActual / pmsGoal) * 100);
  const appsPercent = Math.min(100, (appsActual / appsGoal) * 100);

  return (
    <div className="slide-fade-in flex-column flex-center h-full w-full" data-testid="goals-slide">
      <h2 className="text-4xl text-white mb-xl flex align-center justify-center gap-md font-heading m-0 text-center">
        <Target size={48} className="text-bby-blue" /> Daily Store Goals
      </h2>
      
      <div className="flex-row justify-center gap-xl">
        <div className="glass-card p-xl flex-column w-400px" data-testid="memberships-goal-card">
          <h3 className="text-lg text-secondary uppercase tracking-widest font-heading m-0">Memberships</h3>
          <div className={`text-6xl font-bold my-md ${pmsActual >= pmsGoal ? 'text-success' : 'text-white'}`}>
            {pmsActual} <span className="text-2xl text-muted font-normal">/ {pmsGoal}</span>
          </div>
          <div className="bg-white-alpha-10 h-3 rounded-full overflow-hidden w-full relative">
            <div 
              className={`h-full transition-normal ${pmsActual >= pmsGoal ? 'bg-success' : 'bg-bby-blue'}`}
              style={{ width: `${pmsPercent}%` }}
              data-testid="memberships-progress-bar"
            />
          </div>
        </div>

        <div className="glass-card p-xl flex-column w-400px" data-testid="credit-cards-goal-card">
          <h3 className="text-lg text-secondary uppercase tracking-widest font-heading m-0">Credit Cards</h3>
          <div className={`text-6xl font-bold my-md ${appsActual >= appsGoal ? 'text-success' : 'text-white'}`}>
            {appsActual} <span className="text-2xl text-muted font-normal">/ {appsGoal}</span>
          </div>
          <div className="bg-white-alpha-10 h-3 rounded-full overflow-hidden w-full relative">
            <div 
              className={`h-full transition-normal ${appsActual >= appsGoal ? 'bg-success' : 'bg-bby-yellow'}`}
              style={{ width: `${appsPercent}%` }}
              data-testid="credit-cards-progress-bar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
