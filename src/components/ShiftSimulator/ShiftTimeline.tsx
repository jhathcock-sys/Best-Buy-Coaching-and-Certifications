import React from 'react';
import { FileText } from 'lucide-react';
import { SimulationResult } from './types';

interface ShiftTimelineProps {
  logs: SimulationResult['shiftLogs'];
}

export default function ShiftTimeline({ logs }: ShiftTimelineProps) {
  return (
    <div className="glass-card flex flex-col gap-md max-h-[380px] overflow-y-auto" data-testid="shift-timeline-container">
      <h3 className="text-base flex items-center gap-sm sticky top-0 bg-bg-space/80 backdrop-blur-md z-10 py-xs border-b border-glass mb-xs">
        <FileText size={18} color="var(--info)" /> Shift Chronological Log
      </h3>
      <div className="flex flex-col gap-lg mt-xs">
        {logs?.map((log, idx) => (
          <div key={idx} className="flex gap-md border-l-2 border-glass pl-md">
            <div className="flex flex-col gap-xs flex-1">
              <div className="flex justify-between items-center flex-wrap gap-sm">
                <span className="text-xs font-bold text-bby-yellow">
                  {log?.hour} — {log?.zone}
                </span>
                <span className="text-[0.65rem] text-muted">
                  {log?.impact}
                </span>
              </div>
              <p className="text-sm text-white m-0 py-xs leading-relaxed">
                {log?.event}
              </p>
              <p className="text-xs text-secondary italic m-0">
                <strong className="text-info/80">Staffing Impact:</strong> {log?.advisorResponse}
              </p>
            </div>
          </div>
        ))}
        {(!logs || logs.length === 0) && (
          <div className="text-center text-sm text-muted py-xl italic">
            No shift logs generated yet.
          </div>
        )}
      </div>
    </div>
  );
}
