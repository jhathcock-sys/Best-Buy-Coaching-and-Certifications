import React from 'react';
import { FileText, Copy, Check, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface LogPreviewProps {
  isGeneratingLog: boolean;
  outputViewMode: string;
  setOutputViewMode: React.Dispatch<React.SetStateAction<string>>;
  coachingLogText: string;
  huddleScriptText: string;
  copySuccess: boolean;
  handleCopyToClipboard: (text: string) => void;
  isPlayingSpeech: boolean;
  isPausedSpeech: boolean;
  handleSpeech: (text: string) => void;
  handleStopSpeech: () => void;
}

export default function LogPreview({
  isGeneratingLog,
  outputViewMode,
  setOutputViewMode,
  coachingLogText,
  huddleScriptText,
  copySuccess,
  handleCopyToClipboard,
  isPlayingSpeech,
  isPausedSpeech,
  handleSpeech,
  handleStopSpeech
}: LogPreviewProps) {
  const currentText = outputViewMode === 'grow' ? coachingLogText : huddleScriptText;
  const safeText = currentText || '';

  return (
    <div className="glass-card flex-column" style={{ flex: 1 }} data-testid="log-preview-container">
      <div className="flex-row justify-between items-center mb-md">
        <h3 className="flex-row items-center gap-sm text-lg">
          <FileText size={18} className="text-info" /> Coaching Log Preview
        </h3>
        <span className="tag-pill text-xs">Best Buy Standard Layout</span>
      </div>

      {isGeneratingLog ? (
        <div className="flex-column gap-xl p-xl bg-obsidian-alpha border border-glass rounded-xl justify-center" style={{ minHeight: '400px' }}>
          {/* Pulsing skeleton bars */}
          <div className="skeleton-pulse rounded-md" style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.08)' }}></div>
          <div className="skeleton-pulse rounded-sm mt-sm" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="skeleton-pulse rounded-sm" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="skeleton-pulse rounded-sm" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.05)' }}></div>
          
          <div className="skeleton-pulse rounded-md mt-xl" style={{ height: '20px', width: '45%', background: 'rgba(255,255,255,0.08)' }}></div>
          <div className="skeleton-pulse rounded-sm mt-sm" style={{ height: '14px', width: '95%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="skeleton-pulse rounded-sm" style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.05)' }}></div>
          
          <div className="skeleton-pulse rounded-md mt-xl" style={{ height: '20px', width: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
          <div className="skeleton-pulse rounded-sm mt-sm" style={{ height: '14px', width: '88%', background: 'rgba(255,255,255,0.05)' }}></div>
        </div>
      ) : (
        <div className="flex-column flex-1">
          
          <div className="flex-row mb-md p-xs bg-white-alpha-02 rounded-lg border border-glass">
            <button 
              className={`btn ${outputViewMode === 'grow' ? 'btn-primary' : 'btn-secondary'} flex-1 p-sm text-sm no-shadow cursor-pointer`}
              onClick={() => setOutputViewMode('grow')}
              data-testid="btn-grow-plan"
            >
              📋 GROW Plan
            </button>
            <button 
              className={`btn ${outputViewMode === 'huddle' ? 'btn-primary' : 'btn-secondary'} flex-1 p-sm text-sm no-shadow cursor-pointer`}
              onClick={() => setOutputViewMode('huddle')}
              data-testid="btn-huddle-script"
            >
              💬 Huddle Script
            </button>
          </div>

          <div className="markdown-body p-xl bg-obsidian-alpha border border-glass rounded-xl text-sm leading-relaxed whitespace-pre-wrap flex-1" style={{
            minHeight: '400px',
            fontFamily: outputViewMode === 'grow' ? 'monospace' : 'inherit'
          }}>
            <ReactMarkdown>{safeText}</ReactMarkdown>
          </div>

          <div className="flex-row gap-sm mt-md">
            <button 
              className="btn btn-secondary flex-1 p-md flex-center gap-sm cursor-pointer" 
              style={{
                background: copySuccess ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-obsidian)',
                color: copySuccess ? 'var(--success-glow)' : '#fff',
                borderColor: copySuccess ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)'
              }}
              onClick={() => handleCopyToClipboard(safeText)}
              data-testid="btn-copy-clipboard"
            >
              {copySuccess ? <Check size={18} /> : <Copy size={18} />}
              {copySuccess ? 'Copied to Clipboard!' : 'Copy Document to Clipboard'}
            </button>
            <button 
              className="btn btn-secondary px-md py-md flex-center gap-sm cursor-pointer" 
              style={{
                borderColor: 'var(--bby-yellow)',
                color: 'var(--bby-yellow)',
                background: isPlayingSpeech ? 'rgba(255, 230, 0, 0.1)' : 'transparent'
              }}
              title="Read Aloud"
              onClick={() => handleSpeech(safeText)}
              data-testid="btn-read-aloud"
            >
              {isPlayingSpeech && !isPausedSpeech ? (
                <>
                  <Volume2 size={18} className="pulse-animation" />
                  <span className="text-xs font-semibold">Playing...</span>
                </>
              ) : isPlayingSpeech && isPausedSpeech ? (
                <>
                  <Volume2 size={18} className="opacity-50" />
                  <span className="text-xs font-semibold">Paused</span>
                </>
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            {isPlayingSpeech && (
              <button 
                className="btn btn-secondary px-md py-md cursor-pointer" 
                style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                onClick={handleStopSpeech}
                title="Stop Audio"
                data-testid="btn-stop-audio"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
