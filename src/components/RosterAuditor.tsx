import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, FileText, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { auditPerformanceWorkbookGemini } from '../services/ai';
import { Employee } from '../types';

export interface AuditResult {
  overallSummary: string;
  topPerformers: string[];
  gapClusters: Array<{
    name: string;
    employees: string[];
    focusBehavior: string;
    coachingTip: string;
  }>;
  recommendedActionTimeline: string;
}

const MOCK_METRICS_CSV = `Employee,RPH,Memberships,CreditCards,WarrantyAttach,Surveys
Jordan,1120,4.2%,6,14.5%,12
Victor,1420,12.5%,11,5.2%,4
Daniel,1350,2.1%,8,7.5%,8
Marcus,980,5.0%,9,11.5%,6
Taylor,880,1.8%,3,6.2%,3
Corey,740,4.5%,5,12.2%,15`;

const EMPTY_ARR: Employee[] = [];
const EMPTY_OBJ = {};

export default function RosterAuditor() {
  const apiKey = useStore((state) => state.apiKey);
  const playbookSettings = useStore((state) => state.playbookSettings);
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const roster = rosterHistory[activePeriod] || EMPTY_ARR;

  const [inputText, setInputText] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleLoadDemo = () => {
    // Generate simple CSV from active roster if available, otherwise fallback to mock CSV
    if (roster && roster.length > 0) {
      let csv = "Employee,RPH,Memberships,CreditCards,WarrantyAttach,Surveys\n";
      roster.forEach((emp: Employee) => {
        csv += `${emp.name},${emp.rph || 0},${emp.memberships || 0}%,${emp.creditCards || 0},${emp.warranty || 0}%,${emp.surveys || 0}\n`;
      });
      setInputText(csv);
    } else {
      setInputText(MOCK_METRICS_CSV);
    }
    setAuditResult(null);
  };

  const handleRunAudit = async () => {
    if (!playbookSettings) {
      alert("Please configure playbook settings first.");
      return;
    }
    if (!inputText.trim()) {
      alert("Please paste performance metrics data first!");
      return;
    }
    setIsAuditing(true);
    
    try {
      const result = await auditPerformanceWorkbookGemini(apiKey, inputText, playbookSettings);
      if (!isMounted.current) return;
      setAuditResult(result as AuditResult);
    } catch (e) {
      if (!isMounted.current) return;
      console.error(e);
      alert('An error occurred during performance audit.');
    } finally {
      if (isMounted.current) setIsAuditing(false);
    }
  };

  return (
    <div className="mt-md gap-2xl grid md:grid-cols-[1.2fr_1fr]" data-testid="roster-auditor">
      
      {/* Left Column: Data Input */}
      <div className="glass-card flex flex-col gap-lg">
        <div>
          <h2 className="flex items-center gap-sm mb-sm text-xl">
            <BarChart3 color="var(--bby-blue)" size={22} /> Roster Workbook Auditor
          </h2>
          <p className="text-secondary text-sm">
            Copy and paste your monthly store metrics report or roster performance workbook. Gemini will automatically group employees by performance opportunities and draft coaching playbooks.
          </p>
        </div>

        <div className="form-group flex-1 flex flex-col m-0">
          <label className="form-label flex justify-between items-center">
            <span>Metrics CSV / Tabular Text:</span>
            <button 
              className="btn btn-secondary cursor-pointer px-sm py-xs text-xs h-auto" 
              onClick={handleLoadDemo}
              data-testid="load-demo-data-btn"
            >
              Load Active Roster Data
            </button>
          </label>
          <textarea 
            className="form-control flex-1 font-mono text-sm leading-relaxed resize-none bg-black/20"
            rows={10}
            placeholder={`Example:\nEmployee,RPH,Memberships,CreditCards,WarrantyAttach,Surveys\nJordan,1120,4.2%,6,14.5%,12\nVictor,1420,12.5%,11,5.2%,4`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            data-testid="metrics-input-textarea"
          />
        </div>

        <button 
          className="btn btn-accent cursor-pointer w-full" 
          onClick={handleRunAudit} 
          disabled={isAuditing || !inputText.trim()}
          data-testid="run-audit-btn"
        >
          {isAuditing ? (
            <div className="flex items-center gap-sm justify-center">
              <RefreshCw size={14} className="typing-dots animate-spin" /> Conducting Deep KPI Audit...
            </div>
          ) : (
            <div className="flex items-center gap-sm justify-center">
              <Sparkles size={16} /> Audit Performance Workbook
            </div>
          )}
        </button>
      </div>

      {/* Right Column: AI Performance Reports & Clusters */}
      <div className="flex flex-col gap-lg">
        
        {isAuditing && (
          <div className="glass-card flex-1 flex flex-col gap-xl justify-center p-2xl">
            <div className="skeleton-pulse h-6 w-[60%] bg-white/10 rounded-md"></div>
            <div className="skeleton-pulse h-3.5 w-[95%] bg-white/5 rounded"></div>
            <div className="skeleton-pulse h-3.5 w-[85%] bg-white/5 rounded"></div>
            <div className="skeleton-pulse h-3.5 w-[50%] bg-white/5 rounded"></div>
            <div className="flex flex-col items-center gap-sm text-secondary mt-xl">
              <Sparkles size={24} className="typing-dots text-bby-yellow" />
              <span className="text-xs font-semibold">Gemini is clustering gaps and designing huddles...</span>
            </div>
          </div>
        )}

        {!isAuditing && !auditResult && (
          <div className="glass-card flex-1 flex flex-col items-center justify-center text-center p-3xl text-muted">
            <AlertCircle size={36} className="mb-md" />
            <p className="text-sm">Paste metrics and click audit to generate groupings, top performers, and weekly huddle blueprints.</p>
          </div>
        )}

        {!isAuditing && auditResult && (
          <div className="glass-card flex-1 flex flex-col gap-lg overflow-y-auto max-h-[600px]" data-testid="audit-results-container">
            <div>
              <h3 className="flex items-center gap-sm mb-sm text-lg">
                <FileText size={18} color="var(--info)" /> Performance Workbook Analysis
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                {auditResult.overallSummary}
              </p>
            </div>

            {/* Top Performers */}
            <div className="border-glass pt-md border-t">
              <span className="uppercase block mb-sm text-xs text-bby-yellow font-bold">
                ⭐ Top Performers & Success Callouts
              </span>
              <div className="flex flex-col gap-xs">
                {auditResult?.topPerformers?.map((perf, idx) => (
                  <div key={idx} className="flex gap-xs items-center text-primary text-sm">
                    <div className="w-1 h-1 rounded-full bg-bby-yellow" />
                    {perf}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Gap Clusters */}
            <div className="border-glass pt-md border-t">
              <span className="uppercase block mb-md text-xs text-info font-bold">
                👥 Roster Skill Gap Clustering
              </span>
              <div className="flex flex-col gap-md">
                {auditResult?.gapClusters?.map((cluster, idx) => (
                  <div key={idx} className="flex flex-col gap-sm p-md bg-white/5 border border-[var(--border-glass)] rounded-xl">
                    <div className="flex justify-between items-center flex-wrap gap-xs">
                      <span className="text-sm font-bold text-white">{cluster?.name}</span>
                      <span className="text-secondary text-xs bg-white/5 px-sm py-xs rounded-md">
                        {cluster?.employees?.join(', ') || ''}
                      </span>
                    </div>
                    <div className="text-sm text-secondary">
                      <strong>Target Behavior:</strong> {cluster?.focusBehavior}
                    </div>
                    <div className="text-sm text-secondary border-l-2 border-info pl-sm italic mt-xs">
                      <strong>Leader Huddle Coaching Tip:</strong> {cluster?.coachingTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Timeline */}
            <div className="border-glass pt-md border-t">
              <span className="uppercase block mb-xs text-xs text-muted font-bold">
                📅 Leadership Execution Roadmap
              </span>
              <p className="text-sm text-secondary leading-relaxed">
                {auditResult?.recommendedActionTimeline}
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
