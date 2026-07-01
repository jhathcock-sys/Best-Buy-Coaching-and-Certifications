import React from 'react';
import { Award, CheckCircle } from 'lucide-react';
import { Employee } from '../../types';

interface TrophyCaseProps {
  employee: Employee;
}

export default function TrophyCase({ employee }: TrophyCaseProps) {
  const getTrophyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Award size={20} color="var(--bby-yellow)" />;
      case 'ShieldCheck': return <CheckCircle size={20} color="var(--success)" />;
      default: return <Award size={20} color="var(--bby-yellow)" />;
    }
  };

  return (
    <div className="bg-surface rounded-20 border-glass p-lg" data-testid="trophy-case-widget">
      <h2 className="text-xl font-bold mb-md flex-center gap-sm justify-start">
        <Award size={20} color="var(--primary)" />
        My Trophy Case
      </h2>
      {(!employee.trophies || employee.trophies.length === 0) ? (
        <div className="p-2xl text-center text-muted" data-testid="no-trophies-message">
          No trophies yet. Keep practicing in the AI Simulator!
        </div>
      ) : (
        <div className="grid-auto-fill-150 gap-md">
          {employee.trophies.map((trophy, idx) => (
            <div key={idx} className="bg-white-alpha-02 p-md rounded-xl border-white-alpha-05 text-center" data-testid="trophy-item">
              <div className="flex-center mb-sm">
                {getTrophyIcon(trophy.icon)}
              </div>
              <div className="text-sm font-semibold text-white mb-xs">{trophy.type}</div>
              <div className="text-xs text-secondary">{trophy.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
