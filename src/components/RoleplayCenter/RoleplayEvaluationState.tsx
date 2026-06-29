import React from 'react';
import { Sparkles } from 'lucide-react';

export default function RoleplayEvaluationState() {
  return (
    <div className="glass-card flex-column flex-center gap-xl p-[3rem] min-h-[500px] text-center" data-testid="evaluating-state">
      <div className="relative w-[120px] h-[120px]">
        <div className="skeleton-pulse absolute top-0 left-0 w-full h-full rounded-full border-[8px] border-[rgba(255,230,0,0.05)] border-t-[var(--bby-yellow)] animate-spin"></div>
        <div className="flex-center w-full h-full">
          <Sparkles size={36} className="text-bby-yellow typing-dots" />
        </div>
      </div>
      
      <div className="max-w-[450px] flex-column gap-sm">
        <h3 className="text-xl text-white font-bold">AI Performance Audit in progress</h3>
        <p className="text-sm text-secondary leading-relaxed">
          Gemini is grading your consultative discovery questions, verifying your membership values pitch, checking GSP warranty attachments, and parsing final credit card close rewards.
        </p>
      </div>

      <div className="w-full max-w-[300px] flex-column gap-sm mt-md">
        <div className="skeleton-pulse h-[12px] w-full bg-white-alpha-05 rounded-md"></div>
        <div className="skeleton-pulse h-[12px] w-4/5 bg-white-alpha-05 rounded-md self-center"></div>
      </div>
    </div>
  );
}
