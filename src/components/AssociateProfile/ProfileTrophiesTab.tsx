import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Award, Star, ShieldCheck, CreditCard, AlertTriangle, CheckCircle, FileText, Loader2, Sparkles } from 'lucide-react';
import { renderMarkdown } from '../../utils/profileUtils';
import { Employee, CoachingLog } from '../../types';
import { useStore } from '../../store/useStore';
import { generateActionPlan } from '../../services/ai/geminiCoaching';

interface Trophy {
  type: string;
  category: string;
  date: string;
  icon: string;
}

interface ActionPlan {
  type: string;
  status: string;
  reason: string;
  dateCreated: string;
}

interface GeneratedPlan {
  type: string;
  reason: string;
  planText: string;
}

interface ProfileTrophiesTabProps {
  employee: Employee | null;
  associateLogs: CoachingLog[];
}

export default function ProfileTrophiesTab({ employee, associateLogs }: ProfileTrophiesTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  useEffect(() => {
    setGeneratedPlan(null);
    setIsGenerating(false);
  }, [employee?.id]);

  const onGenerate = async () => {
    if (!employee) return;
    setIsGenerating(true);
    try {
      const apiKey = useStore.getState().apiKey;
      const plan = await generateActionPlan(employee, associateLogs, apiKey);
      if (plan) {
        setGeneratedPlan(plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!employee) return null;

  const trophies = employee.trophies || [];
  const actionPlans = employee.actionPlans || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Star size={24} color="var(--bby-yellow)" fill="var(--bby-yellow)" />;
      case 'ShieldCheck': return <ShieldCheck size={24} color="var(--success)" />;
      case 'CreditCard': return <CreditCard size={24} color="var(--bby-blue)" />;
      case 'Award': return <Award size={24} color="var(--text-primary)" />;
      default: return <Award size={24} color="var(--bby-yellow)" />;
    }
  };

  return (
    <div className="flex-column gap-xl" data-testid="profile-trophies-tab">
      {/* Trophy Case Section */}
      <div className="glass-card p-lg" data-testid="trophy-case-section">
        <h4 className="text-lg text-white mb-lg flex-row align-center gap-sm font-heading m-0">
          <Award size={20} className="text-bby-yellow" /> The Trophy Case
        </h4>
        
        {trophies.length === 0 ? (
          <div className="p-xl text-center bg-black-alpha-20 rounded-xl" data-testid="empty-trophies">
            <Award size={48} className="mb-md text-white opacity-20" />
            <p className="text-secondary m-0">No trophies earned yet. Start crushing goals on the floor or in the AI Arena!</p>
          </div>
        ) : (
          <div className="target-grid" data-testid="trophies-grid">
            {trophies.map((trophy: Trophy, idx: number) => (
              <div key={`${trophy.type}-${idx}`} className="bg-white-alpha-05 border-glass-strong rounded-xl p-lg flex-column align-center text-center gap-md hover-lift cursor-default" data-testid={`trophy-item-${idx}`}>
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
      <div className="glass-card p-lg alert-card-danger" data-testid="action-plans-section">
        <div className="flex-between align-center mb-lg">
          <h4 className="text-lg m-0 flex-row align-center gap-sm text-white font-heading">
            <AlertTriangle size={20} className="text-error" /> Active Action Plans (PIPs)
          </h4>
          <button 
            className="btn btn-primary btn-sm flex-row align-center gap-sm cursor-pointer"
            onClick={onGenerate}
            disabled={isGenerating}
            data-testid="generate-pip-btn"
          >
            {isGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            {isGenerating ? 'Generating...' : 'Auto-Generate AI Action Plan'}
          </button>
        </div>

        {generatedPlan && (
          <div className="bg-bby-blue-alpha-10 border-glass rounded-xl p-lg mb-lg" data-testid="generated-plan-container">
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
            <div className="markdown-body text-sm text-primary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(generatedPlan.planText)) }} data-testid="generated-plan-markdown" />
            <div className="mt-md flex-end gap-sm">
               <button className="btn btn-primary btn-sm cursor-pointer" data-testid="save-pip-btn">Save as Active PIP</button>
            </div>
          </div>
        )}

        {!generatedPlan && actionPlans.length === 0 ? (
          <div className="p-md bg-success-alpha-15 rounded-lg flex-row align-center gap-sm" data-testid="empty-action-plans">
            <CheckCircle size={20} color="var(--success)" />
            <span className="text-success font-semibold">No active performance improvement plans. Associate is in good standing.</span>
          </div>
        ) : !generatedPlan && (
          <div className="flex-column gap-xl" data-testid="action-plans-list">
            {actionPlans.map((plan: ActionPlan, idx: number) => (
              <div key={`${plan.type}-${idx}`} className="bg-black-alpha-20 border-glass rounded-xl p-lg" data-testid={`action-plan-item-${idx}`}>
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
