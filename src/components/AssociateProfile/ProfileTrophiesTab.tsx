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
    <div className="flex-column gap-xl">
      {/* Trophy Case Section */}
      <div className="glass-card p-lg">
        <h4 className="text-lg text-white mb-lg flex-row align-center gap-sm font-heading m-0">
          <Award size={20} className="text-bby-yellow" /> The Trophy Case
        </h4>
        
        {trophies.length === 0 ? (
          <div className="p-xl text-center bg-black-alpha-20 rounded-xl">
            <Award size={48} className="mb-md text-white opacity-20" />
            <p className="text-secondary m-0">No trophies earned yet. Start crushing goals on the floor or in the AI Arena!</p>
          </div>
        ) : (
          <div className="target-grid">
            {trophies.map((trophy, idx) => (
              <div key={idx} className="bg-white-alpha-05 border-glass-strong rounded-xl p-lg flex-column align-center text-center gap-md hover-lift cursor-default">
                <div className="trophy-icon-wrapper flex-center">
                  {getIcon(trophy.icon)}
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-xs">{trophy.type}</div>
                  <div className="text-xs text-bby-yellow">{trophy.category}</div>
                  <div className="text-xs text-muted mt-sm">{trophy.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Plans Section */}
      <div className="glass-card p-lg alert-card-danger">
        <div className="flex-between align-center mb-lg">
          <h4 className="text-lg m-0 flex-row align-center gap-sm text-white font-heading">
            <AlertTriangle size={20} className="text-error" /> Active Action Plans (PIPs)
          </h4>
          <button 
            className="btn btn-primary btn-sm flex-row align-center gap-sm"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            {isGenerating ? 'Generating...' : 'Auto-Generate AI Action Plan'}
          </button>
        </div>

        {generatedPlan && (
          <div className="bg-bby-blue-alpha-10 border-glass rounded-xl p-lg mb-lg">
            <div className="flex-between align-start mb-md">
              <div className="flex-row align-center gap-sm">
                <Sparkles size={18} className="text-bby-blue" />
                <span className="font-bold text-white text-lg">{generatedPlan.type}</span>
              </div>
              <span className="tag-pill tag-pill-active">AI Generated Draft</span>
            </div>
            <p className="text-sm text-secondary mb-md italic">
              {generatedPlan.reason}
            </p>
            <div className="markdown-body text-sm text-primary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(generatedPlan.planText)) }} />
            <div className="mt-md flex-end gap-sm">
               <button className="btn btn-primary btn-sm">Save as Active PIP</button>
            </div>
          </div>
        )}

        {!generatedPlan && actionPlans.length === 0 ? (
          <div className="p-md bg-success-alpha-15 rounded-lg flex-row align-center gap-sm">
            <CheckCircle size={20} color="var(--success)" />
            <span className="text-success font-semibold">No active performance improvement plans. Associate is in good standing.</span>
          </div>
        ) : !generatedPlan && (
          <div className="flex-column gap-xl">
            {actionPlans.map((plan, idx) => (
              <div key={idx} className="bg-black-alpha-20 border-glass rounded-xl p-lg">
                <div className="flex-between align-start mb-sm">
                  <div className="flex-row align-center gap-sm">
                    <FileText size={16} color="var(--error)" />
                    <span className="font-bold text-white">{plan.type}</span>
                  </div>
                  <span className={`tag-pill ${plan.status === 'Active' ? 'bg-error-alpha-20 text-error' : 'bg-success-alpha-15 text-success'}`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-sm text-secondary m-0 mb-md leading-relaxed">
                  <strong>Trigger:</strong> {plan.reason}
                </p>
                <div className="text-xs text-muted">
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
