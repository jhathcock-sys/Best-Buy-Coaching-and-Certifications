// @ts-nocheck
import { useState } from 'react';
import { Sparkles, FileText, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auditPerformanceWorkbookGemini } from '../services/ai';

// Mock performance CSV data
const MOCK_METRICS_CSV = `Employee,RPH,Memberships,CreditCards,WarrantyAttach,CSAT
Jordan,1120,4.2%,6,14.5%,4.8
Victor,1420,12.5%,11,5.2%,4.1
Daniel,1350,2.1%,8,7.5%,4.7
Marcus,980,5.0%,9,11.5%,4.6
Taylor,880,1.8%,3,6.2%,4.5
Corey,740,4.5%,5,12.2%,4.8`;

export default function RosterAuditor({ roster }) {
  const { apiKey, playbookSettings } = useApp();
  const [inputText, setInputText] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const handleLoadDemo = () => {
    // Generate simple CSV from active roster if available, otherwise fallback to mock CSV
    if (roster && roster.length > 0) {
      let csv = "Employee,RPH,Memberships,CreditCards,WarrantyAttach,CSAT\n";
      roster.forEach(emp => {
        csv += `${emp.name},${emp.rph || 0},${emp.memberships || 0}%,${emp.creditCards || 0},${emp.warranty || 0}%,${emp.surveys || 0}\n`;
      });
      setInputText(csv);
    } else {
      setInputText(MOCK_METRICS_CSV);
    }
    setAuditResult(null);
  };

  const handleRunAudit = async () => {
    if (!inputText.trim()) {
      alert("Please paste performance metrics data first!");
      return;
    }
    setIsAuditing(true);
    
    try {
      const result = await auditPerformanceWorkbookGemini(apiKey, inputText, playbookSettings);
      setAuditResult(result);
    } catch (e) {
      console.error(e);
      alert('An error occurred during performance audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '1rem' }}>
      
      {/* Left Column: Data Input */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 color="var(--bby-blue)" size={22} /> Roster Workbook Auditor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            Copy and paste your monthly store metrics report or roster performance workbook. Gemini will automatically group employees by performance opportunities and draft coaching playbooks.
          </p>
        </div>

        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Metrics CSV / Tabular Text:</span>
            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', height: 'auto' }} onClick={handleLoadDemo}>
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
            placeholder={`Example:\nEmployee,RPH,Memberships,CreditCards,WarrantyAttach,CSAT\nJordan,1120,4.2%,6,14.5%,4.8\nVictor,1420,12.5%,11,5.2%,4.1`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleRunAudit} disabled={isAuditing || !inputText.trim()}>
          {isAuditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Conducting Deep KPI Audit...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Sparkles size={16} /> Audit Performance Workbook
            </div>
          )}
        </button>
      </div>

      {/* Right Column: AI Performance Reports & Clusters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {isAuditing && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem', justifyContent: 'center' }}>
            <div className="skeleton-pulse" style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '95%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '50%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={24} className="typing-dots" style={{ color: 'var(--bby-yellow)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini is clustering gaps and designing huddles...</span>
            </div>
          </div>
        )}

        {!isAuditing && !auditResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Paste metrics and click audit to generate groupings, top performers, and weekly huddle blueprints.</p>
          </div>
        )}

        {!isAuditing && auditResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FileText size={18} color="var(--info)" /> Performance Workbook Analysis
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {auditResult.overallSummary}
              </p>
            </div>

            {/* Top Performers */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--bby-yellow)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                ⭐ Top Performers & Success Callouts
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {auditResult.topPerformers.map((perf, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--bby-yellow)' }} />
                    {perf}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Gap Clusters */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--info)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
                👥 Roster Skill Gap Clustering
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {auditResult.gapClusters.map((cluster, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{cluster.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>
                        {cluster.employees.join(', ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      <strong>Target Behavior:</strong> {cluster.focusBehavior}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--info)', paddingLeft: '0.5rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      <strong>Leader Huddle Coaching Tip:</strong> {cluster.coachingTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Timeline */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                📅 Leadership Execution Roadmap
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {auditResult.recommendedActionTimeline}
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
