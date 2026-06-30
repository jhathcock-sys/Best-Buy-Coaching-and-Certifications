import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

interface StepHint {
  title: string;
  hint: string;
}

interface RoleplaySidebarCoachProps {
  stepHint: StepHint;
  selectedScenario: any;
}

export default function RoleplaySidebarCoach({ stepHint, selectedScenario }: RoleplaySidebarCoachProps) {
  return (
    <div className="flex-column gap-md" data-testid="sidebar-coach">
      <div className="glass-card border-[rgba(0,70,190,0.3)] bg-[rgba(0,70,190,0.05)]">
        <h4 className="text-base text-bby-yellow flex-center-y gap-sm mb-sm">
          <Sparkles size={16} /> Live Coaching Guide
        </h4>
        <div className="border-b border-white-alpha-05 pb-sm mb-sm">
          <h5 className="text-sm text-white mb-xs">{stepHint?.title}</h5>
          <p className="text-xs text-secondary leading-relaxed">{stepHint?.hint}</p>
        </div>
        <div>
          <h5 className="text-sm text-white mb-xs flex-center-y gap-xs">
            <BookOpen size={12} /> Pro-Tip Checklist
          </h5>
          <ul className="text-xs text-muted pl-lg flex-column gap-xs leading-relaxed list-disc">
            <li>Avoid saying "warranty"—use "protection package" or "peace of mind."</li>
            <li>Always offer My Best Buy Total or Plus options on premium hardware.</li>
            <li>Highlight 10% back in rewards or financing to overcome price hurdles.</li>
          </ul>
        </div>
      </div>

      <div className="glass-card">
        <h4 className="text-sm mb-sm">Customer Profile</h4>
        <p className="text-xs text-secondary mb-xs"><strong>Needs:</strong> {selectedScenario?.needs}</p>
        <p className="text-xs text-secondary italic"><strong>Style:</strong> {selectedScenario?.difficulty === 'Easy' ? 'Quickly cooperative' : 'Will bring up multiple financial/risk objections.'}</p>
      </div>
    </div>
  );
}
