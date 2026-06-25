import { useState, useCallback } from 'react';
import { AlertCircle, Sparkles, FileText, CheckCircle, ClipboardCopy } from 'lucide-react';

interface AuditResult {
  status: 'Green' | 'Yellow' | 'Red';
  statusDetails: string;
  observations: string[];
  actionPlan: string[];
}

interface Props {
  isAuditing: boolean;
  auditResult: AuditResult | null;
  errorMsg: string | null;
}

export default function FloorAuditReport({ isAuditing, auditResult, errorMsg }: Props) {
  const [huddleScript, setHuddleScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const handleGenerateHuddleScript = useCallback(async () => {
    if (!auditResult) return;
    setIsGeneratingScript(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const script = `## 💬 Live Leadership Huddle Script: Visual Floor Actions

"Team, listen up. I just did a quick walk of our floor layout, and we have a couple of immediate adjustments to make:

👉 **Observations:** We currently see: ${auditResult.observations?.[0] || 'bottlenecks forming'}. Also, ${auditResult.observations?.[1] || 'shoppers needing assistance'}.
🎯 **Our Action Plan:** 
1. ${auditResult.actionPlan?.[0] || 'Clear queue immediately.'}
2. ${auditResult.actionPlan?.[1] || 'Reposition staffing to coverage gaps.'}
3. ${auditResult.actionPlan?.[2] || 'Tidy up display tables.'}

Let's move fast, get our customers greeted, and ensure checkout remains smooth. Thank you, let's crush the shift!"`;

      setHuddleScript(script);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [auditResult]);

  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(huddleScript);
    // Ideally use toast, but alert is what was used in the original
    // For a better experience, if toast was available we could use it, but keeping it simple.
  }, [huddleScript]);

  return (
    <div className="flex-column gap-lg h-full">
      {isAuditing && (
        <div className="glass-card flex-column justify-center gap-lg p-xl h-full">
          <div className="skeleton-pulse rounded-xl" style={{ height: '24px', width: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
          <div className="skeleton-pulse rounded-xl" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="skeleton-pulse rounded-xl" style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="skeleton-pulse rounded-xl" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="flex-column align-center gap-sm mt-lg text-secondary">
            <Sparkles size={24} className="typing-dots text-bby-yellow" />
            <span className="font-semibold text-sm">Gemini is auditing visual floor layout...</span>
          </div>
        </div>
      )}

      {!isAuditing && errorMsg && (
        <div className="glass-card flex-column align-center justify-center p-xl text-center text-error h-full" style={{ borderColor: 'var(--error-alpha-15)' }}>
          <AlertCircle size={36} className="mb-md" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {!isAuditing && !auditResult && !errorMsg && (
        <div className="glass-card flex-column align-center justify-center p-xl text-center text-muted h-full">
          <AlertCircle size={36} className="mb-md" />
          <p className="text-sm">Upload or select a demo floor snapshot, then run the audit to see general manager recommendations.</p>
        </div>
      )}

      {!isAuditing && auditResult && !errorMsg && (
        <div className="glass-card flex-column gap-lg" data-testid="audit-report">
          <div className="flex-between flex-wrap gap-sm">
            <h3 className="flex-center gap-sm text-lg">
              <FileText size={18} className="text-info" /> Audit Report Summary
            </h3>
            <span className="font-bold text-sm" style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid',
              background: auditResult.status === 'Green' ? 'var(--success-glow)' : auditResult.status === 'Yellow' ? 'var(--warning-glow)' : 'var(--error-glow)',
              color: auditResult.status === 'Green' ? 'var(--success)' : auditResult.status === 'Yellow' ? 'var(--warning)' : 'var(--error)',
              borderColor: auditResult.status === 'Green' ? 'rgba(16,185,129,0.2)' : auditResult.status === 'Yellow' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
            }}>
              {auditResult.status.toUpperCase()} STATUS
            </span>
          </div>

          <div className="p-md rounded-xl border-glass bg-white-alpha-05">
            <span className="text-muted font-bold uppercase tracking-wide" style={{ fontSize: '0.7rem' }}>Summary State</span>
            <p className="text-white mt-xs text-sm leading-relaxed">{auditResult.statusDetails}</p>
          </div>

          <div>
            <span className="text-secondary font-bold uppercase mb-sm tracking-wide" style={{ fontSize: '0.725rem', display: 'block' }}>
              Visual Observations ({auditResult.observations?.length || 0})
            </span>
            <ul className="flex-column gap-sm" style={{ paddingLeft: '1.25rem' }}>
              {(auditResult.observations || []).map((obs, idx) => (
                <li key={idx} className="text-secondary text-sm leading-relaxed">{obs}</li>
              ))}
            </ul>
          </div>

          <div className="border-glass" style={{ borderTopWidth: '1px', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', paddingTop: '1.25rem' }}>
            <span className="text-secondary font-bold uppercase mb-sm tracking-wide" style={{ fontSize: '0.725rem', display: 'block' }}>
              Immediate Leader Action Plan
            </span>
            <div className="flex-column gap-sm">
              {(auditResult.actionPlan || []).map((act, idx) => (
                <div key={idx} className="flex-row gap-sm align-start p-md rounded-xl border-glass bg-success-alpha-15">
                  <div className="flex-center bg-success-glow text-success rounded-full" style={{ padding: '0.2rem' }}>
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-secondary text-sm leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-column gap-md border-glass" style={{ borderTopWidth: '1px', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', paddingTop: '1.25rem' }}>
            {!huddleScript ? (
              <button className="btn btn-accent w-full text-black" data-testid="generate-huddle-btn" onClick={handleGenerateHuddleScript} disabled={isGeneratingScript}>
                {isGeneratingScript ? 'Generating Huddle Script...' : 'Compile Huddle Script from Audit'}
              </button>
            ) : (
              <div className="flex-column gap-sm">
                <div className="flex-between">
                  <span className="text-secondary font-bold uppercase tracking-wide" style={{ fontSize: '0.725rem' }}>Huddle Announcement Script</span>
                  <button className="btn btn-secondary flex-center gap-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto' }} onClick={copyScript}>
                    <ClipboardCopy size={12} /> Copy Script
                  </button>
                </div>
                <textarea 
                  readOnly 
                  rows={6} 
                  data-testid="huddle-script-output"
                  className="w-full p-md rounded-xl bg-white-alpha-05 text-white border-glass"
                  style={{ fontSize: '0.8rem', fontFamily: 'monospace', resize: 'none' }}
                  value={huddleScript}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
