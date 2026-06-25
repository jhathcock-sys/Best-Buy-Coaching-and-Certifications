import React from 'react';
import { Power, FileText } from 'lucide-react';

export type FloorLeaderTabType = 'tracker' | 'scheduler' | 'audit' | 'sim' | 'survey';

export interface FloorLeaderTabsProps {
  leaderTab: FloorLeaderTabType;
  setLeaderTab: (tab: FloorLeaderTabType) => void;
  handleEndShift: () => void;
  handleGenerateHandoff: () => void;
  isProcessing?: boolean;
}

export default function FloorLeaderTabs({ 
  leaderTab, 
  setLeaderTab, 
  handleEndShift, 
  handleGenerateHandoff,
  isProcessing = false
}: FloorLeaderTabsProps) {
  return (
    <>
          {/* Tab Selection Header bar with End Shift */}
          <div className="flex-between align-center border-b-glass flex-wrap gap-md pb-xs">
            <div className="flex-row gap-sm flex-wrap">
              <button
                className={`btn bg-transparent rounded-0 p-md-sm-lg font-bold text-sm cursor-pointer ${leaderTab === 'tracker' ? 'border-b-bby-blue text-white' : 'border-none text-muted'}`}
                data-testid="tab-tracker"
                onClick={() => setLeaderTab('tracker')}
              >
                Hourly Tracker
              </button>
              <button
                className={`btn bg-transparent rounded-0 p-md-sm-lg font-bold text-sm cursor-pointer ${leaderTab === 'scheduler' ? 'border-b-bby-blue text-white' : 'border-none text-muted'}`}
                data-testid="tab-scheduler"
                onClick={() => setLeaderTab('scheduler')}
              >
                Zones & Breaks Run Sheet
              </button>
              <button
                className={`btn bg-transparent rounded-0 p-md-sm-lg font-bold text-sm cursor-pointer ${leaderTab === 'audit' ? 'border-b-bby-blue text-white' : 'border-none text-muted'}`}
                data-testid="tab-audit"
                onClick={() => setLeaderTab('audit')}
              >
                Floor Audit (Vision)
              </button>
              <button
                className={`btn bg-transparent rounded-0 p-md-sm-lg font-bold text-sm cursor-pointer ${leaderTab === 'sim' ? 'border-b-bby-blue text-white' : 'border-none text-muted'}`}
                data-testid="tab-sim"
                onClick={() => setLeaderTab('sim')}
              >
                Shift Simulator
              </button>
              <button
                className={`btn bg-transparent rounded-0 p-md-sm-lg font-bold text-sm cursor-pointer ${leaderTab === 'survey' ? 'border-b-bby-blue text-white' : 'border-none text-muted'}`}
                data-testid="tab-survey"
                onClick={() => setLeaderTab('survey')}
              >
                5-Star Detractor Coach
              </button>
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                className="btn btn-secondary btn-sm flex-center" 
                data-testid="btn-generate-handoff"
                onClick={handleGenerateHandoff}
                disabled={isProcessing}
              >
                <FileText size={16} color="var(--bby-blue)" /> Generate Handoff
              </button>
              <button 
                className="btn btn-sm bg-error-alpha border-error-alpha text-error flex-center" 
                data-testid="btn-end-shift"
                onClick={handleEndShift}
                disabled={isProcessing}
              >
                <Power size={14} /> End Shift
              </button>
            </div>
          </div>
    </>
  );
}
