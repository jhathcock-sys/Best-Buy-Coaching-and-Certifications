import React from 'react';
import { Power, FileText } from 'lucide-react';

export default function FloorLeaderTabs({ leaderTab, setLeaderTab, handleEndShift, handleGenerateHandoff }: any) {
  return (
    <>
          {/* Tab Selection Header bar with End Shift */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'tracker' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'tracker' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('tracker')}
              >
                Hourly Tracker
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'scheduler' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'scheduler' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('scheduler')}
              >
                Zones & Breaks Run Sheet
              </button>
              <button
                className="btn"
                data-testid="tab-audit"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'audit' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'audit' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('audit')}
              >
                Floor Audit (Vision)
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'sim' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'sim' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('sim')}
              >
                Shift Simulator
              </button>
              <button
                className="btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leaderTab === 'survey' ? '2.5px solid var(--bby-blue)' : 'none',
                  color: leaderTab === 'survey' ? '#fff' : 'var(--text-muted)',
                  borderRadius: 0,
                  padding: '0.75rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={() => setLeaderTab('survey')}
              >
                5-Star Detractor Coach
              </button>

            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm flex-center" onClick={handleGenerateHandoff}>
                <FileText size={16} color="var(--bby-blue)" /> Generate Handoff
              </button>
              <button className="btn btn-sm bg-error-alpha border-error-alpha text-error flex-center" onClick={handleEndShift}>
                <Power size={14} /> End Shift
              </button>
            </div>
          </div>
    </>
  );
}
