import React from 'react';
import { FileText, Copy, Check, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
}) {
  const currentText = outputViewMode === 'grow' ? coachingLogText : huddleScriptText;

  return (
    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--info)" /> Coaching Log Preview
        </h3>
        <span className="tag-pill" style={{ fontSize: '0.7rem' }}>Best Buy Standard Layout</span>
      </div>

      {isGeneratingLog ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.5rem',
          background: 'rgba(11,15,25,0.7)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
          minHeight: '400px',
          justifyContent: 'center'
        }}>
          {/* Pulsing skeleton bars */}
          <div className="skeleton-pulse" style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          
          <div className="skeleton-pulse" style={{ height: '20px', width: '45%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginTop: '1.25rem' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '95%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          
          <div className="skeleton-pulse" style={{ height: '20px', width: '50%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginTop: '1.25rem' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '88%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.5rem' }}></div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button 
              className={`btn ${outputViewMode === 'grow' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', boxShadow: 'none' }}
              onClick={() => setOutputViewMode('grow')}
            >
              📋 GROW Plan
            </button>
            <button 
              className={`btn ${outputViewMode === 'huddle' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', boxShadow: 'none' }}
              onClick={() => setOutputViewMode('huddle')}
            >
              💬 Huddle Script
            </button>
          </div>

          <div className="markdown-body" style={{
            flex: 1,
            padding: '1.5rem',
            background: 'rgba(11,15,25,0.7)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            minHeight: '400px',
            whiteSpace: 'pre-wrap',
            fontFamily: outputViewMode === 'grow' ? 'monospace' : 'inherit'
          }}>
            <ReactMarkdown>{currentText}</ReactMarkdown>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                background: copySuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                color: copySuccess ? 'var(--success)' : '#fff',
                borderColor: copySuccess ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)'
              }}
              onClick={() => handleCopyToClipboard(currentText)}
            >
              {copySuccess ? <Check size={18} /> : <Copy size={18} />}
              {copySuccess ? 'Copied to Clipboard!' : 'Copy Document to Clipboard'}
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                borderColor: 'var(--bby-yellow)',
                color: 'var(--bby-yellow)',
                background: isPlayingSpeech ? 'rgba(255, 230, 0, 0.1)' : 'transparent'
              }}
              title="Read Aloud"
              onClick={() => handleSpeech(currentText)}
            >
              {isPlayingSpeech && !isPausedSpeech ? (
                <>
                  <Volume2 size={18} className="pulse-animation" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Playing...</span>
                </>
              ) : isPlayingSpeech && isPausedSpeech ? (
                <>
                  <Volume2 size={18} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Paused</span>
                </>
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            {isPlayingSpeech && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.75rem 1rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                onClick={handleStopSpeech}
                title="Stop Audio"
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
