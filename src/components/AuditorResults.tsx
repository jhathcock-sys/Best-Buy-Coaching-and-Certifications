import { AlertCircle, CheckCircle, FileText, Save, Sparkles, Star } from 'lucide-react';

export default function AuditorResults({
  isAuditing,
  auditResult,
  isSaved,
  handleSaveToLogs
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {isAuditing && (
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem', justifyContent: 'center' }}>
          <div className="skeleton-pulse" style={{ height: '24px', width: '50%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={24} className="typing-dots" style={{ color: 'var(--bby-yellow)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini is auditing customer detractor survey...</span>
          </div>
        </div>
      )}

      {!isAuditing && !auditResult && (
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={36} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.85rem' }}>Upload a survey screenshot or copy customer feedback, then run the audit to generate coaching steps.</p>
        </div>
      )}

      {!isAuditing && auditResult && (
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--info)" /> Audit & Detractor Script
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  color={star <= auditResult.rating ? 'var(--bby-yellow)' : 'var(--text-muted)'}
                  fill={star <= auditResult.rating ? 'var(--bby-yellow)' : 'transparent'}
                />
              ))}
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bby-yellow)', marginLeft: '0.35rem' }}>
                ({auditResult.rating} / 5 Rating)
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Associate Mentioned</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '0.15rem' }}>
                {auditResult.associateName || 'Unknown'}
              </p>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--info)', marginTop: '0.15rem' }}>
                {auditResult.department || 'General Sales'}
              </p>
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--error)', textTransform: 'uppercase', fontWeight: 700 }}>GM Root-Cause Breakdown</span>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
              {auditResult.rootCause}
            </p>
          </div>

          <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 70, 190, 0.04)', border: '1px solid rgba(0, 70, 190, 0.2)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--bby-blue)', textTransform: 'uppercase', fontWeight: 700 }}>GROW Coaching Script</span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', height: 'auto' }} 
                onClick={() => { navigator.clipboard.writeText(auditResult.coachingScript); alert('Coaching script copied!'); }}
              >
                Copy Script
              </button>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#fff', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{auditResult.coachingScript}"
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              Leader Floor Verification Items
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {auditResult.checkItems && auditResult.checkItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '50%', padding: '0.15rem', display: 'inline-flex', marginTop: '0.1rem' }}>
                    <CheckCircle size={10} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }} 
              onClick={handleSaveToLogs}
              disabled={isSaved}
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
