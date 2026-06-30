import React, { useState } from 'react';
import { AlertCircle, CheckCircle, FileText, Save, Sparkles, Star, Copy } from 'lucide-react';

interface AuditResultData {
  rating?: number;
  associateName?: string;
  department?: string;
  rootCause: string;
  coachingScript: string;
  checkItems?: string[];
}

interface AuditorResultsProps {
  isAuditing: boolean;
  auditResult: AuditResultData | null;
  isSaved: boolean;
  handleSaveToLogs: () => void;
}

export default function AuditorResults({
  isAuditing,
  auditResult,
  isSaved,
  handleSaveToLogs
}: AuditorResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (auditResult?.coachingScript) {
      navigator.clipboard.writeText(auditResult.coachingScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-column gap-xl">
      
      {isAuditing && (
        <div className="glass-card flex-1 flex-column gap-lg p-xl justify-center" data-testid="auditor-loading">
          <div className="skeleton-pulse rounded-md h-24px w-50 bg-white-alpha-08"></div>
          <div className="skeleton-pulse rounded-sm h-14px w-90 bg-white-alpha-05"></div>
          <div className="skeleton-pulse rounded-sm h-14px w-80 bg-white-alpha-05"></div>
          <div className="skeleton-pulse rounded-sm h-14px w-85 bg-white-alpha-05"></div>
          <div className="flex-column align-center gap-sm mt-xl text-secondary">
            <Sparkles size={24} className="spin" color="var(--bby-yellow)" />
            <span className="text-xs font-bold">Gemini is auditing customer detractor survey...</span>
          </div>
        </div>
      )}

      {!isAuditing && !auditResult && (
        <div className="glass-card flex-1 flex-column align-center justify-center p-xxl text-center text-muted" data-testid="auditor-empty">
          <AlertCircle size={36} className="mb-md" />
          <p className="text-sm">Upload a survey screenshot or copy customer feedback, then run the audit to generate coaching steps.</p>
        </div>
      )}

      {!isAuditing && auditResult && (
        <div className="glass-card flex-1 flex-column gap-xl p-xl" data-testid="auditor-results">
          <div className="flex-between align-center flex-wrap gap-sm pb-sm border-b-glass">
            <h3 className="text-lg font-bold flex-row align-center gap-sm">
              <FileText size={18} color="var(--info)" /> Audit & Detractor Script
            </h3>
            <div className="flex-row align-center gap-xs">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  color={star <= (auditResult.rating || 0) ? 'var(--bby-yellow)' : 'var(--text-muted)'}
                  fill={star <= (auditResult.rating || 0) ? 'var(--bby-yellow)' : 'transparent'}
                />
              ))}
              <span className="text-xs font-bold text-bby-yellow ml-xs">
                ({auditResult.rating || 0} / 5 Rating)
              </span>
            </div>
          </div>

          <div className="grid-cols-2 gap-md">
            <div className="p-sm bg-white-alpha-02 border-glass rounded-md">
              <span className="text-xs text-secondary font-bold uppercase">Associate Mentioned</span>
              <p className="text-sm font-bold text-white mt-xs">
                {auditResult.associateName || 'Unknown'}
              </p>
            </div>
            <div className="p-sm bg-white-alpha-02 border-glass rounded-md">
              <span className="text-xs text-secondary font-bold uppercase">Department</span>
              <p className="text-sm font-bold text-info mt-xs">
                {auditResult.department || 'General Sales'}
              </p>
            </div>
          </div>

          <div className="p-md rounded-md bg-error-alpha border-error-alpha">
            <span className="text-xs text-error font-bold uppercase">GM Root-Cause Breakdown</span>
            <p className="text-sm text-secondary mt-xs leading-relaxed">
              {auditResult.rootCause || 'No root cause identified.'}
            </p>
          </div>

          <div className="p-md rounded-md bg-bby-blue-alpha-10 border-bby-blue-alpha-20">
            <div className="flex-between align-center mb-xs">
              <span className="text-xs text-info font-bold uppercase">GROW Coaching Script</span>
              <button 
                className="btn btn-secondary text-xs h-auto cursor-pointer p-xs" 
                onClick={handleCopy}
                data-testid="copy-script-btn"
              >
                {copied ? <span className="flex-row gap-xs text-success"><CheckCircle size={12}/> Copied!</span> : <span className="flex-row gap-xs"><Copy size={12}/> Copy Script</span>}
              </button>
            </div>
            <p className="text-sm text-white italic leading-relaxed">
              "{auditResult.coachingScript || 'No coaching script provided.'}"
            </p>
          </div>

          <div>
            <span className="text-xs text-secondary font-bold uppercase block mb-sm">
              Leader Floor Verification Items
            </span>
            <div className="flex-column gap-sm">
              {auditResult.checkItems?.map((item, idx) => (
                <div key={idx} className="flex-row gap-sm align-start text-sm text-secondary leading-relaxed">
                  <div className="text-success rounded-full flex-row bg-success-alpha-15 p-xs mt-0-1rem">
                    <CheckCircle size={10} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-row gap-md mt-sm pt-xl border-t-glass">
            <button 
              className="btn btn-primary flex-1 flex-center gap-sm p-md cursor-pointer" 
              onClick={handleSaveToLogs}
              disabled={isSaved}
              data-testid="save-logs-btn"
            >
              {isSaved ? (
                <>
                  <CheckCircle size={15} /> Logged Successfully!
                </>
              ) : (
                <>
                  <Save size={15} /> Save to Coaching Logs
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
