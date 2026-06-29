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
          <div className="skeleton-pulse rounded-xl h-24px w-50 bg-white-alpha-08"></div>
          <div className="skeleton-pulse rounded-xl h-14px w-90 bg-white-alpha-05"></div>
          <div className="skeleton-pulse rounded-xl h-14px w-80 bg-white-alpha-05"></div>
          <div className="skeleton-pulse rounded-xl h-14px w-85 bg-white-alpha-05"></div>
          <div className="flex-column align-center gap-sm mt-lg text-secondary">
            <Sparkles size={24} className="spin text-bby-yellow" />
            <span className="font-bold text-sm">Gemini is auditing visual floor layout...</span>
          </div>
        </div>
      )}

      {!isAuditing && errorMsg && (
        <div className="glass-card flex-column align-center justify-center p-xl text-center text-error h-full border-error-alpha">
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
            <h3 className="flex-center gap-sm text-lg font-heading">
              <FileText size={18} className="text-info" /> Audit Report Summary
            </h3>
            <span className={`font-bold text-sm px-md py-xs rounded-full border-solid border-1 ${
              auditResult.status === 'Green' ? 'bg-success-glow text-success border-success-alpha' : 
              auditResult.status === 'Yellow' ? 'bg-warning-glow text-warning border-warning-alpha' : 
              'bg-error-glow text-error border-error-alpha'
            }`}>
              {auditResult.status.toUpperCase()} STATUS
            </span>
          </div>

          <div className="p-md rounded-xl border-glass bg-white-alpha-05">
            <span className="text-muted font-bold uppercase tracking-wide text-xs">Summary State</span>
            <p className="text-white mt-xs text-sm line-height-relaxed">{auditResult.statusDetails}</p>
          </div>

          <div>
            <span className="text-secondary font-bold uppercase mb-sm tracking-wide text-xs d-block">
              Visual Observations ({auditResult.observations?.length || 0})
            </span>
            <ul className="flex-column gap-sm pl-xl">
              {(auditResult.observations || []).map((obs, idx) => (
                <li key={idx} className="text-secondary text-sm line-height-relaxed">{obs}</li>
              ))}
            </ul>
          </div>

          <div className="border-glass-top pt-xl">
            <span className="text-secondary font-bold uppercase mb-sm tracking-wide text-xs d-block">
              Immediate Leader Action Plan
            </span>
            <div className="flex-column gap-sm">
              {(auditResult.actionPlan || []).map((act, idx) => (
                <div key={idx} className="flex-row gap-sm align-start p-md rounded-xl border-glass bg-success-alpha-15">
                  <div className="flex-center bg-success-glow text-success rounded-full p-xs">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-secondary text-sm line-height-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-column gap-md border-glass-top pt-xl">
            {!huddleScript ? (
              <button className="btn btn-accent w-full text-black p-md cursor-pointer" data-testid="generate-huddle-btn" onClick={handleGenerateHuddleScript} disabled={isGeneratingScript}>
                {isGeneratingScript ? 'Generating Huddle Script...' : 'Compile Huddle Script from Audit'}
              </button>
            ) : (
              <div className="flex-column gap-sm">
                <div className="flex-between">
                  <span className="text-secondary font-bold uppercase tracking-wide text-xs">Huddle Announcement Script</span>
                  <button className="btn btn-secondary flex-center gap-sm px-sm py-xs text-xs h-auto cursor-pointer" onClick={copyScript} data-testid="copy-script-btn">
                    <ClipboardCopy size={12} /> Copy Script
                  </button>
                </div>
                <textarea 
                  readOnly 
                  rows={6} 
                  data-testid="huddle-script-output"
                  className="w-full p-md rounded-xl bg-white-alpha-05 text-white border-glass text-xs font-mono resize-none"
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
