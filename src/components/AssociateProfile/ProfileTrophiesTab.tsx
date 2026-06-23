import React from 'react';
import DOMPurify from 'dompurify';
import { Award, Star, ShieldCheck, CreditCard, AlertTriangle, CheckCircle, FileText, Loader2, Sparkles } from 'lucide-react';
import { renderMarkdown } from '../../utils/profileUtils';

export default function ProfileTrophiesTab({ employee, isGenerating, generatedPlan, onGenerate }) {
  const trophies = employee.trophies || [];
  const actionPlans = employee.actionPlans || [];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Star': return <Star size={24} color="var(--bby-yellow)" fill="var(--bby-yellow)" />;
      case 'ShieldCheck': return <ShieldCheck size={24} color="var(--success)" />;
      case 'CreditCard': return <CreditCard size={24} color="#3b82f6" />;
      case 'Award': return <Award size={24} color="#8b5cf6" />;
      default: return <Award size={24} color="var(--bby-yellow)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Trophy Case Section */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(255,255,255,0.03), transparent)' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <Award size={20} color="var(--bby-yellow)" /> The Trophy Case
        </h4>
        
        {trophies.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <Award size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No trophies earned yet. Start crushing goals on the floor or in the AI Arena!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {trophies.map((trophy, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(0,0,0,0.3)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(255, 230, 0, 0.1)'
                }}>
                  {getIcon(trophy.icon)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{trophy.type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--bby-yellow)' }}>{trophy.category}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{trophy.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Plans Section */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--error)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <AlertTriangle size={20} color="var(--error)" /> Active Action Plans (PIPs)
          </h4>
          <button 
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={isGenerating}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {isGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            {isGenerating ? 'Generating...' : 'Auto-Generate AI Action Plan'}
          </button>
        </div>

        {generatedPlan && (
          <div style={{ 
            background: 'rgba(0, 70, 190, 0.1)', 
            border: '1px solid rgba(0, 70, 190, 0.3)', 
            borderRadius: '10px', 
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--bby-blue)" />
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{generatedPlan.type}</span>
              </div>
              <span className="tag-pill tag-pill-active">AI Generated Draft</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
              {generatedPlan.reason}
            </p>
            <div className="markdown-body" style={{ fontSize: '0.9rem', color: '#ddd' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(generatedPlan.planText)) }} />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
               <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Save as Active PIP</button>
            </div>
          </div>
        )}

        {!generatedPlan && actionPlans.length === 0 ? (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={20} color="var(--success)" />
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>No active performance improvement plans. Associate is in good standing.</span>
          </div>
        ) : !generatedPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {actionPlans.map((plan, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '10px', 
                padding: '1.25rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--error)" />
                    <span style={{ fontWeight: 700, color: '#fff' }}>{plan.type}</span>
                  </div>
                  <span className="tag-pill" style={{ background: plan.status === 'Active' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: plan.status === 'Active' ? 'var(--error)' : 'var(--success)' }}>
                    {plan.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  <strong>Trigger:</strong> {plan.reason}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Generated on {plan.dateCreated}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
