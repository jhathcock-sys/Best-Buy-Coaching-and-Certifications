import React, { useState } from 'react';
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
      setAuditResult(result as AuditResult);
    } catch (e) {
      console.error(e);
      alert('An error occurred during performance audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="mt-md gap-2xl" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr' }}>
      
      {/* Left Column: Data Input */}
      <div className="glass-card flex flex-col gap-lg">
        <div>
          <h2 className="flex items-center gap-sm mb-sm" style={{ fontSize: '1.4rem' }}>
            <BarChart3 color="var(--bby-blue)" size={22} /> Roster Workbook Auditor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            Copy and paste your monthly store metrics report or roster performance workbook. Gemini will automatically group employees by performance opportunities and draft coaching playbooks.
          </p>
        </div>

        <div className="form-group flex-1 flex flex-col m-0">
          <label className="form-label flex justify-between items-center">
            <span>Metrics CSV / Tabular Text:</span>
            <button 
              className="btn btn-secondary cursor-pointer" 
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', height: 'auto' }} 
              onClick={handleLoadDemo}
              data-testid="load-demo-data-btn"
            >
              Load Active Roster Data
            </button>
          </label>
          <textarea 
            className="form-control"
            rows={10}
            style={{ 
              flex: 1, 
              fontFamily: 'monospace', 
              fontSize: '0.8rem', 
              lineHeight: 1.4,
              resize: 'none',
              background: 'rgba(0,0,0,0.2)' 
            }}
            placeholder={`Example:\nEmployee,RPH,Memberships,CreditCards,WarrantyAttach,Surveys\nJordan,1120,4.2%,6,14.5%,12\nVictor,1420,12.5%,11,5.2%,4`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            data-testid="metrics-input-textarea"
          />
        </div>

        <button 
          className="btn btn-accent cursor-pointer" 
          style={{ width: '100%' }} 
          onClick={handleRunAudit} 
          disabled={isAuditing || !inputText.trim()}
          data-testid="run-audit-btn"
        >
          {isAuditing ? (
            <div className="flex items-center gap-sm justify-center">
              <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Conducting Deep KPI Audit...
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
          <div className="glass-card flex-1 flex flex-col gap-xl justify-center" style={{ padding: '2rem' }}>
            <div className="skeleton-pulse" style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '95%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '50%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="flex flex-col items-center gap-sm text-secondary" style={{ marginTop: '1.5rem' }}>
              <Sparkles size={24} className="typing-dots" style={{ color: 'var(--bby-yellow)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini is clustering gaps and designing huddles...</span>
            </div>
          </div>
        )}

        {!isAuditing && !auditResult && (
          <div className="glass-card flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} className="mb-md" />
            <p style={{ fontSize: '0.85rem' }}>Paste metrics and click audit to generate groupings, top performers, and weekly huddle blueprints.</p>
          </div>
        )}

        {!isAuditing && auditResult && (
          <div className="glass-card flex-1 flex flex-col gap-lg overflow-y-auto" style={{ maxHeight: '600px' }} data-testid="audit-results-container">
            <div>
              <h3 className="flex items-center gap-sm mb-sm" style={{ fontSize: '1.15rem' }}>
                <FileText size={18} color="var(--info)" /> Performance Workbook Analysis
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {auditResult.overallSummary}
              </p>
            </div>

            {/* Top Performers */}
            <div className="border-glass pt-md" style={{ borderTopWidth: '1px' }}>
              <span className="uppercase block mb-sm" style={{ fontSize: '0.725rem', color: 'var(--bby-yellow)', fontWeight: 700 }}>
                ⭐ Top Performers & Success Callouts
              </span>
              <div className="flex flex-col gap-xs">
                {auditResult?.topPerformers?.map((perf, idx) => (
                  <div key={idx} className="flex gap-xs items-center text-primary" style={{ fontSize: '0.8rem' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--bby-yellow)' }} />
                    {perf}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Gap Clusters */}
            <div className="border-glass pt-md" style={{ borderTopWidth: '1px' }}>
              <span className="uppercase block mb-md" style={{ fontSize: '0.725rem', color: 'var(--info)', fontWeight: 700 }}>
                👥 Roster Skill Gap Clustering
              </span>
              <div className="flex flex-col gap-md">
                {auditResult?.gapClusters?.map((cluster, idx) => (
                  <div key={idx} className="flex flex-col gap-sm" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                    <div className="flex justify-between items-center flex-wrap gap-xs">
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{cluster?.name}</span>
                      <span className="text-secondary" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>
                        {cluster?.employees?.join(', ') || ''}
                      </span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.775rem' }}>
                      <strong>Target Behavior:</strong> {cluster?.focusBehavior}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.775rem', borderLeft: '2px solid var(--info)', paddingLeft: '0.5rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      <strong>Leader Huddle Coaching Tip:</strong> {cluster?.coachingTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Timeline */}
            <div className="border-glass pt-md" style={{ borderTopWidth: '1px' }}>
              <span className="uppercase block mb-xs" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                📅 Leadership Execution Roadmap
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {auditResult?.recommendedActionTimeline}
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
